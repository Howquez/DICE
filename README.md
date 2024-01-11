
![DICE vs. Twitter Interface](misc/img/oFeeds-screenshots_2.png?raw=true "DICE compared to Twitter")


# 📦 Digital In-Context Experiments

DICE (formerly called _oFeeds_) offers an assortment of oTree applications designed to simulate news, shopping, and social media feeds. 
This suite of tools is tailored for marketing researchers, enabling them to develop more realistic stimuli for their studies.

A key feature of DICE is its user-friendly design, which allows researchers to effortlessly manipulate a feed without any coding requirement. 
Functioning similarly to content management systems, DICE is structured so that alterations to a single `*.csv` file are sufficient to modify the content and appearance of the feed. 
This streamlined process facilitates quick and efficient changes, enhancing the flexibility and ease of use.

As of today, this page focuses on DICE's capabilities for mimicking social media feeds. 
It provides guidance on how to utilize the tool for creating and customizing dynamic, interactive social media environments for research purposes.


## Usage

![Screenshot of oCom App](misc/img/figure-4.png?raw=true "Configuration Process")

1. Create and upload a `*.csv` containing all the content you want to display as well as information about potential experimental conditions. You can download a template [here](https://feed-config-2053f6176aba.herokuapp.com/static/sample_feed.csv).
2. If desired, create a post-experiment survey (e.g. in Qualtrics) with embedded data (to accept user IDs and completion codes as URL parameters).
2. Visit the [DICE Feed Configurator](https://feed-config-2053f6176aba.herokuapp.com/) and provide the required information (such as a link to the `*.csv` file you uploaded and the Qualtrics survey).
3. The DICE Feed Configurator provides URLs for the researcher to monitor the study and to distribute to prospective participants (e.g. via Prolific).


## Resources & Links

- [OSF](https://osf.io/jcxvk/)
- [License](LICENSE)
- Please cite as: _Roggenkamp, H. C., Boegershausen, J., & Hildebrand, C. (2024, January 10). Digital In-Context Experiments (DICE). Retrieved from osf.io/jcxvk_

## 🧵 Mimic Social Media Feeds with _oTweet_
![Screenshot of oCom App](misc/img/screenshot_oTweet.png?raw=true "Shop Interface")
[otreezip file](oTweet/oTweet.otreezip)


## 🗞️ Mimic News Feeds with _oNovitas_
![Screenshot of oNovitas App](misc/img/screenshot_oNovitas.png?raw=true "News Feed")
[otreezip file](oNovitas/oNovitas.otreezip)

## 🛒 Mimic Web Shops with _oCom_
![Screenshot of oCom App](misc/img/screenshot_oCom.png?raw=true "Shop Interface")
[otreezip file](oCom/oCom.otreezip)
