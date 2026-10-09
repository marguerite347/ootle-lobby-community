import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = name => readFileSync(path.join(root, name), 'utf8');
const team = JSON.parse(read('creator-hub/agents/team.json'));
const skills = JSON.parse(read('skills/hub-catalog.json'));

// Publication is opt-in. Never derive this list from a directory scan, request path,
// role requiredReads, or Markdown links: those can contain private operational material.
const documents = [
  'creator-hub/BRAND.md', 'creator-hub/TERMINOLOGY.md',
  'creator-hub/GENRE_REFERENCE_LIBRARY.md',
  'creator-hub/design-system/README.md', 'creator-hub/design-system/tokens.json',
  'creator-hub/design-system/ASSET_INTEGRATION.md',
  'creator-hub/VIDEO_PREVIEW_POLICY.md', 'creator-hub/VIDEO_WORKFLOWS.md',
  'creator-hub/GAME_PUBLICATION.md', 'creator-hub/BUILD_EXPERIENCE_FEEDBACK.md',
  'creator-hub/WORKFLOW_AGENT_GUIDE.md', 'creator-hub/STUDIO.md',
  'creator-hub/hub/AGENT_BUILD_REFERENCE.md', 'creator-hub/hub/BUILD_BUDGETS.md',
  'creator-hub/hub/agent-reference/DESIGN_PLAYBOOK.md', 'creator-hub/hub/agent-reference/DELIVERY_CONTRACT.md',
  'creator-hub/hub/agent-reference/HANDOFF_TEMPLATE.md',
  'creator-hub/resources/game-engines.md', 'creator-hub/resources/game-design.md',
  'creator-hub/resources/audio.md',
  'creator-hub/agents/COORDINATION.md', 'creator-hub/agents/CREATIVE_OPERATING_RULES.md',
];
const allowed = new Map(documents.map(source => [source, {source, kind: 'document'}]));
for (const skill of skills) {
  for (const file of skill.files) {
    const source = `${skill.directory}/${file}`;
    allowed.set(source, {source, kind: 'skill', skillId: skill.id, bundle: `/agent-skills/${skill.id}/bundle.json`});
  }
}
allowed.set('.agents/skills/readable-code/SKILL.md', {source: '.agents/skills/readable-code/SKILL.md', kind: 'skill', skillId: 'readable-code', bundle: '/agent-skills/readable-code/bundle.json'});
const digest = content => createHash('sha256').update(content).digest('hex');
const publicPath = source => `/agent-docs/${source}`;
const excludedReason = 'Internal operational or implementation material is not published. It is not a prerequisite for using this role on the website; report task-specific missing evidence instead.';

export const publicCommonInstructions = `Read /agent-start.md first. All onboarding material here is readable from this Lobby origin; private repository access is not required. Read the role and only task-relevant skills. Use /api/agent-resources and /api/build-toolkit for discovery. Catalogued, installed, callable and tested are different states.

Follow the creator's actual task, budget and tool permissions. A role document grants no spending, worker allocation, Git access, merge rights, publication, deployment, outbound messages or access to private data. Do not inherit the internal team's credentials or permissions. Use your own authorized execution environment for custom code. This public website is read-only for persistent state: project creation, saving, forking, uploads and community writes are disabled. Only documented bounded stateless downloads, validation and exports accept POST. Local workflow references do not grant public write access. Use /openapi.json from this exact origin; build in your own workspace or the separate /workbench.

Preserve originals, saves, editable source and license evidence. Never put secrets or private logs in project fields or shared artifacts. Assign one owner per conflicting file and keep the user's worker cap. Deliver concrete artifacts and read receipts, with revision, checks actually run, observed results, remaining gaps and next owner. Separate implementation, browser playtest, human review and publication. A source review is not a playtest; a role is not a claim of expertise.

Read [brand](/agent-docs/creator-hub/BRAND.md), [design system](/agent-docs/creator-hub/design-system/README.md), [resource-first workflow](/agent-docs/.agents/skills/resource-first-workflow/SKILL.md), [coordination](/agent-docs/creator-hub/agents/COORDINATION.md), and [creative rules](/agent-docs/creator-hub/agents/CREATIVE_OPERATING_RULES.md).`;

const coordination = `# Shared coordination and delivery\n\nPublic adaptation of the canonical coordination protocol. Internal host, scheduler, issue and credential details are omitted.\n\n${publicCommonInstructions.split('\n\n').slice(1, 3).join('\n\n')}\n\n1. Assign a task, owner, allowed files, dependencies, reviewer and budget. Check the actual tools and artifact destination before work.\n2. Deliver accessible artifacts with immutable revision or checksum, checks and limitations. Another machine's localhost or filesystem is not a shared destination.\n3. Recipient acknowledges the exact artifact and revision, accepting it or giving concrete corrections. Receipt is not visual or human acceptance.\n4. Batch routine corrections and progress within existing authorization. Escalate only a concrete scope, budget or access decision.\n5. Verify the actual served build and media independently of source state. Record URL, version, device, check time and who can reach it.\n6. Give every blocker a named owner and next action. Relay sanitized artifacts through an already authorized writer when needed; never require users to copy private logs.\n7. Use the creator's chosen accessible task record and artifact storage. GitHub is optional for a website-only creator. Do not claim unread channels, fabricate receipts or create duplicate stores of private state.\n`;

function removeSections(markdown, headings) {
  return markdown.split(/(?=^## )/m).filter(section => !headings.some(heading => section.startsWith(`## ${heading}\n`))).join('');
}

function sourceUrl(source) {
  if (source === 'creator-hub/hub/AGENT_START.md') return '/agent-start.md';
  if (allowed.has(source)) return publicPath(source);
  const role = team.roles.find(role => source === `creator-hub/agents/${role.id}.md`);
  if (role) return `/agent-roles/${role.id}.md`;
  if (source === 'creator-hub/skills/economy-simulation/SKILL.md') return '/skills/economy-simulation/SKILL.md';
  if (source === 'creator-hub/skills/economy-simulation/metadata.json') return '/skills/economy-simulation/metadata.json';
  return null;
}

function resolveReference(reference, source) {
  const [pathname, anchor] = reference.split('#');
  const suffix = anchor ? `#${anchor}` : '';
  if (!pathname) return reference;
  if (/^https?:/.test(pathname)) {
    if (/^https:\/\/(?:docs|drive)\.google\.com\//.test(pathname)) return null;
    const internal = pathname.match(/^https:\/\/github\.com\/marguerite347\/(?:ootle-lobby|tari-growth)\/blob\/[^/]+\/(.+)$/);
    if (internal) return sourceUrl(internal[1]) ? sourceUrl(internal[1]) + suffix : null;
    return /^https:\/\/github\.com\/marguerite347\/(?:ootle-lobby|tari-growth)(?:[/?#]|$)/.test(pathname) ? null : reference;
  }
  if (pathname.startsWith('/')) return reference;
  const candidates = [pathname, path.posix.normalize(path.posix.join(path.posix.dirname(source), pathname))];
  if (source.startsWith('skills/vendor/gamedev/')) candidates.push(`skills/vendor/gamedev/${pathname}`);
  for (const candidate of candidates) {
    const url = sourceUrl(candidate);
    if (url) return url + suffix;
  }
  return null;
}

// Canonical bundles remain byte-for-byte downloadable. This website view resolves
// approved cross-bundle links and labels unpublished references without exposing them.
export function rewritePublicReferences(markdown, source) {
  const rewrite = text => {
  let output = text.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (match, label, reference) => {
    const url = resolveReference(reference, source);
    return url ? `[${label}](${url})` : `${label} (internal or unpublished reference; optional, not available from this site)`;
  });
  output = output.replace(/`((?:creator-hub\/|\.agents\/|skills\/)[^`\n]+)`/g, (match, reference) => {
    const url = resolveReference(reference, source);
    return url ? `[${reference}](${url})` : match;
  });
  return output;
  };
  return markdown.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g).map((part, index) => index % 2 ? part : rewrite(part)).join('');
}

export function publicDocument(source) {
  const entry = allowed.get(source);
  if (!entry) return null;
  let body = read(source);
  if (source === 'creator-hub/agents/COORDINATION.md') body = coordination;
  if (source === 'creator-hub/VIDEO_WORKFLOWS.md') body = body.replace(/Reference the \[marketing v2 document\]\([^)]*\) for current guidance and its linked assets\. Extract only approved public guidance into presets; do not ship the private document\. There is no separate established BRAND_VOICE\.md\./, 'Use the [public brand guide](/agent-docs/creator-hub/BRAND.md) and [video policy](/agent-docs/creator-hub/VIDEO_PREVIEW_POLICY.md) for current guidance.');
  if (source === 'creator-hub/agents/CREATIVE_OPERATING_RULES.md') body = body.split('## Visual rejection and resource escalation')[0];
  if (source === 'creator-hub/BRAND.md') body = removeSections(body, ['Adoption and ownership', 'Rollout and acceptance', 'Active interface copy pass — 2026-09-23']);
  if (source.endsWith('.md')) {
    body = rewritePublicReferences(body, source);
    body = `> Website edition. Canonical source: ${source}. Internal-only references are optional and do not require private repository access. Use your own project for repository commands. This document grants no additional authorization.\n\n${body}`;
  }
  return {body, contentType: source.endsWith('.md') ? 'text/markdown' : source.endsWith('.json') ? 'application/json' : 'text/plain', sha256: digest(body)};
}

export function publicDocumentIndex() {
  return {schemaVersion: 1, guide: '/agent-start.md', roles: '/api/agent-roles', llms: '/llms.txt', llmsFull: '/llms-full.txt', openapi: '/openapi.json', coverage: 'Explicitly published documentation and existing manifest-listed skill files. No repository access required. Not a repository file browser.', total: allowed.size, items: [...allowed.values()].map(entry => ({...entry, url: publicPath(entry.source)}))};
}

function roleReads(role) {
  return role.requiredReads.map(source => {
    const url = sourceUrl(source);
    return {source, url, availability: url ? 'public' : 'internal-only', ...(url ? {} : {reason: excludedReason})};
  });
}

export function publicRoleIndex() {
  return {schemaVersion: 1, guide: '/agent-start.md', commonInstructions: publicCommonInstructions, total: team.roles.length, roles: team.roles.map(({id, name, label}) => ({id, name, label, instructions: `/agent-roles/${id}.md`, requiredReads: roleReads(team.roles.find(role => role.id === id))}))};
}

export function publicRoleMarkdown(id) {
  const role = team.roles.find(role => role.id === id);
  if (!role) return null;
  const source = `creator-hub/agents/${id}.md`;
  const canonical = read(source);
  const canonicalSpecialty = canonical.match(/## Specialty\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim() || role.mission;
  const specialty = canonicalSpecialty
    .replace('The user authorizes useful gap-based additions without repeated confirmation.', 'Additional workers require authorization within this creator’s actual task and worker cap.')
    .replace('Inspect hub/shared/workflow.mjs before emitting graph JSON; validate against the actual schema.', 'Read the public workflow guide. The internal hub/shared/workflow.mjs implementation is not published here. Do not invent schema fields or emit unvalidated graph JSON; use an existing Studio export or report the missing schema as a task-specific limitation.');
  const reads = roleReads(role).map(item => item.url ? `- [${item.source}](${item.url})` : `- ${item.source}: ${item.reason}`).join('\n');
  const body = `# ${role.name}\n\nWebsite edition of ${source}. Canonical source SHA-256: ${digest(canonical)}. Private operational instructions and inherited internal permissions are omitted.\n\n## Common instructions\n\n${publicCommonInstructions}\n\n## Specialty\n\n${specialty}\n\n## Task-relevant reading\n\n${reads}\n\n## First useful response\n\nState the task, reachable tools and materials actually read, one applied rule, and the smallest representative trial. Deliver the requested artifact where possible; identify untested claims and a concrete next action.\n`;
  return rewritePublicReferences(body, source).replace(/Submit scoped PRs through assigned Cursor workflow when tasked; Codex reviews before merge\./g, 'Use the creator’s authorized review and delivery workflow.').replace(/Route implementation via Producer\/Cursor PR with team peer review before merge, without requiring Codex approval\./g, 'Route implementation through the assigned coordinator and the creator’s authorized review workflow.');
}
