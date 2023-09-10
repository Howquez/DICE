from os import environ

SESSION_CONFIGS = [
    dict(
        name='News',
        app_sequence=['news'],
        num_demo_participants=3,
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
    newspaper_name = 'The Daily News',
    data_path = 'news/static/data/news.csv', #'https://raw.githubusercontent.com/Howquez/oNovitas/main/otree/news/static/data/news.csv',
    sort_by = 'time_stamp',
    show_banners = True,
    creative_left = 'https://github.com/Howquez/oNovitas/blob/main/otree/news/static/ad-image-3.png',
    copy_left = '50M Jobseekers. <br><br> 150+ Job Boards.',
    creative_right = 'https://github.com/Howquez/oNovitas/blob/main/otree/news/static/ad-image-4.png',
    copy_right = 'One Click.',
    show_cta = True,
    cta_text = 'Post Jobs Free',
    landing_page = 'https://your-link-here.com',
)

PARTICIPANT_FIELDS = ['news', 'finished']
SESSION_FIELDS = ['prolific_completion_url']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = '8744261096089'
