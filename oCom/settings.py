from os import environ

SESSION_CONFIGS = [
    dict(
        name='oCom',
        app_sequence=['shop'],
        num_demo_participants=2,
    ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00,
    participation_fee=2.10,
    survey_link = '',
    url_param = 'PROLIFIC_PID',
    briefing = '<h5>This could be your briefing</h5><p>Use HTML syntax to format your content to your liking.</p>',
    data_path='shop/static/data/flowers.csv', # 'https://raw.githubusercontent.com/Howquez/oNovitas/main/otree/news/static/data/news.csv',
    sort_by='time_stamp',
    shop_name='The Tulip Tribe',

)

PARTICIPANT_FIELDS = ['data', 'posts', 'news', 'products', 'unique_categories', 'finished']
SESSION_FIELDS = ['prolific_completion_url']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = False

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = '8744261096089'
