#!/usr/bin/env python3
"""Validate portable specialist instructions or print a harness-neutral kickoff."""
import json
import subprocess
import sys
from pathlib import Path

DIRECTORY = Path(__file__).resolve().parent
ROOT = DIRECTORY.parents[1]

def load_team():
    team = json.loads((DIRECTORY / 'team.json').read_text())
    ids = [role['id'] for role in team['roles']]
    if len(ids) != len(set(ids)) or ids.count('producer') != 1:
        raise ValueError('Role IDs must be unique with exactly one producer')
    for role in team['roles']:
        text = (DIRECTORY / (role['id'] + '.md')).read_text()
        if team['commonInstructions'] not in text or role['mission'] not in text:
            raise ValueError('Persona drift: ' + role['id'])
        for reference in role['requiredReads']:
            target = (ROOT / reference).resolve()
            if not target.is_relative_to(ROOT) or not target.is_file():
                raise ValueError('Missing or unsafe reference: ' + reference)
            if reference not in text:
                raise ValueError('Missing persona reference: ' + reference)
    return team

def main():
    command = sys.argv[1] if len(sys.argv) == 2 else ''
    if command not in ('check', 'kickoff'):
        raise SystemExit('Usage: team.py check|kickoff')
    team = load_team()
    if command == 'check':
        print(f"PASS: {len(team['roles'])} role profiles; references and shared instructions match.")
        return
    revision = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip()
    print(f'Read creator-hub/agents/README.md and team.json at revision {revision}. Adopt producer.md. Inspect actual bot creation/messaging tools and repository access. Create or reuse the non-producer specialists listed in the manifest with their complete role Markdown as persistent instructions. Check channel capacity (observed Grok limit: six); create Core/Support rooms with Producer relaying handoffs, return roster identifiers and capability evidence. Do not launch workers until a task packet supplies scope, budgets and checks. Report missing access honestly. Do not claim the team is verified merely because it exists.')

if __name__ == '__main__':
    main()
