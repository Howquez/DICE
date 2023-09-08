from otree.api import *
import pandas as pd
import os
import random
import httplib2



doc = """
Your app description
"""


class C(BaseConstants):
    NAME_IN_URL = 'News'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

    NEWS_ITEM = "news/News_Item.html"

    N_ITEMS = 40
    FEED_LENGTH = list(range(*{'start':0,'stop':N_ITEMS+1,'step':1}.values()))
    TWEET_LENGTH = list(range(*{'start':0,'stop':N_ITEMS+1,'step':1}.values()))


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    scroll_sequence = models.LongStringField(doc='tracks the sequence of feed items a participant scrolled through.')

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
    url = subsession.session.config['data_url']
    if 'github' in url:
        news = pd.read_csv(url, sep=';')
    elif 'drive.google.com' in url:
        file_id = url.split('/')[-2]
        download_url = f'https://drive.google.com/uc?id={file_id}'
        news = pd.read_csv(download_url, sep=';')
    else:
        raise ValueError("Unrecognized URL format")
    if 'condition' in news.columns:
        feed_conditions = news['condition'].unique()
        for player in subsession.get_players():
            player.feed_condition = random.choice(feed_conditions)

    # set banner ad conditions based on images in directory
    all_files = os.listdir('news/static/pics')
    ad_conditions = []
    for file_name in all_files:
        if file_name[0].isalpha() and file_name[1:].lower().endswith('.png'):
            letter = file_name[0].upper()
            if letter not in ad_conditions:
                ad_conditions.append(letter)

    ad_conditions = list(set(ad_conditions))
    for player in subsession.get_players():
        player.ad_condition = random.choice(ad_conditions)

# function to check whether a URL exists. Not used currently.
h = httplib2.Http()
def check_url_exists(url):
    try:
        resp = h.request(url, 'HEAD')
        return int(resp[0]['status']) < 400
    except Exception:
        return False

# PAGES
class B_Instructions(Page):

    # I need to find a way to deal with '' or "", that is, escape them.

    @staticmethod
    def before_next_page(player, timeout_happened):

        # read data (from seesion config)
        url = player.session.config['data_url']
        if 'github' in url:
            news = pd.read_csv(url, sep=';')
        elif 'drive.google.com' in url:
            file_id = url.split('/')[-2]
            download_url = f'https://drive.google.com/uc?id={file_id}'
            news = pd.read_csv(download_url, sep=';')
        else:
            raise ValueError("Unrecognized URL format")

        # subset data based on condition (if any)
        if 'condition' in news.columns:
            news = news[news["condition"] == player.feed_condition]

        # sort data
        sort_by = player.session.config['sort_by']
        if sort_by in news.columns:
            news = news.sort_values(by=sort_by, ascending=False)
        else:
            news = news.sample(frac=1, random_state=42)  # Set a random_state for reproducibility
            # Reset the index after shuffling
            news.reset_index(drop=True, inplace=True)

        # index
        news['index'] = range(1, len(news) + 1)

        # participant vars
        player.participant.news = news

class C_Feed(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        items = player.participant.news['index'].values.tolist()
        items.insert(0, 0)
        return ['scroll_sequence'] + \
               ['liked_item_' + str(n) for n in items] + \
               ['reply_to_item_' + str(n) for n in items]

    @staticmethod
    def vars_for_template(player: Player):
        ad = player.ad_condition
        return dict(
            items=player.participant.news.to_dict('index'),
            img_left  = 'pics/{}_left.png'.format(ad),
            img_right = 'pics/{}_right.png'.format(ad),
        )

page_sequence = [B_Instructions,
                C_Feed]
