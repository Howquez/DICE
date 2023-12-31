from otree.api import *
import requests

doc = """
Your app description
"""


class C(BaseConstants):
    NAME_IN_URL = 'config'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass

# FUNCTIONS
GET = requests.get
POST = requests.post

# if using Heroku, change this to https://YOURAPP.herokuapp.com
SERVER_URL = 'https://ibt-hsg.herokuapp.com' #'http://localhost:8000'
REST_KEY = ''  # fill this later

def call_api(method, *path_parts, **params) -> dict:
    path_parts = '/'.join(path_parts)
    url = f'{SERVER_URL}/api/{path_parts}/'
    resp = method(url, json=params, headers={'otree-rest-key': REST_KEY})
    if not resp.ok:
        msg = (
            f'Request to "{url}" failed '
            f'with status code {resp.status_code}: {resp.text}'
        )
        raise Exception(msg)
    return resp.json()

# PAGES
class MyPage(Page):
    form_model = 'player'

    @staticmethod
    def live_method(player, data):

        url_param = 'None'
        if data['recruitment_platform'] == 'Prolific':
            url_param = 'PROLIFIC_PID'

        call = call_api(
            POST,
            'sessions',
            session_config_name='oTweet',
            num_participants=data['participant_number'],
            modified_session_config_fields=dict(data_path=data['content_url'],
                                                topics=not data['display_skyscraper'],
                                                url_param=url_param,
                                                survey_link=data['survey_url'],
                                                search_term=data['search_term'],
                                                sort_by=data['sort_by'],
                                                condition_col=data['condition_col'],
                                                briefing=data['briefing']),
        )

        print(call)

        return {player.id_in_group: call}


class Results(Page):
    pass


page_sequence = [MyPage, Results]
