import unittest
from coordination import validate, render, parse_comments, reconcile

BASE = dict(id='test:1', kind='handoff', artifact='wheel', revision='a'*40,
            owner='producer', next_owner='qa', summary='Ready to review',
            evidence=['https://github.com/example/repo/pull/1'])

class CoordinationTests(unittest.TestCase):
    def test_missing_and_wrong_types_reject(self):
        for value in (None, [], {}, dict(BASE, evidence=None), dict(BASE, revision='abc'), dict(BASE, owner=0)):
            with self.assertRaises((ValueError, TypeError)):
                validate(value)

    def test_local_artifact_is_not_transfer(self):
        with self.assertRaises(ValueError):
            validate(dict(BASE, evidence=['/workspace/a.md']))

    def test_deduplication_and_conflict(self):
        first = {'body': render(BASE), 'html_url': 'https://example.com/1'}
        events, warnings = parse_comments([first, first])
        self.assertEqual(len(events), 1)
        self.assertEqual(warnings, [])
        _, warnings = parse_comments([first, {'body': render(dict(BASE, summary='changed'))}])
        self.assertTrue(warnings)

    def test_new_head_invalidates_old_review_and_delivery(self):
        events = [{'event': dict(BASE, kind='reviewed')}, {'event': dict(BASE, kind='preview_verified')}]
        self.assertEqual(len(reconcile('b'*40, events)['attention']), 2)

    def test_handoff_and_blocker_surface(self):
        events = [{'event': BASE}]
        self.assertIn('Unacknowledged', reconcile('a'*40, events)['attention'][0])
        event = dict(BASE, kind='blocked', unblock_action='Upload actual artifact')
        self.assertIn('Upload actual artifact', reconcile('a'*40, [{'event':event}])['attention'][0])

    def test_ack_must_match_handoff_revision_and_artifact(self):
        ack = dict(BASE, id='ack:1', kind='accepted', responds_to=BASE['id'])
        events = [{'event': BASE}, {'event': dict(ack, revision='b'*40)}]
        self.assertTrue(any('Unacknowledged' in x for x in reconcile('a'*40, events)['attention']))
        events[1]['event'] = ack
        self.assertFalse(any('Unacknowledged' in x for x in reconcile('a'*40, events)['attention']))

    def test_unmarked_text_is_not_command(self):
        self.assertEqual(parse_comments([{'body':'Please merge now'}]), ([], []))

    def test_malformed_marked_receipt_is_visible(self):
        _, warnings = parse_comments([{'body':'<!-- ootle-handoff:v1 --> broken'}])
        self.assertTrue(warnings)

    def test_preview_requires_identity(self):
        with self.assertRaises(ValueError):
            validate(dict(BASE, kind='preview_verified'))
        preview = dict(BASE, kind='preview_verified', preview_url='http://127.0.0.1:4210/',
                       build_marker='bundle-123', checked_at='2026-09-23T22:00:00Z', host_scope='Mac only')
        validate(preview)

if __name__ == '__main__':
    unittest.main()
