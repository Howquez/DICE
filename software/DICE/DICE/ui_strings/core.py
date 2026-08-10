"""Language resolution and template context helpers for DICE UI strings."""

from typing import Any

from .locales.en import EN_STRINGS
from .locales.pt_br import PT_BR_STRINGS

CONSENT_DEFAULT_EN = 'DICE/T_Partial_Consent_Default_en.html'
CONSENT_DEFAULT_PT = 'DICE/T_Partial_Consent_Default_pt.html'

UI_STRINGS: dict[str, dict[str, str]] = {
    'en': EN_STRINGS,
    'pt-br': PT_BR_STRINGS,
}

DEFAULT_LANGUAGE = 'en'
DEFAULT_FEED_END_SUBMIT_ID = 'submitButtonBottom'


def normalize_language(language: str | None) -> str:
    if not language:
        return DEFAULT_LANGUAGE
    normalized = language.lower().replace('_', '-')
    if normalized in UI_STRINGS:
        return normalized
    return DEFAULT_LANGUAGE


def get_ui(language: str | None) -> dict[str, str]:
    return UI_STRINGS[normalize_language(language)]


def resolve_participant_display_id(
    participant_code: str | None,
    participant_label: str | None,
) -> str | None:
    if participant_label:
        return participant_label
    return participant_code


def get_js_strings(language: str | None) -> dict[str, Any]:
    ui = get_ui(language)
    return {
        'image_unavailable': ui['image_unavailable'],
    }


def get_template_context(
    language: str | None,
    participant_code: str | None = None,
    participant_label: str | None = None,
) -> dict[str, Any]:
    ui = get_ui(language)
    context: dict[str, Any] = {
        'ui': ui,
        'feed_end_seen_text': ui['feed_seen_posts'],
        'feed_end_submit_id': DEFAULT_FEED_END_SUBMIT_ID,
    }
    display_id = resolve_participant_display_id(participant_code, participant_label)
    if display_id is not None:
        context['participant_id_popover'] = ui['participant_id_popover'].format(
            code=display_id,
        )
    return context


def get_consent_default_template(language: str | None) -> str:
    if normalize_language(language) == 'pt-br':
        return CONSENT_DEFAULT_PT
    return CONSENT_DEFAULT_EN


def get_debrief_context(player) -> dict[str, Any]:
    language = player.session.config.get('language', 'en')
    context = get_template_context(
        language,
        player.participant.code,
        player.participant.label,
    )
    config = player.session.config
    context['debrief_contact_html'] = context['ui']['debrief_contact_body'].format(
        title=config['title'],
        full_name=config['full_name'],
        email=config['eMail'],
        code=player.participant.code,
    )
    return context
