import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const entries = JSON.parse(readFileSync(path.join(root, 'skills/hub-catalog.json'), 'utf8'));
export const repositorySkills = entries.map(entry => ({
  ...entry, kind: 'skill', price: 0, currency: 'USD', publishedAt: null,
  lifecycle: entry.sourceKind === 'upstream' || ['gamedev-skills', 'huggingface'].includes(entry.creatorId) ? 'Upstream guidance' : 'Repository runbook',
  purpose: entry.description,
  requirements: 'Read the skill requirements and use the engine and versions selected by your project. These instructions are not a certification of a deployed Tari integration.',
  setup: 'Download the bundle and preserve its relative file layout. For repository-root links, use a matching ootle-lobby checkout. Ask your agent to read SKILL.md and only the references relevant to the task.',
  instructions: 'The bundle contains the canonical repository skill and its local supporting files. Start at SKILL.md.',
  verification: 'Run the selected task’s actual checks and inspect the result. Report local tests, visual checks, network execution and deployment separately.',
  recovery: 'Keep source revisions and evidence of failures. Review a focused correction, rerun the affected check, and preserve existing project constraints.',
}));

export function repositorySkillFiles(id) {
  const entry = entries.find(candidate => candidate.id === id);
  if (!entry) return null;
  // Only manifest-listed files ship; incidental local files never enter downloads.
  const files = Object.fromEntries(entry.files.map(name => [
    name, readFileSync(path.join(root, entry.directory, name), 'utf8'),
  ]));
  if (entry.creatorId === 'gamedev-skills') {
    for (const name of ['LICENSE', 'NOTICE']) {
      files[name] = readFileSync(path.join(root, 'skills/vendor/gamedev', name), 'utf8');
    }
  }
  return files;
}
