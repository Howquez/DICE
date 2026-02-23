from os import environ

SESSION_CONFIGS = [
    dict(
        name='Twitter',
        app_sequence=['DICE'],
        num_demo_participants=3,
        channel_type="Twitter", # "Twitter_Replies",
    ),
    dict(
        name='Insta',
        app_sequence=['DICE'],
        num_demo_participants=3,
        channel_type="Insta",
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
    ),
    dict(
        name='Stories_beta',
        app_sequence=['DICE'],
        num_demo_participants=3,
        channel_type="Stories",
        story_duration=7,  # seconds each story is displayed before auto-advancing
    ),
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
    study_name = 'A study about social media',
    channel_type = 'Twitter',
    survey_link = 'https://unisg.qualtrics.com/jfe/form/SV_0DnMoLpM0VxjhrM',
    dwell_threshold = 75,
    story_duration = 7,
    url_param = 'PROLIFIC_PID',
    briefing = '', # '<h5>This could be your briefing</h5><p>Use HTML syntax to format your content to your liking.</p>',
    consent_form = '',
    data_path=  "https://raw.githubusercontent.com/DICE-app/sample-feeds/refs/heads/main/feeds/sample_2x2_brand_safety.csv", #'DICE/static/data/sample_tweets.csv', #'DICE/static/data/9gag.csv', #  "https://raw.githubusercontent.com/Howquez/DICE/main/studies/frequency_capping/stimuli/brazil_pretest.csv",
    delimiter=';',
    sort_by='datetime',
    condition_col='condition',
    search_term = "@9GAG", #"'#Yosemite',

    # Legacy ?
    topics = True,
    # copy_text = '50M Jobseekers. <br><br> 150+ Job Boards. <br><br> One Click.',
    copy_text= '', # 'Happy<br>National<br>Fried Chicken<br>Day!',
    show_cta = False,
    cta_text = '', # 'Post Jobs Free',
    # landing_page = 'https://unisg.qualtrics.com/jfe/form/SV_0DnMoLpM0VxjhrM',

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
