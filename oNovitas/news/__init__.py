from otree.api import *
import pandas as pd
import os
import random
import re
import httplib2



doc = """
Your app description
"""


class C(BaseConstants):
    NAME_IN_URL = 'News'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

    # Page tamplate
    NEWS_ITEM = "news/News_Item.html"


class Subsession(BaseSubsession):
    pass

class Group(BaseGroup):
    pass


class Player(BasePlayer):
    ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    cta = models.BooleanField(doc='indicates whether CTA was clicked or not')
    scroll_sequence = models.LongStringField(doc='tracks the sequence of feed items a participant scrolled through.')


# FUNCTIONS -----
def creating_session(subsession):

    # read data (from seesion config)
    news = read_feed(subsession.session.config['data_path'])
    for player in subsession.get_players():
        player.participant.news = news

    if 'condition' in news.columns:
        feed_conditions = news['condition'].unique()
        for player in subsession.get_players():
            player.feed_condition = random.choice(feed_conditions)

    # set banner ad conditions based on images in directory
    all_files = os.listdir('news/static/img')
    ad_conditions = []
    for file_name in all_files:
        if file_name[0].isalpha() and file_name[1:].lower().endswith('.png'):
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
        news = player.participant.news
        if 'condition' in news.columns:
            news = news[news["condition"] == str(player.feed_condition)]

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



# function that reads data
def read_feed(path):
    if re.match(r'^https?://\S+', path):
        print('URL')
        if 'github' in path:
            news = pd.read_csv(path, sep=';')
        elif 'drive.google.com' in path:
            file_id = path.split('/')[-2]
            download_url = f'https://drive.google.com/uc?id={file_id}'
            news = pd.read_csv(download_url, sep=';')
        else:
            raise ValueError("Unrecognized URL format")
    else:
        news = pd.read_csv(path, sep=';')
    return news


# PAGES
class B_Instructions(Page):
    pass

class C_Feed(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        if player.session.config['show_banners'] & player.session.config['show_cta']:
            return ['scroll_sequence', 'cta']
        else:
            return ['scroll_sequence']

    @staticmethod
    def vars_for_template(player: Player):
        ad = player.ad_condition
        return dict(
            items=player.participant.news.to_dict('index'),
            img_left  = 'img/{}_left.png'.format(ad),
            img_right = 'img/{}_right.png'.format(ad),
        )

page_sequence = [# B_Instructions,
                C_Feed]
