import {createLearningLoop} from './learningLoop.mjs';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {bundledSkills, bundledSkillFiles} from './bundledSkills.mjs';
import {skillCatalog} from './skills.mjs';

export const agentStart = () => readFileSync(new URL('../AGENT_START.md', import.meta.url), 'utf8');

export function agentResourceIndex({q = '', offset = '0', limit = '20'} = {}) {
  if (typeof q !== 'string' || q.length > 160 || typeof offset !== 'string' || !/^\d{1,6}$/.test(offset) || typeof limit !== 'string' || !/^\d{1,2}$/.test(limit) || Number(limit) < 1 || Number(limit) > 50) {
    throw Object.assign(new Error('Use a text query, nonnegative offset and limit from 1 to 50.'), {status: 400});
  }
  const bundled = bundledSkills.map(skill => ({id: skill.id, title: skill.title, description: skill.description, version: skill.version, lifecycle: skill.lifecycle, sourceUrl: skill.sourceUrl, instructions: `/agent-skills/${encodeURIComponent(skill.id)}/SKILL.md`, bundle: `/agent-skills/${encodeURIComponent(skill.id)}/bundle.json`}));
  const native = skillCatalog().map(skill => ({id: `tari-${skill.id}`, title: skill.title, description: skill.description, version: skill.version, lifecycle: skill.lifecycle, instructions: `/skills/${skill.id}/SKILL.md`, metadata: `/api/skills/${skill.id}`}));
  const learned = createLearningLoop().publicListings().map(skill => ({id:skill.id,title:skill.title,description:skill.description,version:skill.version,lifecycle:skill.lifecycle,instructions:`/agent-skills/${skill.id}/SKILL.md`,bundle:`/agent-skills/${skill.id}/bundle.json`}));
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = [...bundled, ...native, ...learned].filter(skill => terms.every(term => `${skill.title} ${skill.description} ${skill.id}`.toLowerCase().includes(term)));
  const start = Number(offset), end = start + Number(limit);
  return {schemaVersion: 1, guide: '/agent-start.md', coverage: 'Bundled, native and published creator lesson metadata. This is not an inventory of the requesting agent’s installed tools.', total: matches.length, items: matches.slice(start, end), nextOffset: end < matches.length ? end : null};
}

export function agentSkillBundle(id) {
  const skill = bundledSkills.find(item => item.id === id);
  if (!skill) return createLearningLoop().bundle(id);
  const files = bundledSkillFiles(id);
  return {schemaVersion: 1, id, version: skill.version, sourceUrl: skill.sourceUrl, files, sha256: Object.fromEntries(Object.entries(files).map(([name, content]) => [name, createHash('sha256').update(content).digest('hex')]))};
}
