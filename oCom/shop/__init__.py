from otree.api import *
import pandas as pd
import os
import random
import re
import httplib2

doc = """
Mimic shop feeds with oCom.

Author: Hauke Roggenkamp
"""


class C(BaseConstants):
    NAME_IN_URL = 'shop'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

    PRODUCT_ITEM = "shop/Product_Item.html"


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    ad_condition = models.StringField(doc='indicates the ad condition a player is randomly assigned to')
    feed_condition = models.StringField(doc='indicates the feed condition a player is randomly assigned to')
    scroll_sequence = models.LongStringField(doc='tracks the sequence of feed items a participant scrolled through.')
    add_to_cart = models.StringField(doc='which models have been added to the cart?', initial='0')


# FUNCTIONS -----
def creating_session(subsession):

    # read data (from seesion config)
    products = read_feed(subsession.session.config['data_path'])
    for player in subsession.get_players():
        player.participant.products = products

    if 'condition' in products.columns:
        feed_conditions = products['condition'].unique()
        for player in subsession.get_players():
            player.feed_condition = random.choice(feed_conditions)

    # set banner ad conditions based on images in directory
    all_files = os.listdir('shop/static/img')
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
            products = player.participant.products
            if 'condition' in products.columns:
                products = products[products["condition"] == str(player.feed_condition)]

            # sort data
            sort_by = player.session.config['sort_by']
            if sort_by in products.columns:
                products = products.sort_values(by=sort_by, ascending=False)
            else:
                products = products.sample(frac=1, random_state=42)  # Set a random_state for reproducibility
                # Reset the index after shuffling
                products.reset_index(drop=True, inplace=True)

            # index
            products['index'] = range(1, len(products) + 1)

            # participant vars
            player.participant.products = products


# function that reads data
def read_feed(path):
    # read data (from seesion config)
    if re.match(r'^https?://\S+', path):
        print('URL')
        if 'github' in path:
            products = pd.read_csv(path, sep=';')
        elif 'drive.google.com' in path:
            file_id = path.split('/')[-2]
            download_url = f'https://drive.google.com/uc?id={file_id}'
            products = pd.read_csv(download_url, sep=';')
        else:
            raise ValueError("Unrecognized URL format")
    else:
        products = pd.read_csv(path, sep=';')
    return products


# function to check whether a URL exists. Not used currently.
h = httplib2.Http()
def check_url_exists(url):
    try:
        resp = h.request(url, 'HEAD')
        return int(resp[0]['status']) < 400
    except Exception:
        return False

# PAGES
class A_Intro(Page):
    pass


class B_Briefing(Page):
    form_model = 'player'

    @staticmethod
    def is_displayed(player):
        len(player.session.config['briefing']) > 0

class C_Feed(Page):
    form_model = 'player'
    form_fields = ['scroll_sequence']

    @staticmethod
    def live_method(player, item):
        if int(item) < 0:
            player.add_to_cart = player.add_to_cart + item
        else:
            player.add_to_cart = player.add_to_cart + '+' + item
            products = player.participant.products
            price = float(products.loc[products['doc_id'] == int(item), 'price'].values[0])
            product = products.loc[products['doc_id'] == int(item), 'product_name'].values[0]
            return {player.id_in_group: [product, price]}

    @staticmethod
    def vars_for_template(player: Player):
        ad = player.ad_condition
        return dict(
            items=player.participant.products.to_dict('index'),
            img_left  = 'img/{}_left.png'.format(ad),
            img_right = 'img/{}_right.png'.format(ad),
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
