#!/usr/bin/env python3
"""Validate the native skill library and generate derived discovery files."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATES = {'draft','verified','stale','deprecated'}

def load(root=ROOT):
    entries=[]; seen=set()
    evidence_file=root/'evidence/validation.json'
    if evidence_file.exists():
        evidence=json.loads(evidence_file.read_text())
        for name,digest in evidence.get('files',{}).items():
            file=root/name
            if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest()!=digest:
                raise ValueError(f'Example changed since recorded validation: {name}')
    for p in sorted(root.glob('*/metadata.json')):
        m=json.loads(p.read_text()); slug=m['id']
        if slug in seen or slug != p.parent.name or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug):
            raise ValueError(f'invalid/duplicate ID: {slug}')
        seen.add(slug)
        for field in ['title','description','version','networks','tools','sources','sourceCheckedAt','validation','related','issue','remaining']:
            if field not in m: raise ValueError(f'{slug}: missing {field}')
        if not re.fullmatch(r'\d+\.\d+\.\d+',m['version']): raise ValueError('invalid version')
        if m['lifecycle'] not in STATES: raise ValueError('invalid lifecycle')
        text=(p.parent/'SKILL.md').read_text()
        if not text.startswith('---\nname: tari-'+slug+'\n') or '\ndescription: ' not in text.split('---',2)[1]:
            raise ValueError(f'{slug}: invalid skill frontmatter')
        if not m['sources']: raise ValueError(f'{slug}: missing sources')
        for s in m['sources']:
            if not re.fullmatch(r'[a-f0-9]{40}',s['revision']) or s['revision'] not in s['url']:
                raise ValueError(f'{slug}: unpinned source')
        if m['lifecycle']=='verified':
            if not m.get('technicalValidatedAt') or not m['validation']['evidence'] or not m['validation']['scope']:
                raise ValueError(f'{slug}: verified without evidence')
        for item in m['validation']['evidence']:
            evidence=root/item
            if not evidence.is_file(): raise ValueError(f'{slug}: missing evidence {item}')
        for link in re.findall(r'\]\(([^)]+)\)', text):
            if '://' in link or link.startswith('#'): continue
            target=(p.parent/link.split('#')[0]).resolve()
            if not target.exists(): raise ValueError(f'{slug}: broken link {link}')
        m={**m,'markdown':f'{slug}/SKILL.md','sha256':hashlib.sha256(text.encode()).hexdigest()}
        entries.append(m)
    if not entries: raise ValueError('empty library')
    for m in entries:
        if any(x not in seen for x in m['related']): raise ValueError('unknown related skill')
    coverage=json.loads((root/'coverage.json').read_text())
    if set(coverage['skills']) != seen: raise ValueError('coverage map does not match skill inventory')
    return entries

def artifacts(entries):
    verified=[m for m in entries if m['lifecycle']=='verified']
    router=(ROOT/'router-header.md').read_text()
    for m in verified: router+=f"- [{m['title']}]({m['markdown']}): {m['validation']['scope']}\n"
    if not verified: router+='No verified skills are available yet.\n'
    return {'catalog.json':json.dumps({'schemaVersion':1,'skills':entries},indent=2)+'\n','SKILL.md':router}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');parser.add_argument('--check',action='store_true');args=parser.parse_args()
    entries=load()
    for name,content in artifacts(entries).items():
        p=ROOT/name
        if args.write:p.write_text(content)
        elif not p.exists() or p.read_text()!=content:raise ValueError(f'generated {name} differs; run --write')
    print(f'{len(entries)} skills validated; {sum(m["lifecycle"]=="verified" for m in entries)} scoped verified entries')
if __name__=='__main__':main()
