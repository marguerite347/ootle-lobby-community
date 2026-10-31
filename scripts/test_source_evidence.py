import tempfile
import unittest
from pathlib import Path
from source_evidence import store_source_evidence


class EvidenceStorageTest(unittest.TestCase):
    def test_same_source_keeps_html_and_api_observations(self):
        with tempfile.TemporaryDirectory() as directory:
            html = store_source_evidence(directory, 'https://example.test/post', b'<html>Post</html>')
            api = store_source_evidence(directory, 'https://example.test/post', b'{"replies":[]}')
            self.assertNotEqual(html['file'], api['file'])
            self.assertEqual((Path(directory) / html['file']).read_bytes(), b'<html>Post</html>')
            self.assertEqual((Path(directory) / api['file']).read_bytes(), b'{"replies":[]}')
            self.assertEqual(len(list(Path(directory).iterdir())), 2)

    def test_same_bytes_reuse_evidence_and_detect_tampering(self):
        with tempfile.TemporaryDirectory() as directory:
            first = store_source_evidence(directory, 'source', b'accepted bytes')
            self.assertEqual(store_source_evidence(directory, 'source', b'accepted bytes'), first)
            (Path(directory) / first['file']).write_bytes(b'tampered')
            with self.assertRaises(ValueError):
                store_source_evidence(directory, 'source', b'accepted bytes')
            self.assertEqual((Path(directory) / first['file']).read_bytes(), b'tampered')


if __name__ == '__main__':
    unittest.main()
