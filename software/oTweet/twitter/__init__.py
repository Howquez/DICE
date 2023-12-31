from otree.api import *
import pandas as pd
import numpy as np
import re
import os
import random
import httplib2
from itertools import cycle




doc = """
Mimic social media feeds with oTweet.

Author: Hauke Roggenkamp
"""


class C(BaseConstants):
    NAME_IN_URL = 'Twitter'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

    RULES_TEMPLATE = "twitter/T_Rules.html"
    PRIVACY_TEMPLATE = "twitter/T_Privacy.html"
    TWEET_TEMPLATE = "twitter/T_Tweet.html"
    ATTENTION_TEMPLATE = "twitter/T_Attention_Check.html"
    TOPICS_TEMPLATE = "twitter/T_Trending_Topics.html"
    BANNER_TEMPLATE = "twitter/T_Banner_Ads.html"

class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    favorable_feed = models.StringField(doc='indicates order of favorbale (1) and unfavorbale (0) tweets')
    sequence = models.StringField(doc='prints the sequence of tweets based on doc_id')

    cta = models.BooleanField(doc='indicates whether CTA was clicked or not')
    scroll_sequence = models.LongStringField(doc='tracks the sequence of feed items a participant scrolled through.')
    viewport_data = models.LongStringField(doc='tracks the time feed items were visible in a participants viewport.')
    likes_data = models.LongStringField(doc='tracks likes.', blank=True)
    replies_data = models.LongStringField(doc='tracks replies.', blank=True)

    completed_survey = models.BooleanField(doc="indicates whether a participant has completed the survey.",
                                           initial=False,
                                           blank=True)


# FUNCTIONS -----
def creating_session(subsession):

    # read data (from seesion config)
    df = read_feed(subsession.session.config['data_path'])
    tweets = preprocessing(df)
    for player in subsession.get_players():
        player.participant.tweets = tweets

    # if the file contains any conditions, read them an assign groups to it
    condition = player.session.config['condition_col']
    if condition in tweets.columns:
        feed_conditions = tweets[condition].unique()
        for player in subsession.get_players():
            player.feed_condition = random.choice(feed_conditions)

    # set banner ad conditions based on images in directory
    all_files = os.listdir('twitter/static/img')
    ad_conditions = []
    for file_name in all_files:
        if file_name[0].isalpha() and file_name[1:].lower().endswith('.png') and file_name[1] == '_':
            letter = file_name[0].upper()
            if letter not in ad_conditions:
                ad_conditions.append(letter)
    ad_conditions = list(set(ad_conditions))
    for player in subsession.get_players():
        player.ad_condition = random.choice(ad_conditions)

    # PREPARE DATA:
    # subset data based on condition (if any)
    # I need to find a way to deal with '' or "", that is, escape them.
    for player in subsession.get_players():
        tweets = player.participant.tweets
        condition = player.session.config['condition_col']
        if condition in tweets.columns:
            tweets = tweets[tweets[condition] == str(player.feed_condition)]

        # sort or shuffle data
        sort_by = player.session.config['sort_by']
        if sort_by in tweets.columns:
            tweets = tweets.sort_values(by=sort_by, ascending=True)
        else:
            tweets = tweets.sample(frac=1, random_state=42)  # Set a random_state for reproducibility
            # Reset the index after shuffling
            tweets.reset_index(drop=True, inplace=True)

        # subset first rows
        # tweets = tweets.head(player.session.config['subset'])

        # index
        tweets['index'] = range(1, len(tweets) + 1)
        tweets['row'] = range(1, len(tweets) + 1)

        # participant vars
        player.participant.tweets = tweets




# make pictures (if any) visible
def extract_first_url(text):
    urls = re.findall("(?P<url>https?://[\S]+)", str(text))
    if urls:
        return urls[0]
    return None

# check urls
h = httplib2.Http()
def check_url_exists(url):
    try:
        resp = h.request(url, 'HEAD')
        return int(resp[0]['status']) < 400
    except Exception:
        return False

# function that reads data
def read_feed(path):
    if re.match(r'^https?://\S+', path):
        if 'github' in path:
            tweets = pd.read_csv(path, sep=';')
        elif 'drive.google.com' in path:
            file_id = path.split('/')[-2]
            download_url = f'https://drive.google.com/uc?id={file_id}'
            tweets = pd.read_csv(download_url, sep=';')
        else:
            raise ValueError("Unrecognized URL format")
    else:
        tweets = pd.read_csv(path, sep=';')
    return tweets

# some pre-processing
def preprocessing(df):
    # reformat date
    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
    df['date'] = df['datetime'].dt.strftime('%d %b').str.replace(' ', '. ')
    df['date'] = df['date'].str.replace('^0', '', regex=True)

    # highlight hashtags, cashtags, mentions, etc.
    df['tweet'] = df['tweet'].str.replace(r'\B(\#[a-zA-Z0-9_]+\b)',
                                                  r'<span class="text-primary">\g<0></span>', regex=True)
    df['tweet'] = df['tweet'].str.replace(r'\B(\$[a-zA-Z0-9_\.]+\b)',
                                                  r'<span class="text-primary">\g<0></span>', regex=True)
    df['tweet'] = df['tweet'].str.replace(r'\B(\@[a-zA-Z0-9_]+\b)',
                                                  r'<span class="text-primary">\g<0></span>', regex=True)
    # remove the href below, if you don't want them to leave your page
    df['tweet'] = df['tweet'].str.replace(
        r'(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])',
        r'<a class="text-primary">\g<0></a>', regex=True)

    # make numeric information integers and fill NAs with 0
    df['replies'] = df['replies'].fillna(0).astype(int)
    df['retweets'] = df['retweets'].fillna(0).astype(int)
    df['likes'] = df['likes'].fillna(0).astype(int)

    df['media'] = df['media'].apply(extract_first_url)
    df['media'] = df['media'].str.replace("'|,", '', regex=True)
    df['pic_available'] = np.where(df['media'].str.match(pat='http'), True, False)

    # create a name icon as a profile pic
    df['icon'] = df['username'].str[:2]
    df['icon'] = df['icon'].str.title()

    # make sure user descriptions do not entail any '' or "" as this complicates visualization
    # also replace nan with some whitespace
    df['user_description'] = df['user_description'].str.replace("'", '')
    df['user_description'] = df['user_description'].str.replace('"', '')
    df['user_description'] = df['user_description'].fillna(' ')

    # make number of followers a formatted string
    df['user_followers'] = df['user_followers'].map('{:,.0f}'.format).str.replace(',', '.')

    # check profile image urls
    # df['profile_pic_available'] = df['user_image'].apply(
        # lambda x: check_url_exists(x) if pd.notnull(x) else False)
    df['profile_pic_available'] = False

    return df


def create_redirect(player):
    if player.participant.label:
        link = player.session.config['survey_link'] + '?' + player.session.config['url_param'] + '=' + player.participant.label
    else:
        link = player.session.config['survey_link'] + '?' + player.session.config['url_param'] + '=' + player.participant.code

    completion_code = None

    # if 'prolific_completion_url' in player.session.config and player.session.config['prolific_completion_url'] is not None:
        # completion_code = player.session.config['prolific_completion_url'][-8:]

    if 'completion_code' in player.session.vars:
        if player.session.vars['completion_code'] is not None:
            link = link + '&' + 'cc=' + player.session.vars['completion_code']

    return link


# PAGES
class A_Intro(Page):
    pass

class B_Briefing(Page):
    form_model = 'player'

    @staticmethod
    def is_displayed(player):
        return len(player.session.config['briefing']) > 0


class C_Feed(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        fields =  ['likes_data', 'replies_data']

        if not player.session.config['topics'] & player.session.config['show_cta']:
            more_fields =  ['scroll_sequence', 'viewport_data', 'cta']
        else:
            more_fields =  ['scroll_sequence', 'viewport_data']

        return fields + more_fields

    @staticmethod
    def vars_for_template(player: Player):
        ad = player.ad_condition
        return dict(
            tweets=player.participant.tweets.to_dict('index'),
            topics=player.session.config['topics'],
            search_term=player.session.config['search_term'],
            banner_img='img/{}_banner.png'.format(ad),
        )

    @staticmethod
    def live_method(player, data):
        parts = data.split('=')
        variable_name = parts[0].strip()
        value = eval(parts[1].strip())

        # Use getattr to get the current value of the attribute within the player object
        current_value = getattr(player, variable_name, 0)

        # Perform the addition assignment and update the attribute within the player object
        setattr(player, variable_name, current_value + value)

    @staticmethod
    def before_next_page(player, timeout_happened):
        player.participant.finished = True
        player.completed_survey = player.participant.finished
        if 'prolific_completion_url' in player.session.vars:
            if player.session.vars['prolific_completion_url'] is not None:
                player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete?cc=' + player.session.vars['completion_code']
            else:
                player.session.vars['prolific_completion_url'] = 'NA'
        else:
            player.session.vars['prolific_completion_url'] = 'NA'

class D_Redirect(Page):

    @staticmethod
    def is_displayed(player):
        return len(player.session.config['survey_link']) > 0

    @staticmethod
    def vars_for_template(player: Player):
        return dict(link=create_redirect(player))

    @staticmethod
    def js_vars(player):
        return dict(link=create_redirect(player))

class D_Debrief(Page):

    @staticmethod
    def is_displayed(player):
        return len(player.session.config['survey_link']) == 0

page_sequence = [A_Intro,
                 B_Briefing,
                 C_Feed,
                 D_Redirect,
                 D_Debrief]
