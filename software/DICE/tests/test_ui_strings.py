import unittest
from types import SimpleNamespace

from DICE.ui_strings import (
    CONSENT_DEFAULT_EN,
    CONSENT_DEFAULT_PT,
    UI_STRINGS,
    get_consent_default_template,
    get_debrief_context,
    get_template_context,
    normalize_language,
    resolve_participant_display_id,
)


class NormalizeLanguageTests(unittest.TestCase):
    def test_portuguese_variants(self):
        self.assertEqual(normalize_language('pt-br'), 'pt-br')
        self.assertEqual(normalize_language('pt_br'), 'pt-br')
        self.assertEqual(normalize_language('PT-BR'), 'pt-br')

    def test_unknown_and_empty_fallback_to_english(self):
        self.assertEqual(normalize_language('pt'), 'en')
        self.assertEqual(normalize_language(''), 'en')
        self.assertEqual(normalize_language(None), 'en')
        self.assertEqual(normalize_language('fr'), 'en')


class UiStringCatalogTests(unittest.TestCase):
    def test_en_and_pt_br_have_matching_keys(self):
        english_keys = set(UI_STRINGS['en'])
        portuguese_keys = set(UI_STRINGS['pt-br'])
        self.assertEqual(english_keys, portuguese_keys)


class ResolveParticipantDisplayIdTests(unittest.TestCase):
    def test_prefers_label_over_code(self):
        self.assertEqual(
            resolve_participant_display_id('CODE123', 'PROLIFIC_ID'),
            'PROLIFIC_ID',
        )

    def test_falls_back_to_code(self):
        self.assertEqual(resolve_participant_display_id('CODE123', None), 'CODE123')

    def test_returns_none_when_both_missing(self):
        self.assertIsNone(resolve_participant_display_id(None, None))


class GetConsentDefaultTemplateTests(unittest.TestCase):
    def test_english_template(self):
        self.assertEqual(get_consent_default_template('en'), CONSENT_DEFAULT_EN)

    def test_portuguese_template(self):
        self.assertEqual(get_consent_default_template('pt-br'), CONSENT_DEFAULT_PT)


class GetTemplateContextTests(unittest.TestCase):
    def test_popover_uses_label_when_present(self):
        context = get_template_context('pt-br', 'CODE123', 'PROLIFIC_ID')
        self.assertIn('PROLIFIC_ID', context['participant_id_popover'])
        self.assertNotIn('CODE123', context['participant_id_popover'])

    def test_popover_uses_code_when_label_missing(self):
        context = get_template_context('en', 'CODE123', None)
        self.assertIn('CODE123', context['participant_id_popover'])

    def test_feed_end_defaults(self):
        context = get_template_context('en')
        self.assertEqual(
            context['feed_end_seen_text'],
            UI_STRINGS['en']['feed_seen_posts'],
        )
        self.assertEqual(context['feed_end_submit_id'], 'submitButtonBottom')


class GetDebriefContextTests(unittest.TestCase):
    def test_debrief_contact_html_is_formatted(self):
        player = SimpleNamespace(
            participant=SimpleNamespace(code='ABC123', label=None),
            session=SimpleNamespace(
                config={
                    'language': 'en',
                    'title': 'Dr.',
                    'full_name': 'Jane Doe',
                    'eMail': 'jane@example.com',
                },
            ),
        )
        context = get_debrief_context(player)
        self.assertIn('Jane Doe', context['debrief_contact_html'])
        self.assertIn('jane@example.com', context['debrief_contact_html'])
        self.assertIn('ABC123', context['debrief_contact_html'])


if __name__ == '__main__':
    unittest.main()
