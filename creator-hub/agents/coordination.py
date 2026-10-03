#!/usr/bin/env python3
"""Portable GitHub handoff receipts and read-only delivery reconciliation.
No daemon, credentials store, execution dispatcher or second task database.
"""
import argparse
import datetime as dt
import json
import re
import subprocess
from pathlib import Path

REPO = 'marguerite347/ootle-lobby'
MARKER = '<!-- ootle-handoff:v1 -->'
KINDS = {'handoff', 'accepted', 'changes_requested', 'blocked', 'reviewed', 'preview_verified'}


def validate(event):
    if not isinstance(event, dict):
        raise ValueError('Receipt must be an object')
    required = ('id', 'kind', 'artifact', 'revision', 'owner', 'next_owner', 'summary', 'evidence')
    for key in required:
        if key not in event:
            raise ValueError('Missing ' + key)
    for key in required[:-1]:
        if not isinstance(event[key], str) or not event[key].strip():
            raise ValueError('Expected nonempty string: ' + key)
    if not re.fullmatch(r'[a-zA-Z0-9._:-]{1,120}', event['id']):
        raise ValueError('Invalid receipt id')
    if event['kind'] not in KINDS:
        raise ValueError('Unknown receipt kind')
    if not re.fullmatch(r'[a-f0-9]{40}', event['revision']):
        raise ValueError('Use the full source commit SHA')
    if not isinstance(event['evidence'], list) or not event['evidence']:
        raise ValueError('At least one accessible evidence URL is required')
    if any(not isinstance(url, str) or not url.startswith('https://') for url in event['evidence']):
        raise ValueError('Evidence must be HTTPS URLs, not another machine\'s local paths')
    if event['kind'] in {'accepted', 'changes_requested'} and not event.get('responds_to'):
        raise ValueError('Acceptance/revision must identify responds_to receipt')
    if event['kind'] == 'blocked' and not event.get('unblock_action'):
        raise ValueError('Blocked receipt needs an unblock_action')
    if event['kind'] == 'preview_verified':
        for key in ('preview_url', 'build_marker', 'checked_at', 'host_scope'):
            if not isinstance(event.get(key), str) or not event[key].strip():
                raise ValueError('Preview receipt needs ' + key)
        if not event['preview_url'].startswith(('https://', 'http://127.0.0.1:', 'http://localhost:')):
            raise ValueError('Preview URL must be HTTPS or explicitly local')
        dt.datetime.fromisoformat(event['checked_at'].replace('Z', '+00:00'))
    return event


def render(event):
    validate(event)
    return MARKER + '\n```json\n' + json.dumps(event, indent=2) + '\n```\n'


def parse_comments(comments):
    events, warnings, seen = [], [], {}
    for comment in comments:
        body = comment.get('body') or ''
        if MARKER not in body:
            continue
        try:
            match = re.search(re.escape(MARKER) + r'\s*```json\s*(.*?)\s*```', body, re.S)
            if not match:
                raise ValueError('Malformed marked receipt')
            event = validate(json.loads(match[1]))
            if event['id'] in seen:
                if seen[event['id']] != event:
                    warnings.append('Conflicting duplicate receipt: ' + event['id'])
                continue
            seen[event['id']] = event
            events.append({'event': event, 'url': comment.get('html_url'),
                           'author': comment.get('user', {}).get('login'),
                           'created_at': comment.get('created_at')})
        except (ValueError, TypeError) as error:
            warnings.append(str(error) + ': ' + str(comment.get('html_url')))
    return events, warnings


def reconcile(head, events):
    latest = {}
    for receipt in events:
        event = receipt['event']
        latest[event['artifact']] = receipt
    warnings = []
    for receipt in events:
        handoff = receipt['event']
        if handoff['kind'] != 'handoff':
            continue
        answered = any(row['event']['kind'] in {'accepted', 'changes_requested'}
                       and row['event'].get('responds_to') == handoff['id']
                       and row['event']['revision'] == handoff['revision']
                       and row['event']['artifact'] == handoff['artifact']
                       for row in events)
        if not answered:
            warnings.append(f"Unacknowledged handoff: {handoff['artifact']} -> {handoff['next_owner']} ({handoff['id']})")
    for artifact, receipt in latest.items():
        event = receipt['event']
        if event['kind'] == 'blocked':
            warnings.append(f"Blocked: {artifact}: {event['unblock_action']}")
    for kind in ('reviewed', 'preview_verified'):
        if not any(row['event']['kind'] == kind and row['event']['revision'] == head for row in events):
            warnings.append(f'Current PR head has no {kind} receipt')
    return {'head': head, 'latest_by_artifact': latest, 'attention': warnings,
            'limits': 'Receipts are attributed claims, not independent verification or authorization. Local previews are host-scoped.'}


def gh(*args):
    result = subprocess.run(['gh', *args], text=True, capture_output=True, check=True)
    return json.loads(result.stdout) if result.stdout.strip() else None


def read_comments(number):
    pages = gh('api', '--paginate', '--slurp', f'repos/{REPO}/issues/{number}/comments?per_page=100')
    return [comment for page in pages for comment in page]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    status = sub.add_parser('status')
    status.add_argument('--pr', type=int, required=True)
    publish = sub.add_parser('publish')
    publish.add_argument('--issue', type=int, required=True, help='Issue or PR number in the fixed repository')
    publish.add_argument('file', type=Path)
    check = sub.add_parser('check')
    check.add_argument('file', type=Path)
    args = parser.parse_args()
    if args.command == 'check':
        print(render(json.loads(args.file.read_text())))
        return
    number = args.pr if args.command == 'status' else args.issue
    events, warnings = parse_comments(read_comments(number))
    if args.command == 'status':
        pr = gh('pr', 'view', str(number), '--repo', REPO, '--json', 'headRefOid,state,isDraft,url,updatedAt')
        report = reconcile(pr['headRefOid'], events)
        report.update(pr=pr, receipt_warnings=warnings)
        print(json.dumps(report, indent=2))
        return
    event = validate(json.loads(args.file.read_text()))
    if warnings:
        raise ValueError('Fix receipt errors before publishing: ' + '; '.join(warnings))
    previous = next((row for row in events if row['event']['id'] == event['id']), None)
    if previous:
        if previous['event'] != event:
            raise ValueError('Receipt ID exists with different content; use a new ID')
        print('Already published: ' + str(previous['url']))
        return
    # Comment attribution comes from GitHub. Role strings do not grant privileges.
    result = subprocess.run(['gh', 'api', f'repos/{REPO}/issues/{number}/comments', '--input', '-'],
                            input=json.dumps({'body': render(event)}), text=True, capture_output=True, check=True)
    print(json.loads(result.stdout)['html_url'])


if __name__ == '__main__':
    main()
