from otree.api import *
import pandas as pd
import numpy as np
import itertools
import re
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
    treatment = models.StringField(doc='indicates the treatment a player is randomly assigned to')
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
    shuffle = itertools.cycle(['neutral', 'treatment'])
    for player in subsession.get_players():
        player.treatment = next(shuffle)

def creating_session(subsession):
    shuffle = itertools.cycle(['clean', 'polluted'])
    for player in subsession.get_players():
        player.treatment = next(shuffle)

h = httplib2.Http()

def check_url_exists(url):
    try:
        resp = h.request(url, 'HEAD')
        return int(resp[0]['status']) < 400
    except Exception:
        return False

# PAGES
class B_Instructions(Page):

    @staticmethod
    def before_next_page(player, timeout_happened):
        # read data
        news = pd.read_csv('news/static/news.csv', sep=';')

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
        return dict(
            items=player.participant.news.to_dict('index')
        )

page_sequence = [B_Instructions,
                C_Feed]
