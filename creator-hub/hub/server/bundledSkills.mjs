import {repositorySkills, repositorySkillFiles} from './repositorySkills.mjs';
import { readFileSync } from 'node:fs';

// Read the onboarding copy directly; never maintain a second downloadable copy.
const readableCodeDirectory = new URL('../../../.agents/skills/readable-code/', import.meta.url);
const upstream = JSON.parse(readFileSync(new URL('upstream.json', readableCodeDirectory), 'utf8'));

export const bundledSkillCreators = [{id:'unity-technologies',name:'Unity Technologies',bio:'Official upstream Unity agent skill, pinned for review. Attribution does not imply endorsement or a connected Editor.',showWork:true,showActivity:true,projects:['https://github.com/Unity-Technologies/unity-agent-plugin']}, {id:'stanestane',name:'Stanislav Stankovic',bio:'Game design skill bundle author. Pinned upstream guidance; source attribution, not a claimed Hub account. See included upstream terms.',showWork:true,showActivity:true,projects:['https://github.com/Stanestane/game-design-skills-bundle']}, {id: 'huggingface', name: 'Hugging Face', bio: 'Official upstream agent skills, pinned with Apache-2.0 licensing. Source attribution, not a claimed Hub account.', showWork: true, showActivity: true, projects: ['https://github.com/huggingface/skills']}, {id: 'gamedev-skills', name: 'Game development skills contributors', bio: 'Pinned upstream engine, game design and workflow guidance; not a claimed Hub account.', showWork: true, showActivity: true, projects: ['https://github.com/gamedev-skills/awesome-gamedev-agent-skills']}, {
  id: 'm4r1m0',
  name: 'm4r1m0',
  bio: 'Author of the readable-code skill in skillz. This attribution comes from the upstream repository, not a claimed Hub account.',
  showWork: true,
  showActivity: true,
  projects: [upstream.repository],
}];

export const bundledSkills = [...repositorySkills, {
  id: 'readable-code',
  creatorId: 'm4r1m0',
  kind: 'skill',
  title: 'Readable Code',
  description: 'Readable, maintainable code standards for people and agents: clear naming, focused functions, dependency checks and a completion checklist.',
  version: upstream.revision.slice(0, 12),
  price: 0,
  currency: 'USD',
  lifecycle: 'Upstream guidance',
  publishedAt: null,
  sourceUrl: `${upstream.repository}/blob/${upstream.revision}/${upstream.path}`,
  purpose: 'Help your agent write, review and maintain understandable code. The same skill is required during this repository’s agent onboarding.',
  requirements: 'An agent that can read Markdown and access your project files. No runtime dependency or Tari wallet is required.',
  setup: 'Download SKILL.md, save it in .agents/skills/readable-code/SKILL.md (or your agent’s supported project skill folder), and reference it from your project’s agent instructions. Ask the agent to read it before coding.',
  instructions: 'Use the downloaded skill as the full reference. It covers naming, focused functions, dependency awareness, readable control flow, code review and the self-check before completion.',
  verification: 'Ask your agent to explain how its changes satisfy the skill’s self-check, then run the project’s relevant tests. Availability in this library does not certify every change follows the guidance.',
  recovery: 'Keep your existing project instructions. Use Git to review or revert changes. Upstream updates must be reviewed before replacing the pinned copy.',
}];

export function bundledSkillMarkdown(id) {
  if (id !== 'readable-code') return null;
  return readFileSync(new URL('SKILL.md', readableCodeDirectory), 'utf8');
}

export function bundledSkillFiles(id) {
  const files = repositorySkillFiles(id);
  if (files) return files;
  const markdown = bundledSkillMarkdown(id);
  return markdown === null ? null : {'SKILL.md': markdown};
}
