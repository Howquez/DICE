from otree.api import *
import pandas as pd
import numpy as np
import itertools
import re
import os
import random



doc = """
Mimic social media feeds with oTweet.

Author: Hauke Roggenkamp
"""


class C(BaseConstants):
    NAME_IN_URL = 'Twitter'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

    RULES_TEMPLATE = "Twitter/T_Rules.html"
    PRIVACY_TEMPLATE = "Twitter/T_Privacy.html"
    TWEET_TEMPLATE = "Twitter/T_Tweet.html"
    ATTENTION_TEMPLATE = "Twitter/T_Attention_Check.html"
    TOPICS_TEMPLATE = "Twitter/T_Trending_Topics.html"
    BANNER_TEMPLATE = "Twitter/T_Banner_Ads.html"

    N_TWEETS = 40
    FEED_LENGTH = list(range(*{'start':0,'stop':N_TWEETS+1,'step':1}.values()))
    TWEET_LENGTH = list(range(*{'start':0,'stop':N_TWEETS+1,'step':1}.values()))


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')

    # create like count fields
    for i in C.FEED_LENGTH:
        locals()['liked_item_' + str(i)] = models.BooleanField(initial=False, blank=True)
    del i

    # create reply text fields
    for i in C.FEED_LENGTH:
        locals()['reply_to_item_' + str(i)] = models.LongStringField(blank=True)
    del i


# FUNCTIONS -----
def creating_session(subsession):

    # read data (from seesion config)
    df = read_feed(subsession.session.config['data_path'])
    tweets = preprocessing(df)
    for player in subsession.get_players():
        player.participant.tweets = tweets

    # if the file contains any conditions, read them an assign groups to it
    if 'condition' in tweets.columns:
        feed_conditions = tweets['condition'].unique()
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
        if 'condition' in tweets.columns:
            tweets = tweets[tweets["condition"] == str(player.feed_condition)]

        # sort or shuffle data
        sort_by = player.session.config['sort_by']
        if sort_by in tweets.columns:
            tweets = tweets.sort_values(by=sort_by, ascending=False)
        else:
            tweets = tweets.sample(frac=1, random_state=42)  # Set a random_state for reproducibility
            # Reset the index after shuffling
            tweets.reset_index(drop=True, inplace=True)

        # index
        tweets['index'] = range(1, len(tweets) + 1)
        tweets['row'] = range(1, len(tweets) + 1)

        # participant vars
        player.participant.tweets = tweets


# function that checks whether a URL actually exists
h = httplib2.Http()
def check_url_exists(url):
    try:
        resp = h.request(url, 'HEAD')
        return int(resp[0]['status']) < 400
    except Exception:
        return False

# make pictures (if any) visible
def extract_first_url(text):
    urls = re.findall("(?P<url>https?://[\S]+)", str(text))
    if urls:
        return urls[0]
    return None

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

    # subset first rows
    df = df.head(C.N_TWEETS)

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
    df['media'] = df['media'].str.replace("'|,", '')
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

    return df


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
        items = player.participant.tweets['index'].values.tolist()
        items.insert(0, 0)
        return ['liked_item_' + str(n) for n in items] + \
               ['reply_to_item_' + str(n) for n in items]

    @staticmethod
    def vars_for_template(player: Player):
        ad = player.ad_condition
        return dict(
            tweets=player.participant.tweets.to_dict('index'),
            topics=player.session.config['topics'],
            search_term=player.session.config['search_term'],
            banner_img='img/{}_banner.png'.format(ad),
        )

class D_Redirect(Page):

    @staticmethod
    def vars_for_template(player: Player):
        return dict(link=create_redirect(player))

    @staticmethod
    def js_vars(player):
        return dict(link=create_redirect(player))

page_sequence = [A_Intro,
                 B_Briefing,
                 C_Feed,
                 D_Redirect]
