from otree.api import *
import pandas as pd
import numpy as np
import re
import os
import random
import httplib2
from itertools import cycle




doc = """
Mimic social media feeds with DICE.
"""


class C(BaseConstants):
    NAME_IN_URL = 'DICE'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

    RULES_TEMPLATE = "DICE/T_Rules.html"
    PRIVACY_TEMPLATE = "DICE/T_Privacy.html"
    TWEET_TEMPLATE = "DICE/T_Tweet.html"
    LINKEDIN_TEMPLATE = "DICE/T_Linkedin_Post.html"
    ATTENTION_TEMPLATE = "DICE/T_Attention_Check.html"
    TOPICS_TEMPLATE = "DICE/T_Trending_Topics.html"
    BANNER_TEMPLATE = "DICE/T_Banner_Ads.html"

class Subsession(BaseSubsession):
    feed_conditions = models.StringField(doc='indicates the feed condition a player is randomly assigned to')

class Group(BaseGroup):
    pass


class Player(BasePlayer):
    # ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    sequence = models.StringField(doc='prints the sequence of tweets based on doc_id')

    # cta = models.BooleanField(doc='indicates whether CTA was clicked or not')
    scroll_sequence = models.LongStringField(doc='tracks the sequence of feed items a participant scrolled through.')
    viewport_data = models.LongStringField(doc='tracks the time feed items were visible in a participants viewport.')
    likes_data = models.LongStringField(doc='tracks likes.', blank=True)
    replies_data = models.LongStringField(doc='tracks replies.', blank=True)

    touch_capability = models.BooleanField(doc="indicates whether a participant uses a touch device to access survey.",
                                           blank=True)
    device_type = models.StringField(doc="indicates the participant's device type based on screen width.",
                                           blank=True)



# FUNCTIONS -----
def creating_session(subsession):

    # read data (from seesion config)
    df = read_feed(subsession.session.config['data_path'])
    tweets = preprocessing(df, subsession.session.config)
    for player in subsession.get_players():
        player.participant.tweets = tweets

    # if the file contains any conditions, read them an assign groups to it
    condition = subsession.session.config['condition_col']
    if condition in tweets.columns:
        feed_conditions = tweets[condition].unique()
        subsession.feed_conditions = str(feed_conditions)
        for player in subsession.get_players():
            player.feed_condition = random.choice(feed_conditions)

    # set banner ad conditions based on images in directory
    # all_files = os.listdir('twitter/static/img')
    # ad_conditions = []
    # for file_name in all_files:
    #     if file_name[0].isalpha() and file_name[1:].lower().endswith('.png') and file_name[1] == '_':
    #         letter = file_name[0].upper()
    #         if letter not in ad_conditions:
    #             ad_conditions.append(letter)
    # ad_conditions = list(set(ad_conditions))
    # for player in subsession.get_players():
    #     player.ad_condition = random.choice(ad_conditions)

    # PREPARE DATA:
    # subset data based on condition (if any)
    for player in subsession.get_players():

        # I pushed the randomization to the player level using before_next_page on the A_Intro page.
        # this approach relies on the feed_conditions subsession variable defined above.
        # the randomization is deployed in the T_Tweet.html template.

        # tweets = player.participant.tweets
        # condition = player.session.config['condition_col']
        # if condition in tweets.columns:
        #     tweets = tweets[tweets[condition] == str(player.feed_condition)]

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

        # sequence
        player.sequence = ', '.join(map(str, tweets['doc_id'].tolist()))




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
def preprocessing(df, config):
    # reformat date
    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
    df['date'] = df['datetime'].dt.strftime('%d %b').str.replace(' ', '. ')
    # df['date'] = df['datetime'].dt.strftime('%b. %d')
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
    df['profile_pic_available'] = True

    # Check if 'condition_col' is set and not empty, and if it's an existing column in df
    if ('condition_col' in config and
            config['condition_col'] and
            config['condition_col'] in df.columns):
        # Rename the specified column to 'condition'
        df.rename(columns={config['condition_col']: 'condition'}, inplace=True)

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
    form_model = 'player'
    @staticmethod
    def before_next_page(player, timeout_happened):
        feed_conditions_str = player.subsession.feed_conditions
        feed_conditions_list = feed_conditions_str.strip("[]").split()
        random_condition = random.choice(feed_conditions_list)
        cleaned_condition = random_condition.strip("'")
        player.feed_condition = cleaned_condition

        # update sequence
        df = player.participant.tweets
        tweets = df[df['condition'] == cleaned_condition]
        player.sequence = ', '.join(map(str, tweets['doc_id'].tolist()))

class B_Briefing(Page):
    form_model = 'player'

    @staticmethod
    def is_displayed(player):
        return len(player.session.config['briefing']) > 0


class C_Feed(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        fields =  ['likes_data', 'replies_data', 'touch_capability', 'device_type']

        if not player.session.config['topics'] & player.session.config['show_cta']:
            more_fields =  ['scroll_sequence', 'viewport_data'] # , 'cta']
        else:
            more_fields =  ['scroll_sequence', 'viewport_data']

        return fields + more_fields

    @staticmethod
    def vars_for_template(player: Player):
        # ad = player.ad_condition
        label_available = False
        if player.participant.label is not None:
            label_available = True
        return dict(
            tweets=player.participant.tweets.to_dict('index'),
            topics=player.session.config['topics'],
            search_term=player.session.config['search_term'],
            label_available=label_available,
            # banner_img='img/{}_banner.png'.format(ad),
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
        if 'prolific_completion_url' in player.session.vars:
            if player.session.vars['prolific_completion_url'] is not None:
                if 'completion_code' in player.session.vars:
                    if player.session.vars['completion_code'] is not None:
                        player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete?cc=' + player.session.vars['completion_code']
                    else:
                        player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete'
                else: player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete'
            else:
                player.session.vars['prolific_completion_url'] = 'NA'
        else:
            player.session.vars['prolific_completion_url'] = 'NA'


class C_Linkedin(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        fields =  ['likes_data', 'replies_data', 'touch_capability', 'device_type']

        if not player.session.config['topics'] & player.session.config['show_cta']:
            more_fields =  ['scroll_sequence', 'viewport_data'] # , 'cta']
        else:
            more_fields =  ['scroll_sequence', 'viewport_data']

        return fields + more_fields

    @staticmethod
    def vars_for_template(player: Player):
        # ad = player.ad_condition
        label_available = False
        if player.participant.label is not None:
            label_available = True
        return dict(
            tweets=player.participant.tweets.to_dict('index'),
            topics=player.session.config['topics'],
            search_term=player.session.config['search_term'],
            label_available=label_available,
            # banner_img='img/{}_banner.png'.format(ad),
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
        if 'prolific_completion_url' in player.session.vars:
            if player.session.vars['prolific_completion_url'] is not None:
                if 'completion_code' in player.session.vars:
                    if player.session.vars['completion_code'] is not None:
                        player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete?cc=' + player.session.vars['completion_code']
                    else:
                        player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete'
                else: player.session.vars['prolific_completion_url'] = 'https://app.prolific.com/submissions/complete'
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
                 C_Linkedin,
                 D_Redirect,
                 D_Debrief]


def custom_export(players):
    # header row
    yield ['session', 'participant_code', 'participant_label', 'participant_in_session', 'condition', 'item_sequence',
           'scroll_sequence', 'item_dwell_time', 'likes', 'replies']
    for p in players:
        participant = p.participant
        session = p.session
        yield [session.code, participant.code, participant.label, p.id_in_group, p.feed_condition, p.sequence,
               p.scroll_sequence, p.viewport_data, p.likes_data, p.replies_data]
