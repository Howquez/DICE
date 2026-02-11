
![DICE vs. Twitter Interface](misc/img/oFeeds-screenshots_2.png?raw=true "DICE compared to Twitter")


# 🎲 Digital In-Context Experiments (DICE)

DICE (formerly called _oFeeds_) offers an assortment of oTree ([Chen, Schonger, and Wickens 2016](https://doi.org/doi.org/10.1016/j.jbef.2015.12.001)) applications designed to simulate news, shopping, and social media feeds. 
This suite of tools is tailored for marketing researchers, enabling them to develop more realistic stimuli for their studies.

A key feature of DICE is its user-friendly design, which allows researchers to effortlessly manipulate a feed without any coding requirement. 
Functioning similarly to content management systems, DICE is structured so that alterations to a single `*.csv` file are sufficient to modify the content and appearance of the feed. 
This streamlined process facilitates quick and efficient changes, enhancing the flexibility and ease of use.

As of today, this page focuses on DICE's capabilities for mimicking social media feeds. 
It provides guidance on how to utilize the tool for creating and customizing dynamic, interactive social media environments for research purposes.

## Features

- Stable and Fully Randomized Group Assignment: Each participant in a study is assigned to an experimental condition through a randomization process. This contrasts with the non-randomized approaches often found in observational and platform studies.
- Exposure to Rich, Interactive Context: Unlike static vignette studies, participants engage with a dynamic and immersive environment. Additionally, unlike observational and platform studies, researchers maintain full control over the context of the study.
- Advanced Metrics for Researchers: DICE provides novel metrics, including latent measures like per-item dwell time. These metrics can be integrated with direct responses such as likes or comments, and supplemented with post-experiment survey data, offering a more comprehensive analysis than traditional vignette, observational, and platform studies.
- Facilitation of Replicability: The researcher exercises complete control over the content and its delivery, ensuring thorough documentation. This feature simplifies the process of replicating stimuli presented in the study, a notable advantage over platform studies where such control and documentation may be limited.

## Usage

![Screenshot of oCom App](misc/img/figure-4.png?raw=true "Configuration Process")

1. Create and upload a `*.csv` containing all the content you want to display as well as information about potential experimental conditions. You can download a template [here](https://feed-config-2053f6176aba.herokuapp.com/static/sample_feed.csv).
2. If desired, create a post-experiment survey (e.g. in Qualtrics) with embedded data (to accept user IDs and completion codes as URL parameters).
2. Visit the **[DICE App](https://www.dice-app.org/)** and provide the required information (such as a [raw](https://docs.github.com/enterprise-cloud@latest/repositories/working-with-files/using-files/viewing-a-file#:~:text=With%20the%20raw%20view%2C%20you,the%20file%20view%2C%20click%20Raw.) link to the `*.csv` file you uploaded and the Qualtrics survey).
3. The DICE App provides URLs for the researcher to monitor the study and to distribute to prospective participants (e.g. via Prolific).

As the tool is under development, please [contact me](mailto:hauke.roggenkamp@unisg.ch) prior to running a study.

## Recommended Setup

1. **Prolific:** DICE is optimized for Prolific. 
2. **Qualtrics:** Even though you can also use other tools or program a questionnaire directly in oTree, we recommend to use Qualtrics to append a questionnaire to the DICE browsing task.
3. **Github:** To display images or gifs in your feed, you need to provide URLs (within your `*.csv` file) directing to publicly available images. To create URLs for your own visuals as well as the above-mentioned `*.csv` file, you need to upload these files somewhere. Github is a versatile, transparent and easy-to-use platform to do so. You can create an account in a matter of a few clicks.


## DICE-Lite

If you prefer working directly with code rather than using the GUI-based DICE App, check out [**DICE-Lite**](https://github.com/Howquez/DICE-lite) — a trimmed-down, code-centric version of DICE. It provides a generic, customizable microblogging-style feed that you can adapt or redesign as needed while maintaining core dwell-time measurement functionality. DICE-Lite is ideal for researchers already familiar with oTree who want full control over templates and logic.

## Questions & Community

Have a question, idea, or something to share? Head over to [**GitHub Discussions**](https://github.com/Howquez/DICE/discussions) — we'd love to hear from you.

## Resources & Links

- Read the [docs](https://www.dice-app.org/docs/).
- Shiny app to [pre-process DICE's data](https://dice-app.shinyapps.io/DICE-Preprocessing/).
- Code licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE) with added citation requirement:
- Please cite as: _Roggenkamp, H., Boegershausen, J., & Hildebrand, C. (2026). DICE: Advancing Social Media Research Through Digital In-Context Experiments. Journal of Marketing. https://doi.org/10.1177/00222429251371702_ or check `Cite this repository` to the right.
- Also cite [Chen, Schonger, and Wickens (2016)](https://doi.org/doi.org/10.1016/j.jbef.2015.12.001)
- [DICE Configurator App Repository](https://github.com/Howquez/oFeeds-config)
- [OSF](https://osf.io/jcxvk/)
<!-- - Shiny app to [encode DICE's input](https://dice-app.shinyapps.io/DICE-input-encoding/) `*.csv` file. -->


<!--
## 🧵 Mimic Social Media Feeds with _oTweet_
![Screenshot of oCom App](misc/img/screenshot_oTweet.png?raw=true "Shop Interface")
[otreezip file](oTweet/oTweet.otreezip)


## 🗞️ Mimic News Feeds with _oNovitas_
![Screenshot of oNovitas App](misc/img/screenshot_oNovitas.png?raw=true "News Feed")
[otreezip file](oNovitas/oNovitas.otreezip)

## 🛒 Mimic Web Shops with _oCom_
![Screenshot of oCom App](misc/img/screenshot_oCom.png?raw=true "Shop Interface")
[otreezip file](oCom/oCom.otreezip)
-->