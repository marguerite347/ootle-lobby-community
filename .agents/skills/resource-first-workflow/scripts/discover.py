#!/usr/bin/env python3
"""Read-only local shortlist. No network, installs, model loads or dependency imports."""
import argparse
import json
import re
from pathlib import Path

ALIASES = {
    'voice': ['audio', 'speech', 'narration', 'tts'],
    'trailer': ['video', 'remotion', 'capture', 'cinematic', 'audio', 'copywriting', 'copy-editing'],
    'script': ['copywriting', 'copy-editing', 'storytelling'],
    'music': ['audio', 'sound'],
    'game': ['gamedev', 'engine', 'gameplay'],
    'huggingface': ['hugging', 'hf'],
}


def metadata(path):
    text = path.read_text(encoding='utf-8')
    frontmatter = text.split('---', 2)[1] if text.startswith('---') else ''
    name = re.search(r'^name:\s*(.+)$', frontmatter, re.M)
    description = re.search(r'^description:\s*(.+)$', frontmatter, re.M)
    return (name.group(1).strip('"\'') if name else path.parent.name,
            description.group(1).strip('"\'') if description else '')


def discover(repo, query, installed=None, limit=12):
    terms = set(re.findall(r'[a-z0-9]+', query.lower()))
    for term in list(terms):
        terms.update(ALIASES.get(term, []))
    candidates = {}
    roots = [repo / '.agents/skills', repo / 'skills', repo / 'creator-hub/skills']
    if installed:
        roots.append(installed)
    for root in roots:
        if not root.is_dir():
            continue
        for path in sorted(root.rglob('SKILL.md')):
            if not path.is_file():
                continue
            name, description = metadata(path)
            candidates[str(path.resolve())] = (name, description, 'skill metadata')
    documents = set((repo / 'creator-hub/resources').glob('*.md'))
    documents.update((repo / 'creator-hub').glob('*WORKFLOW*.md'))
    documents.update((repo / 'creator-hub/video-templates').glob('*.md'))
    documents.update((repo / 'creator-hub/hub').glob('*.md'))
    for path in sorted(documents):
        if path.is_file():
            text = path.read_text(encoding='utf-8')
            matching = [line.strip() for line in text.splitlines() if any(term in line.lower() for term in terms)]
            candidates[str(path.resolve())] = (path.stem, ' '.join(matching[:3])[:700], 'project reference')
    results = []
    for path, (name, description, kind) in candidates.items():
        score = sum(4 * (term in name.lower()) + (term in description.lower()) for term in terms)
        if score:
            results.append({'score': score, 'name': name, 'kind': kind, 'path': path, 'summary': description[:320]})
    results.sort(key=lambda item: (-item['score'], item['path']))
    return {'query': query, 'coverage': 'Skill metadata and selected project resource/workflow docs only. Check runtime tool metadata and relevant package/scripts separately.', 'matched': len(results), 'items': results[:limit]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query')
    parser.add_argument('--repo', type=Path, default=Path.cwd())
    parser.add_argument('--installed', type=Path)
    parser.add_argument('--limit', type=int, default=12)
    args = parser.parse_args()
    if not args.repo.is_dir() or not 1 <= args.limit <= 30 or not args.query.strip():
        parser.error('Use an existing repository, a nonempty query and a limit from 1 to 30.')
    print(json.dumps(discover(args.repo.resolve(), args.query, args.installed, args.limit), indent=2))


if __name__ == '__main__':
    main()
