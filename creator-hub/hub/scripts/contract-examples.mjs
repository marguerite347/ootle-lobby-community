#!/usr/bin/env node
// Captures one real reply per public API operation into server/contract/examples.json.
//
//   npm run contract:examples
//
// Starts the app in-process against a throwaway data dir under the OS tmpdir, runs a
// scripted session (read docs, browse the catalogue, create and fork a project, star,
// comment, upload a tiny asset, chat, publish a lesson...), then trims and sanitizes
// the replies: long arrays keep 2 items, long strings are cut, secrets become `mk_…`
// style placeholders, and volatile IDs, git hashes and timestamps become stable ones.
// A capture that fails (for example the live Hugging Face search when offline) keeps
// the previous example and prints a warning.

import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hubRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(hubRoot, 'server', 'contract', 'examples.json');
const dataDir = mkdtempSync(path.join(tmpdir(), 'lobby-contract-examples-'));
process.env.CREATOR_HUB_DATA_DIR = dataDir;
process.env.CREATOR_HUB_PREVIEWS_DIR = path.join(dataDir, 'previews');
// Never spend provider credits while capturing examples.
for (const name of ['HF_DRAFT_ENABLED', 'HF_TOKEN', 'HUGGINGFACE_TOKEN', 'COMMUNITY_CHAT_MODERATOR_TOKEN']) delete process.env[name];

const { createApp } = await import('../server/app.mjs');
const catalog = await import('../server/catalog.mjs');
const { ensureStore } = await import('../server/projects.mjs');
catalog.load();
ensureStore();

const previous = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')).examples || {} : {};
const examples = {};
const warnings = [];
const secrets = new Map(); // real value -> placeholder
const ids = new Map(); // volatile id -> stable placeholder
let uuidCount = 0;
let hashCount = 0;
const startedAt = Date.now();

const server = createApp().listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

async function call(method, route, { body, token, query } = {}) {
  const url = new URL(base + route);
  for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const contentType = (response.headers.get('content-type') || '').split(';')[0];
  const text = await response.text();
  const value = contentType === 'application/json' ? JSON.parse(text) : text;
  return { status: response.status, contentType, cacheControl: response.headers.get('cache-control'), value };
}

// Perform a request and record it as the example for operationId.
async function capture(operationId, method, route, options = {}) {
  let reply;
  try {
    reply = await call(method, route, options);
  } catch (error) {
    reply = { status: 0, value: String(error) };
  }
  const expected = options.expect ?? (method === 'POST' && options.created ? 201 : 200);
  if (reply.status !== expected) {
    const message = `${operationId}: expected ${expected}, got ${reply.status} ${JSON.stringify(reply.value).slice(0, 300)}`;
    if (options.optional && previous[operationId]) {
      warnings.push(`${message} (kept previous example)`);
      examples[operationId] = previous[operationId];
      return reply;
    }
    if (options.optional) { warnings.push(`${message} (no example captured)`); return reply; }
    throw new Error(message);
  }
  const query = options.query && Object.keys(options.query).length ? options.query : undefined;
  examples[operationId] = {
    request: { method, path: route, ...(query ? { query } : {}), ...(options.body !== undefined ? { body: options.body } : {}), ...(options.token ? { auth: 'bearer' } : {}) },
    status: reply.status,
    contentType: reply.contentType,
    value: reply.value,
    ...(options.pick ? { pick: options.pick } : {}),
  };
  return reply;
}

const secret = (value, placeholder) => { if (value) secrets.set(value, placeholder); return value; };
const projectId = (id, n) => { if (id) ids.set(id, id.replace(/-[a-f0-9]{6}$/, `-${String(n).padStart(6, '0')}`)); return id; };
const gitHash = (hash) => {
  if (typeof hash === 'string' && /^[a-f0-9]{40}$/.test(hash) && !ids.has(hash)) {
    hashCount += 1;
    const placeholder = `${hashCount.toString(16).padStart(2, '0')}`.repeat(20);
    ids.set(hash, placeholder);
    ids.set(hash.slice(0, 8), placeholder.slice(0, 8));
  }
  return hash;
};
// Every commit in the throwaway project repos is volatile; pinned upstream revisions are not.
const noteProjectCommits = () => {
  const store = path.join(dataDir, 'projects');
  if (!existsSync(store)) return;
  for (const repo of readdirSync(store)) {
    try { execFileSync('git', ['rev-list', '--all'], { cwd: path.join(store, repo), encoding: 'utf8' }).split('\n').filter(Boolean).forEach(gitHash); } catch {}
  }
};

try {
  // --- docs -------------------------------------------------------------------
  await capture('getLlmsTxt', 'GET', '/llms.txt');
  await capture('getLlmsFullTxt', 'GET', '/llms-full.txt', { optional: true });
  await capture('getOpenApi', 'GET', '/openapi.json', { optional: true, pick: ['openapi', 'info', 'servers', 'tags'] });
  await capture('getAgentStart', 'GET', '/agent-start.md');
  const docs = await capture('listAgentDocs', 'GET', '/api/agent-docs');
  await capture('getAgentDoc', 'GET', docs.value.items.find((item) => item.source === 'creator-hub/BRAND.md').url);
  const roles = await capture('listAgentRoles', 'GET', '/api/agent-roles');
  await capture('getAgentRole', 'GET', `/agent-roles/${roles.value.roles[0].id}.md`);
  const resources = await capture('listAgentResources', 'GET', '/api/agent-resources', { query: { q: 'godot', limit: '5' } });
  await capture('getLearningLoopGuide', 'GET', '/learning-loop.md');
  await capture('getWorkflowAgentGuide', 'GET', '/api/workflows/agent-guide');
  await capture('getHealth', 'GET', '/api/health');

  // --- catalogue --------------------------------------------------------------
  await capture('listGames', 'GET', '/api/games');
  await capture('listGameStarters', 'GET', '/api/game-starters');
  const projectChatRoom = await capture('createProjectChatRoom', 'POST', '/api/project-chat/rooms', {created: true, body: {name: 'Builder', clientId: 'contract-builder-123', title: 'Moon Garden', description: 'A cozy garden game. Artists welcome.'}});
  const projectRoomId = projectChatRoom.value.id;
  await capture('listProjectChatRooms', 'GET', '/api/project-chat/rooms');
  const projectChatMessage = await capture('postProjectChatMessage', 'POST', `/api/project-chat/rooms/${projectRoomId}/messages`, {created: true, body: {name: 'Artist', clientId: 'contract-artist-123', body: 'I can help with the garden art.'}});
  await capture('listProjectChatMessages', 'GET', `/api/project-chat/rooms/${projectRoomId}/messages`);
  await capture('reportProjectChatMessage', 'POST', `/api/project-chat/rooms/${projectRoomId}/messages/${projectChatMessage.value.id}/report`, {body: {clientId: 'contract-reporter-123'}});
  await capture('reportProjectChatRoom', 'POST', `/api/project-chat/rooms/${projectRoomId}/report`, {body: {clientId: 'contract-reporter-123'}});
  await capture('getCommunityContent', 'GET', '/api/community-content');
  await capture('getSeptemberProjectMetrics', 'GET', '/api/contests/september-2026/metrics');
  const search = await capture('searchResources', 'GET', '/api/resources', { query: { q: 'platformer' } });
  const resourceId = search.value.items[0]?.id || catalog.all()[0].id;
  await capture('getResource', 'GET', `/api/resources/${encodeURIComponent(resourceId)}`);
  await capture('listCollections', 'GET', '/api/collections');
  await capture('listSources', 'GET', '/api/sources');
  await capture('getCatalogMeta', 'GET', '/api/meta');
  await capture('getPopularityStandard', 'GET', '/api/popularity-standard');
  await capture('getLearn', 'GET', '/api/learn', { query: { q: 'template' } });
  const paths = await capture('listOnboardingPaths', 'GET', '/api/onboarding');
  await capture('getOnboardingPath', 'GET', `/api/onboarding/${paths.value.paths[0].id}`);
  await capture('searchHuggingFace', 'GET', '/api/huggingface/search', { query: { kind: 'models', q: 'pixel art' }, optional: true });
  await capture('getCreatorIdeas', 'GET', '/api/creator-ideas');
  await capture('getBuildToolkit', 'GET', '/api/build-toolkit', { query: { idea: 'a small phaser platformer with three keys' } });
  await capture('rollBuildToolkit', 'GET', '/api/build-toolkit/roll', { query: { idea: 'a cozy puzzle game' } });

  // --- skills -----------------------------------------------------------------
  const skills = await capture('listSkills', 'GET', '/api/skills');
  const slug = skills.value.skills.find((skill) => skill.id === 'economy-simulation')?.id || skills.value.skills[0].id;
  await capture('getSkill', 'GET', `/api/skills/${slug}`);
  await capture('getSkillRouter', 'GET', '/skills/SKILL.md');
  await capture('getSkillMarkdown', 'GET', `/skills/${slug}/SKILL.md`);
  const ref = execFileSync('git', ['log', '-1', '--format=%H', '--', `creator-hub/skills/${slug}/SKILL.md`], { cwd: path.resolve(hubRoot, '../..'), encoding: 'utf8' }).trim();
  await capture('getPinnedSkillMarkdown', 'GET', `/skills/revisions/${ref}/${slug}/SKILL.md`);
  await capture('getSkillSupportFile', 'GET', `/skills/${slug}/metadata.json`);
  const bundled = resources.value.items.find((item) => item.bundle) || (await call('GET', '/api/agent-resources', { query: { limit: '50' } })).value.items.find((item) => item.bundle);
  await capture('getSkillBundle', 'GET', bundled.bundle);
  await capture('getSkillBundleFile', 'GET', bundled.instructions);

  const owner = await capture('createCreatorProfile', 'POST', '/api/creator-profiles', { created: true, body: { name: 'Glint Tester', bio: 'Makes tiny puzzle games.', projects: ['https://example.com/glint-tester'] } });
  const creatorId = owner.value.profile.id;
  const editKey = secret(owner.value.editKey, 'ek_…');
  const other = (await call('POST', '/api/creator-profiles', { body: { name: 'Second Maker', projects: [] } })).value;
  secret(other.editKey, 'ek_…');
  await capture('updateCreatorProfile', 'PUT', `/api/creator-profiles/${creatorId}`, { token: editKey, body: { name: 'Glint Tester', bio: 'Makes tiny puzzle games and shares what works.', projects: ['https://example.com/glint-tester'], showWork: true, showActivity: true } });
  const listing = await capture('publishSkillListing', 'POST', '/api/skill-market', {
    created: true, token: editKey,
    body: { creatorId, kind: 'skill', price: 0, title: 'Three-key room checklist', description: 'Check a one-room key-and-door level before you share it.', version: '1.0.0', purpose: 'Catch softlocks in a one-room key puzzle.', requirements: 'A playable build.', setup: 'Open the game in a browser.', instructions: '1. Collect keys in every order.\n2. Try the door before and after.\n3. Restart after a fail.', verification: 'Each order reaches the exit.', recovery: 'Revert to the last saved version.' },
  });
  await capture('getSkillMarket', 'GET', '/api/skill-market');
  await capture('downloadSkillListing', 'POST', `/api/skill-market/${listing.value.id}/download`, { body: { visitor: 'example-visitor-0001' } });

  // --- recipes and video templates --------------------------------------------
  const recipes = await capture('listRecipes', 'GET', '/api/recipes');
  const recipeId = recipes.value.recipes[0].id;
  await capture('getRecipe', 'GET', `/api/recipes/${recipeId}`);
  await capture('validateRecipeConfig', 'POST', `/api/recipes/${recipeId}/validate`, { body: { config: {} } });
  await capture('exportRecipe', 'POST', `/api/recipes/${recipeId}/export`, { body: { config: {} } });
  await capture('listStudioRecipes', 'GET', '/api/studio/recipes');
  const videos = await capture('listVideoTemplates', 'GET', '/api/video/templates');
  const templateId = videos.value.templates[0].id;
  const videoConfig = { appName: 'Glint Garden', tagline: 'Grow a garden one puzzle at a time', benefits: ['Short rounds', 'Plays in the browser'] };
  await capture('getVideoTemplate', 'GET', `/api/video/templates/${templateId}`);
  await capture('validateVideoConfig', 'POST', `/api/video/templates/${templateId}/validate`, { body: { config: videoConfig } });
  await capture('exportVideoProps', 'POST', `/api/video/templates/${templateId}/export`, { body: { config: videoConfig } });
  await capture('draftVideoCopy', 'POST', `/api/video/templates/${templateId}/draft`, { body: { brief: 'A calm puzzle game about a glowing garden.' }, expect: 503 });

  // --- projects ---------------------------------------------------------------
  const created = await capture('createProject', 'POST', '/api/projects', { created: true, body: { title: 'Key Garden', description: 'Collect three keys to open the garden gate.', author: 'Glint Tester', ecosystem: 'creative' } });
  const id = projectId(created.value.project.id, 1);
  secret(created.value.managementKey, 'mk_…');
  gitHash(created.value.head);
  const published = await capture('publishProjectVersion', 'POST', `/api/projects/${id}/publish`, { body: { state: { notes: 'Added the second key and a locked gate.' }, message: 'Add second key', author: 'Glint Tester', expectedHead: created.value.head } });
  gitHash(published.value.head);
  await capture('getProject', 'GET', `/api/projects/${id}`);
  await capture('listProjectVersions', 'GET', `/api/projects/${id}/versions`);
  await capture('getProjectState', 'GET', `/api/projects/${id}/state`, { query: { ref: 'HEAD' } });
  const fork = await capture('forkProject', 'POST', `/api/projects/${id}/fork`, { created: true, body: { title: 'Key Garden Night Riff', author: 'Second Maker', fromRef: published.value.head } });
  const forkId = projectId(fork.value.project.id, 2);
  secret(fork.value.managementKey, 'mk_…');
  gitHash(fork.value.head);
  const fromRecipe = await capture('createProjectFromRecipe', 'POST', `/api/recipes/${recipeId}/projects`, { created: true, body: { title: 'Counter Rewards', description: 'Recipe snapshot', author: 'Glint Tester', config: {} } });
  projectId(fromRecipe.value.project.id, 3);
  secret(fromRecipe.value.managementKey, 'mk_…');
  gitHash(fromRecipe.value.head);

  // --- community --------------------------------------------------------------
  await capture('toggleStar', 'POST', `/api/engagement/project/${id}/star`, { body: { user: 'visitor-example-0001' } });
  await capture('addComment', 'POST', `/api/engagement/project/${id}/comments`, { created: true, body: { author: 'Second Maker', body: 'The gate sound is great. Could the third key glow?' } });
  await capture('getEngagement', 'GET', `/api/engagement/project/${id}`, { query: { user: 'visitor-example-0001' } });
  await capture('listProjects', 'GET', '/api/projects');

  const room = 'lobby-collective';
  const posted = await capture('postCollectiveMessage', 'POST', `/api/collective-chat/rooms/${room}/messages`, { created: true, body: { author: 'Builder agent', authorKind: 'Agent', roleName: 'Gameplay engineer', kind: 'working', body: 'Wiring the key pickup to the gate state.' } });
  await capture('setCollectiveMessageState', 'PATCH', `/api/collective-chat/rooms/${room}/messages/${posted.value.id}`, { body: { clientState: 'sent' } });
  await capture('getCollectiveRoom', 'GET', `/api/collective-chat/rooms/${room}`);

  const chat = await capture('postCommunityMessage', 'POST', '/api/community-chat/messages', { created: true, body: { clientId: 'example-client-0001', name: 'Glint Tester', body: 'Anyone else making a key puzzle this week?' } });
  await capture('reportCommunityMessage', 'POST', `/api/community-chat/messages/${chat.value.id}/report`, { body: { clientId: 'example-client-0002' } });
  await capture('listCommunityMessages', 'GET', '/api/community-chat/messages');

  const challenges = await capture('listChallenges', 'GET', '/api/challenges');
  const open = challenges.value.editions.find((edition) => edition.phase === 'open');
  await capture('submitChallengeEntry', 'POST', '/api/challenges/submissions', { created: true, token: editKey, body: { creatorId, editionId: open.id, projectId: id, summary: 'One room, three keys, instant restart.', evidenceUrl: 'https://example.com/key-garden-demo' } });
  await capture('listChallengeSubmissions', 'GET', '/api/challenges/submissions');

  await capture('getLearningSubmissionStandard', 'GET', '/api/learn/submission-standard');
  await capture('shareLearningResource', 'POST', '/api/learn/resources', { created: true, token: editKey, body: { creatorId, url: 'https://example.com/guides/key-and-door-puzzles', title: 'Key and door puzzle basics', summary: 'How to gate a room with keys without softlocks.', ecosystem: 'creative', level: 'beginner', format: 'guide', topic: 'combine-mechanics', prerequisites: 'None', whyUseful: 'Short and practical.', originalAuthor: 'Example Author' } });

  const lessonContent = { title: 'Test every key order', description: 'A one-room key puzzle needs every pickup order tested.', purpose: 'Avoid softlocks.', requirements: 'A playable build.', setup: 'Open the build.', instructions: 'Collect the keys in every order and try the gate each time.', verification: 'Every order opens the gate.', recovery: 'Revert to the last version.' };
  const lesson = await capture('createLesson', 'POST', '/api/learning/lessons', { created: true, token: editKey, body: { creatorId, projectId: id, source: { kind: 'agent', reference: 'session-notes', excerpt: 'Found a softlock when key 3 was taken first.' }, content: lessonContent } });
  const lessonId = lesson.value.id;
  let revision = lesson.value.revision;
  revision = (await capture('reviewLesson', 'POST', `/api/learning/lessons/${lessonId}/review`, { token: editKey, body: { creatorId, expectedRevision: revision, sanitized: true, evidenceChecked: true, note: 'No private paths or keys.' } })).value.revision;
  revision = (await capture('trialLesson', 'POST', `/api/learning/lessons/${lessonId}/trial`, { token: editKey, body: { creatorId, expectedRevision: revision, accepted: true, summary: 'Followed the lesson on a fresh room; no softlock.', evidence: 'playtest notes', comparison: 'Same room before and after', baseline: { corrections: 3, minutes: 20 }, result: { corrections: 0, minutes: 8 } } })).value.revision;
  revision = (await capture('publishLesson', 'POST', `/api/learning/lessons/${lessonId}/publish`, { token: editKey, body: { creatorId, expectedRevision: revision, shareConfirmed: true } })).value.revision;
  await capture('listPublishedLessons', 'GET', '/api/learning/published');
  await capture('listLessons', 'GET', '/api/learning/lessons', { token: editKey, query: { creatorId } });
  await capture('retireLesson', 'POST', `/api/learning/lessons/${lessonId}/retire`, { token: editKey, body: { creatorId, expectedRevision: revision, reason: 'Replaced by a newer lesson.' } });
  const draft = (await call('POST', '/api/learning/lessons', { token: editKey, body: { creatorId, projectId: id, source: { kind: 'manual', reference: 'notes', excerpt: 'draft' }, content: lessonContent } })).value;
  const edited = await capture('editLesson', 'POST', `/api/learning/lessons/${draft.id}/edit`, { token: editKey, body: { creatorId, expectedRevision: draft.revision, content: { ...lessonContent, title: 'Test every key order (v2)' } } });
  await capture('rejectLesson', 'POST', `/api/learning/lessons/${draft.id}/reject`, { token: editKey, body: { creatorId, expectedRevision: edited.value.revision, reason: 'Merged into the published lesson.' } });

  const budget = await capture('submitBuildBudget', 'POST', '/api/build-budgets', { created: true, token: editKey, body: { creatorId, shareConfirmed: true, title: 'Key Garden', description: 'One-room key puzzle.', version: 'v2', scope: 'Design, code and sound for one room.', demoUrl: 'https://example.com/key-garden-demo', category: 'game', stage: 'prototype', costs: { ai: 3.2, assets: 0, other: 0 }, creditUsd: null, hours: 2.5 } });
  await capture('recommendBuildBudget', 'POST', `/api/build-budgets/${budget.value.id}/recommend`, { token: other.editKey, body: { creatorId: other.profile.id, tested: true, expectedRevision: budget.value.revision } });
  await capture('listBuildBudgets', 'GET', '/api/build-budgets');
  await capture('withdrawBuildBudget', 'POST', `/api/build-budgets/${budget.value.id}/withdraw`, { token: editKey, body: { creatorId, expectedRevision: budget.value.revision } });

  // --- assets -----------------------------------------------------------------
  const file = Buffer.from(JSON.stringify({ palette: ['#0b1d2a', '#c9eb00'] })).toString('base64');
  const uploaded = await capture('uploadAsset', 'POST', '/api/assets', { created: true, body: { title: 'Garden palette', creator: 'Glint Tester', description: 'Two-color palette used in Key Garden.', license: 'CC0-1.0', kind: 'asset', filename: 'garden-palette.json', base64: file } });
  const assetId = uploaded.value.id;
  await capture('searchAssets', 'GET', '/api/assets', { query: { q: 'palette', limit: '2' } });
  await capture('downloadAsset', 'GET', `/api/assets/${assetId}/file`);
  await capture('getAssetCommercePlan', 'GET', `/api/assets/${assetId}/commerce`);
  await capture('saveAssetCommerceDraft', 'PUT', `/api/assets/${assetId}/commerce`, { body: { expectedRevision: 1, commerce: { ...uploaded.value.commerce, nft: { ...uploaded.value.commerce.nft, collectionName: 'Garden palettes' } } } });
  await capture('getComfyWorkflowExample', 'GET', '/api/workflows/comfy-example');

  // Destructive history action last, on the fork only.
  const forkDetail = (await call('GET', `/api/projects/${forkId}`)).value;
  noteProjectCommits();
  await capture('manageProjectHistory', 'POST', `/api/projects/${forkId}/manage-history`, { token: fork.value.managementKey, body: { action: 'clear-history', expectedHead: forkDetail.head, confirmation: forkId } });
  noteProjectCommits();
} finally {
  await new Promise((resolve) => server.close(resolve));
}

// --- trim and sanitize ---------------------------------------------------------
const MAX_OBJECTS = 2; // top-level arrays of objects; nested ones keep 1
const MAX_PRIMITIVES = 6;
const MAX_STRING = 300;
const MAX_TEXT_BODY = 900;
const MAX_MAP_KEYS = 6;

// Notes are deduplicated by shape (`items[].tags`) so the list stays readable.
function trim(value, where, notes, depth = 0) {
  if (Array.isArray(value)) {
    const primitive = value.every((item) => item === null || typeof item !== 'object');
    const max = primitive ? MAX_PRIMITIVES : depth === 0 ? MAX_OBJECTS : 1;
    if (value.length > max) {
      const shape = where.replace(/\[\d+\]/g, '[]') || 'reply';
      notes.set(shape, shape.includes('[]') ? `${shape}: trimmed to ${max}` : `${shape}: first ${max} of ${value.length}`);
    }
    return value.slice(0, max).map((item, index) => trim(item, `${where}[${index}]`, notes, depth + 1));
  }
  if (value && typeof value === 'object') {
    let entries = Object.entries(value);
    // Count maps (facets) can have hundreds of keys; keep a few.
    if (entries.length > MAX_MAP_KEYS * 2 && entries.every(([, item]) => typeof item === 'number')) {
      const shape = where.replace(/\[\d+\]/g, '[]');
      notes.set(shape, `${shape}: first ${MAX_MAP_KEYS} of ${entries.length} keys`);
      entries = entries.slice(0, MAX_MAP_KEYS);
    }
    return Object.fromEntries(entries.map(([key, item]) => [key, trim(item, where ? `${where}.${key}` : key, notes, depth)]));
  }
  if (typeof value === 'string' && value.length > MAX_STRING) return `${value.slice(0, MAX_STRING)}…`;
  // Time-based scores drift every run; 3 decimals keep the example stable.
  if (typeof value === 'number' && !Number.isInteger(value)) return Math.round(value * 1000) / 1000;
  return value;
}

const recent = (iso) => Math.abs(Date.parse(iso) - startedAt) < 36 * 3600 * 1000;
function sanitize(text) {
  let out = text;
  for (const [real, placeholder] of secrets) out = out.split(real).join(placeholder);
  for (const [real, placeholder] of [...ids].sort((a, b) => b[0].length - a[0].length)) out = out.split(real).join(placeholder);
  out = out.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, (uuid) => {
    if (uuid.startsWith('00000000-0000-4000-8000-')) return uuid; // already a placeholder
    if (!ids.has(uuid)) ids.set(uuid, `00000000-0000-4000-8000-${String(++uuidCount).padStart(12, '0')}`);
    return ids.get(uuid);
  });
  return out.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, (iso) => (recent(iso) ? '2026-09-26T12:00:00.000Z' : iso));
}

const output = {};
for (const [operationId, example] of Object.entries(examples).sort(([a], [b]) => a.localeCompare(b))) {
  if (example.captured) { output[operationId] = example; continue; }
  const notes = new Map();
  let value = example.value;
  if (example.pick && value && typeof value === 'object') {
    const kept = Object.fromEntries(example.pick.filter((key) => key in value).map((key) => [key, value[key]]));
    notes.set('pick', `only ${example.pick.join(', ')} shown`);
    value = kept;
  }
  if (typeof value === 'string') {
    if (value.length > MAX_TEXT_BODY) notes.set('text', `first ${MAX_TEXT_BODY} of ${value.length} characters`);
    value = value.length > MAX_TEXT_BODY ? `${value.slice(0, MAX_TEXT_BODY)}…` : value;
  } else {
    value = trim(value, '', notes);
  }
  const { pick, ...rest } = example;
  output[operationId] = JSON.parse(sanitize(JSON.stringify({ ...rest, value, ...(notes.size ? { trimmed: [...notes.values()] } : {}), captured: true })));
}

writeFileSync(outFile, `${JSON.stringify({
  note: 'Generated by `npm run contract:examples`. Real replies from an in-process run against an empty data dir, trimmed and sanitized. Do not edit by hand.',
  examples: output,
}, null, 2)}\n`);
rmSync(dataDir, { recursive: true, force: true });
for (const warning of warnings) console.warn(`[contract:examples] ${warning}`);
console.log(`[contract:examples] wrote ${Object.keys(output).length} examples to ${path.relative(process.cwd(), outFile)}`);
process.exit(0);
