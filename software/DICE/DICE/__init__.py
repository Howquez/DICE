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
    TOPICS_TEMPLATE = "DICE/T_Trending_Topics.html"
    BANNER_TEMPLATE = "DICE/T_Banner_Ads.html"

    ITEM_TWITTER = "DICE/T_Item_Twitter.html"
    ITEM_LINKEDIN = "DICE/T_Item_Linkedin.html"
    ITEM_MASS_MEDIA = "DICE/T_Item_Mass_Media.html"
    ITEM_GENERIC = "DICE/T_Item_Generic.html"

class Subsession(BaseSubsession):
    feed_conditions = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    FEED = models.StringField(doc='')

class Group(BaseGroup):
    pass


class Player(BasePlayer):
    # ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    sequence = models.StringField(doc='prints the sequence of tweets based on doc_id')

    # cta = models.BooleanField(doc='indicates whether CTA was clicked or not')
    scroll_sequence = models.LongStringField(doc='tracks the sequence of feed items a participant scrolled through.')
    viewport_data = models.LongStringField(doc='tracks the time feed items were visible in a participants viewport.')
    rowheight_data = models.LongStringField(doc='tracks the time feed items were visible in a participants viewport.')
    likes_data = models.LongStringField(doc='tracks likes.', blank=True)
    replies_data = models.LongStringField(doc='tracks replies.', blank=True)

    touch_capability = models.BooleanField(doc="indicates whether a participant uses a touch device to access survey.",
                                           blank=True)
    device_type = models.StringField(doc="indicates the participant's device type based on screen width.",
                                           blank=True)



# FUNCTIONS -----
def creating_session(subsession):
    subsession.FEED = "DICE/T_Feed_" + subsession.session.config['channel_type'] + ".html"

    # Load and preprocess data once but shuffle and assign for each player
    df = read_feed(path=subsession.session.config['data_path'], delim=subsession.session.config['delimiter'])
    processed_tweets = preprocessing(df, subsession.session.config)

    # Check if the file contains any conditions and assign groups to it
    condition = subsession.session.config['condition_col']
    if condition in processed_tweets.columns:
        feed_conditions = processed_tweets[condition].unique()
        subsession.feed_conditions = str(feed_conditions)

    for player in subsession.get_players():
        # Deep copy the DataFrame to ensure each player gets a unique shuffled version
        tweets = processed_tweets.copy()

        # Assign a condition to the player if conditions are present
        if condition in tweets.columns:
            player.feed_condition = random.choice(feed_conditions)
            # Optionally filter tweets based on the assigned condition here
            # tweets = tweets[tweets[condition] == player.feed_condition]

        # Ensure the random number generator's seed is different for each player if needed
        # np.random.seed()  # Optionally reset the seed for true randomness

        # Check for unique commented post
        commented_post_exists = (tweets['commented_post'] == 1).sum() == 1

        # Conditional update of sequence if there is a unique commented post and sequence is 1
        tweets.loc[(tweets['sequence'] == 1) & (tweets['commented_post'] == 0), 'sequence'] = \
            np.where(commented_post_exists, np.nan, 1)

        # Set sequence to 1 for the row where commented_post is 1
        tweets.loc[tweets['commented_post'] == 1, 'sequence'] = 1

        # Generate ranks and exclude used ranks
        ranks = np.arange(1, len(tweets) + 1)
        available_ranks = ranks[~np.isin(ranks, tweets['sequence'].dropna())]

        # Randomly sample available ranks to fill missing sequence values
        np.random.shuffle(available_ranks)
        missing_indices = tweets['sequence'].isnull()
        tweets.loc[missing_indices, 'sequence'] = available_ranks[:sum(missing_indices)]

        # Sort DataFrame by sequence
        tweets.sort_values(by='sequence', inplace=True)

        # Assign processed tweets to player-specific variable
        player.participant.tweets = tweets

        # Record the sequence for each player
        player.sequence = ', '.join(map(str, tweets['doc_id'].tolist()))
        print(player.sequence)




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
def read_feed(path, delim):
    if re.match(r'^https?://\S+', path):
        if 'github' in path:
            tweets = pd.read_csv(path, sep = delim)
        elif 'drive.google.com' in path:
            file_id = path.split('/')[-2]
            download_url = f'https://drive.google.com/uc?id={file_id}'
            tweets = pd.read_csv(download_url, sep = delim)
        else:
            raise ValueError("Unrecognized URL format")
    else:
        tweets = pd.read_csv(path, sep = delim)
    return tweets

# Function to check if a URL exists in the text
def is_url(s):
    return bool(re.match(r'^https?:\/\/', str(s)))

# some pre-processing
def preprocessing(df, config):
    # reformat date
    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce', format='%d.%m.%y %H:%M')
    df['date'] = df['datetime'].dt.strftime('%d %b').str.replace(' ', '. ')
    df['date'] = df['date'].str.lstrip('0')
    df['formatted_datetime'] = df['datetime'].dt.strftime('%I:%M %p · %b %d, %Y')

    # highlight hashtags, cashtags, mentions, etc.
    df['text'] = df['text'].str.replace(r'\B(\#[a-zA-Z0-9_]+\b)',
                                                  r'<span class="text-primary">\g<0></span>', regex=True)
    df['text'] = df['text'].str.replace(r'\B(\$[a-zA-Z0-9_\.]+\b)',
                                                  r'<span class="text-primary">\g<0></span>', regex=True)
    df['text'] = df['text'].str.replace(r'\B(\@[a-zA-Z0-9_]+\b)',
                                                  r'<span class="text-primary">\g<0></span>', regex=True)
    # remove the href below, if you don't want them to leave your page
    df['text'] = df['text'].str.replace(
        r'(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])',
        r'<a class="text-primary">\g<0></a>', regex=True)

    # make numeric information integers and fill NAs with 0
    df['replies'] = df['replies'].fillna(0).astype(int)
    df['reposts'] = df['reposts'].fillna(0).astype(int)
    df['likes'] = df['likes'].fillna(0).astype(int)

    # df['media'] = df['media'].apply(extract_first_url)
    df['media'] = df['media'].str.replace("'|,", '', regex=True)
    df['pic_available'] = np.where(df['media'].str.contains('http', na=False), True, False)
    # print(df[['pic_available', 'media']])

    # create a name icon as a profile pic
    df['profile_pic_available'] = df['user_image'].apply(is_url)
    df['icon'] = df['username'].str[:2].str.title()

    # Assign a random color class from a predefined list
    color_classes = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
    df['color_class'] = np.random.choice(color_classes, size=len(df))

    # make sure user descriptions do not entail any '' or "" as this complicates visualization
    # also replace nan with some whitespace
    df['user_description'] = df['user_description'].str.replace("'", '')
    df['user_description'] = df['user_description'].str.replace('"', '')
    df['user_description'] = df['user_description'].fillna(' ')

    # make number of followers a formatted string
    df['user_followers'] = df['user_followers'].map('{:,.0f}'.format).str.replace(',', '.')

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

    if player.feed_condition is not None:
        link = link + '&' + 'condition=' + player.feed_condition

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
            more_fields =  ['scroll_sequence', 'viewport_data', "rowheight_data"] # , 'cta']
        else:
            more_fields =  ['scroll_sequence', 'viewport_data', "rowheight_data"]

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
                 C_Feed,
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
