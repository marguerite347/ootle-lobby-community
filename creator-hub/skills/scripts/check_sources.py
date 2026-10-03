#!/usr/bin/env python3
"""Read-only source drift report. Does not download or replace instructions."""
import json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for source in json.loads((root/'sources.json').read_text())['repositories']:
    result=subprocess.run(['git','ls-remote',f'https://github.com/{source["repo"]}.git','HEAD'],capture_output=True,text=True,timeout=30,check=True)
    current=result.stdout.split()[0]
    print(json.dumps({'repo':source['repo'],'pinned':source['revision'],'head':current,'needsSourceReview':current!=source['revision']}))
