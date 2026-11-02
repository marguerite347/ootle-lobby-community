"""Offline fixtures for the bundled asset inspection and preview tools."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / 'skills/vendor/gamedev/skills/disciplines/create-game-assets/scripts'

class AssetToolsTest(unittest.TestCase):
    def test_inspection_constraints_and_preview(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            alpha = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
            alpha.paste((0, 255, 0, 255), (4, 4, 12, 12))
            alpha.save(folder / 'alpha.png')
            Image.new('RGB', (8, 8), (255, 0, 0)).save(folder / 'opaque.png')
            def run(script, *args):
                return subprocess.run([sys.executable, str(TOOLS / script), *map(str, args)], capture_output=True, text=True)
            report = run('asset_report.py', folder / 'alpha.png', '--expect-size', '16x16', '--require-alpha', '--max-colors', '2', '--json')
            self.assertEqual(report.returncode, 0, report.stderr)
            asset = json.loads(report.stdout)['assets'][0]
            self.assertEqual(asset['transparent_pixels'], 192)
            self.assertEqual(asset['content_bounds'], [4, 4, 12, 12])
            self.assertEqual(asset['color_count'], 2)
            rejected = run('asset_report.py', folder / 'opaque.png', '--require-alpha', '--json')
            self.assertEqual(rejected.returncode, 1)
            self.assertIn('image has no alpha channel', rejected.stdout)
            preview = run('build_preview_sheet.py', folder / 'alpha.png', folder / 'opaque.png', '--out', folder / 'sheet.png', '--columns', '2', '--cell-size', '16', '--padding', '2')
            self.assertEqual(preview.returncode, 0, preview.stderr)
            with Image.open(folder / 'sheet.png') as sheet:
                self.assertEqual(sheet.size, (40, 44))
                self.assertEqual(sheet.mode, 'RGB')

if __name__ == '__main__':
    unittest.main()
