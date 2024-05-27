from os import environ

SESSION_CONFIGS = [
    dict(
        name='Twitter',
        app_sequence=['DICE'],
        num_demo_participants=3,
        channel_type="Twitter",
    ),
    dict(
        name='Linkedin_beta',
        app_sequence=['DICE'],
        num_demo_participants=3,
        channel_type="Linkedin",
    ),
    dict(
        name='Generic_beta',
        app_sequence=['DICE'],
        num_demo_participants=3,
        channel_type="Generic",
    )
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00,
    participation_fee=0,
    title = '',
    full_name = '',
    eMail = '',
    study_name = 'A study about ice cream',
    channel_type = 'Twitter_Profile',
    survey_link = 'https://your-link-here.com',
    url_param = 'PROLIFIC_PID',
    briefing = '', # '<h5>This could be your briefing</h5><p>Use HTML syntax to format your content to your liking.</p>',
    data_path='DICE/static/data/sample_tweets.csv', # 'https://raw.githubusercontent.com/Howquez/oFeeds/main/software/DICE/DICE/static/data/sample_tweets.csv', #'DICE/DICE/data/sample_tweets.csv',
    delimiter=';',
    sort_by='datetime',
    condition_col='condition',
    topics = True,
    # copy_text = '50M Jobseekers. <br><br> 150+ Job Boards. <br><br> One Click.',
    copy_text= '', # 'Happy<br>National<br>Fried Chicken<br>Day!',
    show_cta = False,
    cta_text = '', # 'Post Jobs Free',
    landing_page = 'https://unisg.qualtrics.com/jfe/form/SV_0DnMoLpM0VxjhrM',
    search_term = '#Yosemite',
)

PARTICIPANT_FIELDS = ['tweets', 'finished']
SESSION_FIELDS = ['prolific_completion_url', 'completion_code']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = False

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ Welcome """

SECRET_KEY = '8744261096089'
