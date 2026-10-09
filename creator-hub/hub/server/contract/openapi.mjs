// Ootle Lobby public HTTP contract (OpenAPI 3.1), hand-authored from server/app.mjs
// and the handler modules. This is the single source of truth for /openapi.json,
// /llms.txt and /llms-full.txt. Example replies come from examples.json, which
// `npm run contract:examples` captures from a real in-process run.
//
// Routes intentionally left out are listed, with reasons, in internalRoutes.mjs.
// server/test/contract.test.mjs fails when the app and this file disagree.
// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.

import { readFileSync, existsSync } from 'node:fs';
import {publicRestriction} from '../publicAccess.mjs';

const examplesFile = new URL('./examples.json', import.meta.url);
export const capturedExamples = existsSync(examplesFile) ? JSON.parse(readFileSync(examplesFile, 'utf8')).examples : {};

export const PLACEHOLDER_ORIGIN = 'https://<lobby-origin>';

// Order an agent meets them: read docs, browse, make, Riff, assets, community.
export const TAGS = [
  { name: 'docs', description: 'Start here. Agent guide, machine-readable docs, public standards, roles and resource indexes.' },
  { name: 'catalogue', description: 'Browse games, starters, resources, collections, sources and learning paths.' },
  { name: 'projects', description: 'Create, save, version and fork (Riff) git-backed projects.' },
  { name: 'assets', description: 'Search, upload and download community assets and draft their listing plans.' },
  { name: 'community', description: 'Stars, comments, chat rooms, weekly challenges, shared learning and build cost reports.' },
  { name: 'skills', description: 'Agent skills: native TariSkills, bundled skills, the skill market and creator profiles.' },
  { name: 'recipes', description: 'Composable recipes with typed configuration, and Studio design recipes.' },
  { name: 'video', description: 'Remotion video templates: validate a configuration and export render props.' },
];

// --- helpers -------------------------------------------------------------------
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const str = (description, extra = {}) => ({ type: 'string', ...(description ? { description } : {}), ...extra });
const nstr = (description) => ({ type: ['string', 'null'], ...(description ? { description } : {}) });
const int = (description, extra = {}) => ({ type: 'integer', ...(description ? { description } : {}), ...extra });
const num = (description) => ({ type: 'number', ...(description ? { description } : {}) });
const bool = (description) => ({ type: 'boolean', ...(description ? { description } : {}) });
const arr = (items, description) => ({ type: 'array', items, ...(description ? { description } : {}) });
const obj = (properties, required = [], extra = {}) => ({ type: 'object', properties, ...(required.length ? { required } : {}), ...extra });
const anyObject = (description) => ({ type: 'object', ...(description ? { description } : {}) });
const path = (name, description, schema = { type: 'string' }) => ({ name, in: 'path', required: true, description, schema });
const query = (name, description, schema = { type: 'string' }, required = false) => ({ name, in: 'query', required, description, schema });

const JSON_TYPE = 'application/json';
const MARKDOWN = 'text/markdown';
const TEXT = 'text/plain';

const creatorAuthNote = 'Creator-profile auth: send `creatorId` (in the body, or the query for GET) and `Authorization: Bearer <editKey>` from POST /api/creator-profiles. A wrong or missing key returns 403.';

// --- shared schemas ------------------------------------------------------------
const schemas = {
  Error: obj({
    error: str('Human-readable reason.'),
    code: str('Machine-readable rejection kind, when the route has one (community chat: link, secret, blocked, duplicate, rate_limited).'),
    errors: arr(ref('FieldError'), 'Field-level validation errors (recipe and video export).'),
  }, ['error'], { description: 'Every JSON error reply. Body-parser failures (malformed JSON, body over 256 kB) use the Express default HTML error page instead.' }),
  FieldError: obj({ field: str(), reason: str() }, ['field', 'reason']),
  ValidationResult: obj({
    ok: bool('True when the configuration is valid.'),
    errors: arr(ref('FieldError')),
    config: anyObject('The configuration with defaults filled in.'),
  }, ['ok', 'errors', 'config']),
  EngagementCounts: obj({ stars: int(), comments: int() }, ['stars', 'comments']),
  Popularity: obj({
    standardVersion: int(),
    score: { type: ['integer', 'null'] },
    tier: str(),
    tierLabel: str(),
    confidence: str(),
    dimensions: anyObject('Normalized 0..1 values per dimension (reach, adoption, momentum, engagement).'),
    contributions: arr(str()),
    native: { type: ['object', 'null'] },
    sources: arr(str()),
  }, ['score', 'tier'], { description: 'Computed popularity signal. See GET /api/popularity-standard.' }),
  Provenance: obj({
    sourceId: str(), sourceName: str(), upstreamId: nstr(), upstreamUrl: nstr(), upstreamRevision: { type: ['string', 'integer', 'null'], description: 'Commit, release id or version number upstream.' },
    sourceUpdatedAt: nstr(), fetchedAt: nstr(), freshness: str(),
  }, ['sourceId']),
  Resource: obj({
    schemaVersion: int(),
    id: str('Stable id, for example `tari-ootle:starter:examples-guessing-game-template`. URL-encode it in paths.'),
    type: str('starter, component, recipe, app, integration, asset or learn.'),
    ecosystem: str('tari-ootle, gdevelop, luanti, playcanvas, huggingface, creative or community.'),
    native: bool('True only for native Tari Ootle resources.'),
    title: str(),
    summary: nstr(),
    sourceUrl: nstr(), repoUrl: nstr(), docsUrl: nstr(), demoUrl: nstr(),
    readiness: str('conceptual, runnable-example, tested-release, deprecated or community-upload.'),
    license: nstr('Unknown license (null) is not free to use.'),
    prerequisites: arr(str()),
    tags: arr(str()),
    category: nstr(),
    assetKind: str('Present on asset records: asset, pack, workflow, model, dataset or tool.'),
    access: str('free or sale-draft, on asset records.'),
    verification: str('unverified, source-attested or hub-verified.'),
    provenance: ref('Provenance'),
    engagement: ref('EngagementCounts'),
    popularity: ref('Popularity'),
    preview: { type: ['object', 'null'] },
  }, ['id', 'type', 'title'], { description: 'A catalogue record. Imported facts sit at the top level; community notes live under `editorial`. More fields may appear.' }),
  Project: obj({
    id: str('`<slug>-<6 hex>`.'),
    title: str(),
    description: str(),
    ecosystem: nstr(),
    author: str('Self-declared name, "anonymous" when omitted.'),
    createdAt: str(), updatedAt: str(),
    forkedFrom: nstr('Source project id for a fork.'),
    forkedAtRef: nstr('Full commit hash the fork started from.'),
  }, ['id', 'title', 'author', 'createdAt', 'updatedAt', 'forkedFrom', 'forkedAtRef']),
  ProjectListing: {
    allOf: [ref('Project'), obj({
      recentActivity: int('Comments and forks in the last 7 days.'),
      engagement: ref('EngagementCounts'),
      forks: int(),
      popularity: ref('Popularity'),
      release: { type: 'null', description: 'Always null: there is no playable release system yet.' },
    }, ['engagement', 'forks', 'popularity', 'release'])],
  },
  Version: obj({ hash: str('Full commit hash.'), shortHash: str(), author: str(), date: str(), subject: str('Save message.') }, ['hash', 'shortHash', 'author', 'date', 'subject']),
  ProjectState: obj({
    templateId: nstr(),
    components: arr(anyObject()),
    recipe: { type: ['object', 'null'], description: 'A saved recipe export manifest.' },
    notes: str(),
    workflow: obj({ version: int(), nodes: arr(anyObject()), edges: arr(anyObject()) }, ['version', 'nodes', 'edges']),
    setupPlan: anyObject(),
    productionReview: anyObject(),
    updatedAt: str(),
  }, ['workflow'], { description: 'The saved state.json of one version. Free-form keys are kept as sent.' }),
  CreatedProject: obj({
    project: ref('Project'),
    head: str('Commit hash of the first version.'),
    managementKey: str('Shown once. Needed for destructive history actions. Store it privately; never log or share it.'),
  }, ['project', 'head', 'managementKey']),
  Comment: obj({ id: str(), author: str(), body: str(), at: str() }, ['id', 'author', 'body', 'at']),
  CollectiveMessage: obj({
    id: str(), at: str(), author: str(),
    authorKind: str('Human, Agent, Moderator or System.'),
    roleName: str(), body: str(),
    kind: str('working, blocker or delivered.'),
    artifactUrl: str(),
    clientState: str('queued, sent or failed.'),
    label: str('Display label, for example "Agent · Gameplay engineer".'),
  }, ['id', 'at', 'author', 'authorKind', 'body', 'kind', 'clientState']),
  CommunityMessage: obj({ id: str(), at: str(), name: str(), body: str() }, ['id', 'at', 'name', 'body']),
  CreatorProfile: obj({
    id: str(), name: str(), bio: str(), showWork: bool(), showActivity: bool(),
    projects: arr(str(), 'Project links. Empty when showWork is false.'),
  }, ['id', 'name', 'showWork', 'showActivity', 'projects']),
  SkillListing: obj({
    id: str(), kind: str('skill or workflow.'), title: str(), description: str(), version: str(),
    creatorId: str(), price: num(), currency: str(), lifecycle: str(), publishedAt: nstr(),
    downloads: int(), weeklyDownloads: int(),
  }, ['id', 'kind', 'title']),
  SkillMetadata: obj({
    id: str(), title: str(), description: str(), version: str(),
    lifecycle: str('For example experimental or verified.'),
    networks: arr(str()), sourceCheckedAt: nstr(), technicalValidatedAt: nstr(),
    validation: obj({ scope: str(), evidence: arr(str()) }),
  }, ['id', 'title', 'version', 'lifecycle']),
  SkillBundle: obj({
    schemaVersion: int(), id: str(), version: str(), sourceUrl: str(),
    files: { type: 'object', additionalProperties: { type: 'string' }, description: 'File name to file text.' },
    sha256: { type: 'object', additionalProperties: { type: 'string' } },
  }, ['schemaVersion', 'id', 'version', 'files', 'sha256']),
  AgentResource: obj({
    id: str(), title: str(), description: str(), version: str(), lifecycle: str(),
    instructions: str('Path to SKILL.md.'), bundle: str('Path to bundle.json (bundled and lesson skills).'),
    metadata: str('Path to metadata (native skills).'),
  }, ['id', 'title', 'instructions']),
  Lesson: obj({
    id: str(), ownerId: str(), projectId: str(), projectRevision: nstr(),
    content: ref('LessonContent'),
    source: obj({ kind: str('manual, agent or beacon.'), reference: str(), excerpt: str('Private. Never published.'), sha256: str() }),
    state: str('draft, reviewed, tested, published, retired or rejected.'),
    revision: int('Send as expectedRevision on the next action.'),
    createdAt: str(), updatedAt: str(),
    review: { type: ['object', 'null'] },
    trials: arr(anyObject()),
    history: arr(obj({ at: str(), state: str(), revision: int() })),
    publishedAt: str(),
  }, ['id', 'ownerId', 'content', 'state', 'revision']),
  LessonContent: obj(Object.fromEntries(['title', 'description', 'purpose', 'requirements', 'setup', 'instructions', 'verification', 'recovery'].map((key) => [key, str()])),
    ['title', 'description', 'purpose', 'requirements', 'setup', 'instructions', 'verification', 'recovery'],
    { description: 'All eight fields are required text. Title up to 120, description up to 500, others up to 12000 characters.' }),
  UploadedAsset: {
    allOf: [ref('Resource'), obj({
      creator: obj({ name: str() }),
      commerce: ref('CommerceDraft'),
      commerceRevision: int('Send as expectedRevision when saving the draft.'),
      commerceState: str('Always draft.'),
      rightsReview: str(),
      filename: str(), bytes: int(), sha256: str(), createdAt: str(),
    }, ['commerce', 'commerceRevision', 'filename', 'bytes', 'sha256'])],
  },
  CommerceDraft: obj({
    sale: obj({ mode: str('free or fixed-price.'), price: str('Decimal string, empty when free.'), currencyLabel: str(), inventory: int() }, ['mode', 'price', 'currencyLabel', 'inventory']),
    nft: obj({ enabled: bool(), preset: str(), collectionName: str(), symbol: str(), supplyCap: int(), mintAuthority: str() }, ['enabled', 'preset']),
  }, ['sale', 'nft'], { description: 'A listing plan only. Nothing is minted, sold or deployed.' }),
  ChallengeEdition: obj({
    id: str('creator-week-<n>'), number: int(), theme: str(), title: str(), brief: str(), metric: str(), evidence: str(),
    startDate: str(), endDateExclusive: str(), timezone: str(),
    phase: str('archive, open or upcoming. Only the open edition takes submissions.'),
    target: int(), rewardStatus: str(), rewardAmount: { type: ['number', 'null'] },
    submitted: int(), verified: int(),
  }, ['id', 'title', 'phase']),
  ChallengeSubmission: obj({
    editionId: str(), creatorId: str(), projectId: str(), projectRef: str('Project head at submission time.'),
    summary: str(), evidenceUrl: str(), submittedAt: str(), review: str('pending until reviewed.'), schemaVersion: int(),
  }, ['editionId', 'projectId', 'projectRef', 'summary', 'evidenceUrl', 'submittedAt', 'review']),
  BuildToolkit: obj({
    idea: str(), selected: nstr('Title of the selected resource.'), projectId: nstr(), foundation: { type: 'null' },
    skills: arr(ref('AgentResource')),
    resources: obj({ foundations: arr(anyObject()), assets: arr(anyObject()), tools: arr(anyObject()) }, ['foundations', 'assets', 'tools']),
    brief: str('A ready-to-paste build brief for an agent.'),
    setup: anyObject('Engine and tool setup requirements to confirm before dependent work.'),
    coverage: str(),
  }, ['idea', 'skills', 'resources', 'brief', 'setup']),
  RecipeManifest: obj({
    schemaVersion: int(), recipe: obj({ id: str(), version: str(), title: str() }, ['id', 'version', 'title']),
    engine: str(), status: str(), verifiedTestnet: bool(),
    components: arr(obj({ id: str(), templateId: str(), source: str(), revision: str() })),
    connections: arr(anyObject()), adapter: anyObject(), parameters: anyObject(), generatedAt: str(), note: str(),
  }, ['schemaVersion', 'recipe', 'components', 'parameters']),
};

// --- operations ----------------------------------------------------------------
// Each entry: method, path (OpenAPI syntax), tag, operationId, summary, description,
// optional parameters, body (JSON request schema), response (schema + status +
// contentType), errors (status list), auth ('management' | 'creator'), expressPath
// (when the Express path is a wildcard or RegExp).
const creatorBody = (properties, required = []) => obj({ creatorId: str('Your creator profile id.'), ...properties }, ['creatorId', ...required]);
const lessonAction = (action, summary, description, properties, required) => ({
  method: 'post', path: `/api/learning/lessons/{id}/${action}`, tag: 'community', auth: 'creator',
  operationId: `${action}Lesson`, summary, description: `${description} Send the lesson's current revision as expectedRevision; a stale revision returns 409. ${creatorAuthNote}`,
  parameters: [path('id', 'Lesson id (`lesson-<uuid>`).')],
  body: creatorBody({ expectedRevision: int(), ...properties }, ['expectedRevision', ...required]),
  response: { schema: ref('Lesson') }, errors: [400, 403, 404, 409],
});

export const OPERATIONS = [
  // docs
  { method: 'get', path: '/llms.txt', tag: 'docs', operationId: 'getLlmsTxt', summary: 'Short entry point for agents',
    description: 'Plain-text overview: what the Lobby is, what works today and where to read next. Generated from this contract.',
    response: { contentType: TEXT, schema: str() } },
  { method: 'get', path: '/llms-full.txt', tag: 'docs', operationId: 'getLlmsFullTxt', summary: 'Every public endpoint with a worked example',
    description: 'Long form of llms.txt: for each public operation, what it is for, a curl line and a real example reply. Generated from this contract.',
    response: { contentType: TEXT, schema: str() } },
  { method: 'get', path: '/openapi.json', tag: 'docs', operationId: 'getOpenApi', summary: 'This OpenAPI 3.1 contract',
    description: 'Machine-readable contract for every public route. Cached for 5 minutes. Routes left out on purpose are internal (marketing, analytics, moderation, the Daily Spark game).',
    response: { schema: obj({ openapi: str(), info: anyObject(), paths: anyObject() }, ['openapi', 'info']) } },
  { method: 'get', path: '/agent-start.md', tag: 'docs', operationId: 'getAgentStart', summary: 'Agent Start guide (Markdown)',
    description: 'The full guide for agents building here: the golden path, rules and links. Read it before planning a build. A human-readable HTML version lives at /agent-start.',
    response: { contentType: MARKDOWN, schema: str() } },
  { method: 'get', path: '/api/agent-docs', tag: 'docs', operationId: 'listAgentDocs', summary: 'Index of published docs',
    description: 'Lists every public standard and skill file you can read from this origin (no repository access needed). Each item has a `url` under /agent-docs/.',
    response: { schema: obj({ schemaVersion: int(), guide: str(), roles: str(), llms: str(), llmsFull: str(), openapi: str(), coverage: str(), total: int(), items: arr(obj({ source: str(), kind: str('document or skill.'), url: str(), skillId: str(), bundle: str() }, ['source', 'kind', 'url'])) }, ['total', 'items']) } },
  { method: 'get', path: '/agent-docs/{path}', expressPath: '/agent-docs/*', tag: 'docs', operationId: 'getAgentDoc', summary: 'Read one published doc',
    description: 'Serves one document from /api/agent-docs by its source path (the path may contain slashes). Markdown gets a website-edition banner and rewritten links. Sends an ETag of the body hash. Paths not in the index return 404.',
    parameters: [path('path', 'Source path from the index, for example `creator-hub/BRAND.md`. May contain slashes.')],
    response: { contentType: MARKDOWN, schema: str(), note: 'Also application/json or text/plain, by file type.' }, errors: [404] },
  { method: 'get', path: '/api/agent-roles', tag: 'docs', operationId: 'listAgentRoles', summary: 'Public agent roles',
    description: 'Roles (producer, designer, engineer...) with shared instructions and which reads are public. Pick one role for your task.',
    response: { schema: obj({ schemaVersion: int(), guide: str(), commonInstructions: str(), total: int(), roles: arr(obj({ id: str(), name: str(), label: str(), instructions: str('Path to the role Markdown.'), requiredReads: arr(obj({ source: str(), url: nstr(), availability: str('public or internal-only.') })) }, ['id', 'name', 'instructions'])) }, ['total', 'roles']) } },
  { method: 'get', path: '/agent-roles/{id}.md', expressPath: '/agent-roles/:id.md', tag: 'docs', operationId: 'getAgentRole', summary: 'One role as Markdown',
    description: 'Website edition of a role: shared instructions, specialty and task-relevant reading.',
    parameters: [path('id', 'Role id from /api/agent-roles, for example `producer`.')],
    response: { contentType: MARKDOWN, schema: str() }, errors: [404] },
  { method: 'get', path: '/api/agent-resources', tag: 'docs', operationId: 'listAgentResources', summary: 'Search agent skills and lessons',
    description: 'Bundled skills, native TariSkills and published creator lessons, with paths to their instructions. Paginate with offset until nextOffset is null. This is a catalogue, not a list of tools you have installed.',
    parameters: [query('q', 'Words that must all appear in title, description or id (max 160 chars).'), query('offset', 'Start index (digits).', str(null, { default: '0' })), query('limit', '1 to 50.', str(null, { default: '20' }))],
    response: { schema: obj({ schemaVersion: int(), guide: str(), coverage: str(), total: int(), items: arr(ref('AgentResource')), nextOffset: { type: ['integer', 'null'] } }, ['total', 'items', 'nextOffset']) }, errors: [400] },
  { method: 'get', path: '/learning-loop.md', tag: 'docs', operationId: 'getLearningLoopGuide', summary: 'Learning loop API guide',
    description: 'How to turn a build lesson into a reviewed, trialled and published skill with the /api/learning/lessons routes.',
    response: { contentType: MARKDOWN, schema: str() } },
  { method: 'get', path: '/api/workflows/agent-guide', tag: 'docs', operationId: 'getWorkflowAgentGuide', summary: 'Creation workflow guide',
    description: 'How project workflows (the node graph saved in project state) are structured and edited.',
    response: { contentType: MARKDOWN, schema: str() } },
  { method: 'get', path: '/api/health', tag: 'docs', operationId: 'getHealth', summary: 'Health check',
    description: 'Returns ok when the server is up.',
    response: { schema: obj({ ok: bool(), service: str() }, ['ok']) } },

  // catalogue
  { method: 'get', path: '/api/games', tag: 'catalogue', operationId: 'listGames', summary: 'Published games',
    description: 'Playable games in the Lobby. There are no published games yet, so both lists are empty. Not cached.',
    response: { schema: obj({ originals: arr(anyObject()), remixes: arr(anyObject()) }, ['originals', 'remixes']) } },
  { method: 'get', path: '/api/game-starters', tag: 'catalogue', operationId: 'listGameStarters', summary: 'Game foundations by genre',
    description: 'Starters, frameworks, components and mods you can build from, tagged with genres, kind and engine. Large (over 1000 items).',
    response: { schema: obj({ items: arr({ allOf: [ref('Resource'), obj({ genres: arr(str()), kind: str(), engine: str() })] }), genres: arr(obj({ id: str(), label: str(), count: int() })) }, ['items', 'genres']) } },
  { method: 'get', path: '/api/project-chat/rooms', tag: 'community', operationId: 'listProjectChatRooms', summary: 'Project invitations from creators', description: 'Lists visible public project invitations, newest first. Each invitation names its creator and describes the help wanted.', response: {schema: obj({rooms: arr(anyObject())}, ['rooms'])} },
  { method: 'post', path: '/api/project-chat/rooms', tag: 'community', operationId: 'createProjectChatRoom', summary: 'Post a project and create its public chat room', description: 'Creates a joinable room and publishes its invitation. Uses Community chat input validation and rate limits. Names are self-chosen, not verified.',
    body: obj({name: str(), clientId: str(), title: str('Up to 60 characters.'), description: str('Project and help wanted, up to 400 characters.')}, ['name','clientId','title','description']), response: {status: 201, schema: anyObject()}, errors: [400,409,429] },
  { method: 'get', path: '/api/project-chat/rooms/{roomId}/messages', tag: 'community', operationId: 'listProjectChatMessages', summary: 'Read a project room', description: 'Returns the visible messages and removed IDs for one existing project invitation. Unknown or hidden rooms return 404.', parameters: [path('roomId', 'Project invitation id.')], response: {schema: anyObject()}, errors: [404] },
  { method: 'post', path: '/api/project-chat/rooms/{roomId}/messages', tag: 'community', operationId: 'postProjectChatMessage', summary: 'Contribute to a project conversation', description: 'Posts a text message into the selected project room. Community chat name, body, duplicate and rate limits apply.', parameters: [path('roomId', 'Project invitation id.')], body: obj({name: str(), clientId: str(), body: str()}, ['name','clientId','body']), response: {status: 201, schema: anyObject()}, errors: [400,404,429] },
  { method: 'post', path: '/api/project-chat/rooms/{roomId}/report', tag: 'community', operationId: 'reportProjectChatRoom', summary: 'Report a project invitation', description: 'Records one report per browser. Three distinct reports hide the invitation and make its conversation unavailable. Own invitations cannot be reported.', parameters: [path('roomId', 'Project invitation id.')], body: obj({clientId: str()}, ['clientId']), response: {schema: anyObject()}, errors: [400,404] },
  { method: 'post', path: '/api/project-chat/rooms/{roomId}/messages/{messageId}/report', tag: 'community', operationId: 'reportProjectChatMessage', summary: 'Report a project-room message', description: 'Records one report per browser. Three distinct reports hide the message. Own messages cannot be reported.', parameters: [path('roomId', 'Project invitation id.'), path('messageId', 'Message id.')], body: obj({clientId: str()}, ['clientId']), response: {schema: anyObject()}, errors: [400,404] },
  { method: 'get', path: '/api/community-content', tag: 'catalogue', operationId: 'getCommunityContent', summary: 'Accepted community project-card content',
    description: 'Validated content published from the protected public repository. Includes the source commit revision and last-good fallback status. Refreshes at most once per minute. Proposals are reviewed on GitHub; this endpoint is read-only.',
    response: {schema: anyObject('schemaVersion, revision, publishedAt, projects, repositoryUrl, checkedAt and cached.')} },
  { method: 'get', path: '/api/contests/september-2026/metrics', tag: 'catalogue', operationId: 'getSeptemberProjectMetrics', summary: 'GitHub stars, forum comments and project dates for September entries',
    description: 'Counts and activity dates refresh at most every six hours. Forum publishedAt is the original submission creation timestamp; updatedAt includes submission edits and curated creator update posts, never unrelated comments. GitHub pushedAt is repository push activity, not a release or project-specific update. Cards sort by publication date and only show later activity on a different UTC calendar date. Each source includes checkedAt. Forum counts include nested replies to the individual contest submission, excluding unrelated posts. Missing counts are null; GitHub is null for repositories hosted elsewhere.',
    response: { schema: obj({ checkedAt: str(), items: anyObject('Metrics keyed by resource id. Each item contains github (nullable) and forum counts, source URLs and checkedAt timestamps.') }, ['checkedAt', 'items']) } },
  { method: 'get', path: '/api/resources', tag: 'catalogue', operationId: 'searchResources', summary: 'Search the resource catalogue',
    description: 'Full-text and faceted search over every catalogue record. Default order: native Ootle first, then ecosystem and title. Returns all matches (no pagination).',
    parameters: [query('q', 'Words that must all match title, summary, category, creator, ecosystem or tags.'), query('type', 'starter, component, recipe, app, integration, asset or learn.'), query('ecosystem', 'For example tari-ootle or gdevelop.'), query('readiness', 'For example runnable-example.'), query('tag', 'Exact tag, case-insensitive.'), query('sort', '`popular` sorts by popularity score.'), query('native', '`true` or `false`.'), query('verified', '`true` hides unverified records.')],
    response: { schema: obj({ count: int(), facets: anyObject('Counts per type, ecosystem, readiness, level, format, topic and tag.'), items: arr(ref('Resource')) }, ['count', 'facets', 'items']) } },
  { method: 'get', path: '/api/resources/{id}', tag: 'catalogue', operationId: 'getResource', summary: 'One resource with related records',
    description: 'A single catalogue record plus typed `related` links. URL-encode the id (it contains colons).',
    parameters: [path('id', 'Resource id, URL-encoded.')],
    response: { schema: { allOf: [ref('Resource'), obj({ related: arr(anyObject()) }, ['related'])] } }, errors: [404] },
  { method: 'get', path: '/api/collections', tag: 'catalogue', operationId: 'listCollections', summary: 'Curated collections',
    description: 'Hand-picked shelves (native Ootle starters, testnet apps, 2D starters, voxel). Each shows up to 6 items and a total count.',
    response: { schema: obj({ collections: arr(obj({ id: str(), title: str(), description: str(), query: anyObject(), count: int(), items: arr(ref('Resource')) }, ['id', 'title', 'count', 'items'])) }, ['collections']) } },
  { method: 'get', path: '/api/sources', tag: 'catalogue', operationId: 'listSources', summary: 'Catalogue sources and freshness',
    description: 'Where catalogue records come from, how they are refreshed and how fresh each source is.',
    response: { schema: obj({ sources: arr(obj({ id: str(), name: str(), kind: str(), canonicalUrl: str(), freshness: str(), recordCount: int() }, ['id', 'name'])) }, ['sources']) } },
  { method: 'get', path: '/api/meta', tag: 'catalogue', operationId: 'getCatalogMeta', summary: 'Catalogue snapshot info',
    description: 'Snapshot time, record count and the source list.',
    response: { schema: obj({ generatedAt: nstr(), records: int(), sources: arr(anyObject()) }, ['records', 'sources']) } },
  { method: 'get', path: '/api/popularity-standard', tag: 'catalogue', operationId: 'getPopularityStandard', summary: 'How popularity is scored',
    description: 'Dimensions, weights, reference values and tiers behind every `popularity` object.',
    response: { schema: obj({ version: int(), dimensions: anyObject(), references: anyObject(), momentumHalfLifeDays: num(), tiers: arr(obj({ id: str(), label: str(), min: num() })) }, ['version', 'dimensions', 'tiers']) } },
  { method: 'get', path: '/api/learn', tag: 'catalogue', operationId: 'getLearn', summary: 'Learning guides and skills by goal',
    description: 'Learn-type records and learning skills grouped by category and creator goal. `topic` only marks the active group; it does not filter.',
    parameters: [query('q', 'Text filter.'), query('topic', 'Active goal topic, for display.'), query('level', 'beginner, intermediate, advanced or all-levels.'), query('format', 'guide, video, course, reference, tool or collection.'), query('ecosystem', 'Ecosystem filter.')],
    response: { schema: obj({ generatedAt: nstr(), count: int(), categories: arr(anyObject()), activeTopic: nstr(), topics: arr(obj({ id: str(), label: str(), items: arr(anyObject()) })), other: arr(anyObject()), facets: anyObject() }, ['count', 'categories', 'topics', 'other']) } },
  { method: 'get', path: '/api/onboarding', tag: 'catalogue', operationId: 'listOnboardingPaths', summary: 'Starting paths by goal',
    description: 'Goal-based starting paths (on-chain game, no-code 2D, voxel...).',
    response: { schema: obj({ paths: arr(obj({ id: str(), goal: str(), audience: str(), ecosystem: str(), blurb: str(), external: bool() }, ['id', 'goal'])) }, ['paths']) } },
  { method: 'get', path: '/api/onboarding/{id}', tag: 'catalogue', operationId: 'getOnboardingPath', summary: 'One path with live recommendations',
    description: 'A path resolved against the current catalogue: preferred starter, recommendations, steps and learning links.',
    parameters: [path('id', 'Path id from /api/onboarding.')],
    response: { schema: obj({ id: str(), goal: str(), steps: arr(str()), ecosystemLabel: str(), preferred: { type: ['object', 'null'] }, recommended: arr(ref('Resource')), alsoExplore: arr(ref('Resource')), learn: arr(ref('Resource')) }, ['id', 'goal', 'recommended']) }, errors: [404] },
  { method: 'get', path: '/api/huggingface/search', tag: 'catalogue', operationId: 'searchHuggingFace', summary: 'Live Hugging Face search',
    description: 'Searches public Hugging Face models, datasets or Spaces (24 per page) and returns them as catalogue records. Calls huggingface.co; results are cached 5 minutes and a stale copy is served if the Hub is down. Returns 503 when the Hub fails and nothing is cached.',
    parameters: [query('kind', 'models, datasets or spaces.', str(null, { default: 'models' })), query('q', 'Search text (max 160 chars).'), query('cursor', 'nextCursor from the previous page.')],
    response: { schema: obj({ items: arr(ref('Resource')), nextCursor: nstr(), fetchedAt: str(), stale: bool(), cached: bool(), warning: str() }, ['items', 'nextCursor', 'stale']) }, errors: [400, 503] },
  { method: 'get', path: '/api/creator-ideas', tag: 'catalogue', operationId: 'getCreatorIdeas', summary: 'This week\'s build ideas',
    description: 'Up to three reviewed build prompts for the current week, from a curated insight log. Proposals, not funded challenges. Not cached.',
    response: { schema: obj({ weekOf: str(), nextWeek: str(), cadence: str(), mode: str(), goals: arr(anyObject()), ideas: arr(obj({ id: str(), title: str(), build: str(), success: str(), brief: str() }, ['id', 'title', 'brief'])), lastReviewedAt: nstr() }, ['weekOf', 'ideas']) } },
  { method: 'get', path: '/api/build-toolkit', tag: 'catalogue', operationId: 'getBuildToolkit', summary: 'Skills, resources and a brief for an idea',
    description: 'Matches an idea (and optional foundation resource) to skills to read, resources to compare and setup steps, and writes a build brief. Metadata matches only; nothing is installed or verified.',
    parameters: [query('idea', 'Your game idea (max 600 chars).'), query('resourceId', 'Optional foundation resource id (max 200 chars).'), query('projectId', 'Optional project id (max 81 chars).')],
    response: { schema: ref('BuildToolkit') }, errors: [400, 404] },
  { method: 'get', path: '/api/build-toolkit/roll', tag: 'catalogue', operationId: 'rollBuildToolkit', summary: 'Roll a random small build',
    description: 'Like /api/build-toolkit but picks a random engine, theme and twist and adds a `blueprint`. Each call differs; pass `previous` (the last blueprint id) to avoid a repeat. Not cached.',
    parameters: [query('idea', 'Optional idea (max 600 chars).'), query('resourceId', 'Optional foundation to Riff.'), query('projectId', 'Optional project id.'), query('previous', 'Previous blueprint id to skip.')],
    response: { schema: { allOf: [ref('BuildToolkit'), obj({ blueprint: obj({ id: str(), engine: str(), title: str(), theme: str(), components: arr(str()), acceptance: str(), foundationPreserved: bool(), skillIds: arr(str()) }, ['id', 'engine', 'title', 'components', 'acceptance']) }, ['blueprint'])] } }, errors: [400, 404] },

  // projects
  { method: 'get', path: '/api/projects', tag: 'projects', operationId: 'listProjects', summary: 'List projects',
    description: 'Every saved project with engagement, fork count and popularity, most popular first. Never includes management keys.',
    response: { schema: obj({ projects: arr(ref('ProjectListing')) }, ['projects']) } },
  { method: 'post', path: '/api/projects', tag: 'projects', operationId: 'createProject', summary: 'Create a project',
    description: 'Creates a git-backed project with a first saved version. Creates real state: do not retry a successful POST. The reply holds a `managementKey` shown only once; store it privately before anything else and never print it.',
    body: obj({ title: str('Required.'), description: str(), templateId: str('Base template or starter id.'), ecosystem: str(), author: str('Display name.'), components: arr(anyObject(), 'Composed resources.'), workflow: anyObject('Workflow graph, version 1. A starter graph is made when omitted.'), setupPlan: anyObject('Setup plan, version 1. Must not contain secrets.') }, ['title']),
    response: { status: 201, schema: ref('CreatedProject') }, errors: [400] },
  { method: 'get', path: '/api/projects/{id}', tag: 'projects', operationId: 'getProject', summary: 'Project with state and history',
    description: 'The project, its current head commit, every version and the current saved state. Use `head` as expectedHead when you save.',
    parameters: [path('id', 'Project id.')],
    response: { schema: obj({ project: ref('ProjectListing'), head: nstr(), versions: arr(ref('Version')), state: { anyOf: [ref('ProjectState'), { type: 'null' }] } }, ['project', 'head', 'versions', 'state']) }, errors: [400, 404] },
  { method: 'post', path: '/api/projects/{id}/publish', tag: 'projects', operationId: 'publishProjectVersion', summary: 'Save a new version',
    description: 'Commits `state` as a new version. The saved state is replaced by what you send (workflow and setupPlan carry over if omitted), so send the full state. Pass expectedHead from GET /api/projects/{id}; a different head returns 409, and workflow or productionReview changes require it. This saves configuration; it does not deploy a game. No key is needed today.',
    parameters: [path('id', 'Project id.')],
    body: obj({ state: anyObject('The full state to save (see ProjectState). Keys you leave out are dropped, except workflow and setupPlan.'), message: str('Version message.'), author: str('Display name.'), expectedHead: str('Current head commit.') }),
    response: { schema: obj({ project: ref('Project'), head: str() }, ['project', 'head']) }, errors: [400, 404, 409] },
  { method: 'get', path: '/api/projects/{id}/versions', tag: 'projects', operationId: 'listProjectVersions', summary: 'Version history',
    description: 'Every saved version, newest first. Any hash can be read with /state?ref= or forked with fromRef.',
    parameters: [path('id', 'Project id.')],
    response: { schema: obj({ versions: arr(ref('Version')) }, ['versions']) }, errors: [400, 404] },
  { method: 'get', path: '/api/projects/{id}/state', tag: 'projects', operationId: 'getProjectState', summary: 'Saved state at a version',
    description: 'The state.json saved at a git ref (a version hash, or HEAD).',
    parameters: [path('id', 'Project id.'), query('ref', 'Commit hash or HEAD.', str(null, { default: 'HEAD' }))],
    response: { schema: ref('ProjectState') }, errors: [400, 404] },
  { method: 'post', path: '/api/projects/{id}/fork', tag: 'projects', operationId: 'forkProject', summary: 'Fork (Riff) a project',
    description: 'Copies the project with its full history into a new project starting at `fromRef` (default HEAD) and records the lineage. Creates real state: do not retry a successful POST. The fork gets its own `managementKey`, shown once. Review gates in the copy reset to pending.',
    parameters: [path('id', 'Source project id.')],
    body: obj({ fromRef: str('Version hash to fork from. Default HEAD.'), title: str('Default "<source title> (fork)".'), author: str('Display name.') }),
    response: { status: 201, schema: obj({ project: ref('Project'), managementKey: str('Shown once.'), head: str(), forkedFrom: str(), forkedAtRef: str() }, ['project', 'managementKey', 'head', 'forkedFrom', 'forkedAtRef']) }, errors: [400, 404] },
  { method: 'post', path: '/api/projects/{id}/manage-history', tag: 'projects', operationId: 'manageProjectHistory', summary: 'Delete a version, clear history or delete a project',
    description: 'Destructive and irreversible. Needs `Authorization: Bearer <managementKey>` from create or fork (403 otherwise), `expectedHead` equal to the current head (409 otherwise) and `confirmation` equal to the project id. Surviving versions get new hashes. Independent forks are not affected. Ask the owner before calling this.',
    auth: 'management',
    parameters: [path('id', 'Project id.')],
    body: obj({ action: str('delete-version, clear-history or delete-project.', { enum: ['delete-version', 'clear-history', 'delete-project'] }), expectedHead: str(), confirmation: str('The exact project id.'), ref: str('40-character hash of the version to delete (delete-version only).') }, ['action', 'expectedHead', 'confirmation']),
    response: { schema: obj({ head: str(), removedVersions: int(), deleted: bool(), retained: str() }, ['retained']) }, errors: [400, 403, 404, 409] },
  { method: 'post', path: '/api/recipes/{id}/projects', tag: 'projects', operationId: 'createProjectFromRecipe', summary: 'Create a project from a recipe',
    description: 'Validates the recipe configuration and saves its export manifest as a new project. Same rules as POST /api/projects: real state, one-time managementKey.',
    parameters: [path('id', 'Recipe id from /api/recipes.')],
    body: obj({ title: str('Required.'), description: str(), author: str(), config: anyObject('Recipe parameters. Defaults fill gaps.') }, ['title']),
    response: { status: 201, schema: ref('CreatedProject') }, errors: [400, 404] },

  // assets
  { method: 'get', path: '/api/assets', tag: 'assets', operationId: 'searchAssets', summary: 'Search assets',
    description: 'Asset packs, single assets, AI models and creative workflows from the catalogue and community uploads. Free items first. Paginated.',
    parameters: [query('q', 'Text filter.'), query('kind', 'asset, pack, workflow, model, dataset or tool.'), query('provider', 'Provider id from `providers`.'), query('access', 'free or sale-draft.'), query('offset', 'Start index.'), query('limit', '1 to 96, default 48.')],
    response: { schema: obj({ total: int(), offset: int(), limit: int(), providers: arr(obj({ id: str(), name: str() })), items: arr(ref('Resource')) }, ['total', 'offset', 'limit', 'items']) } },
  { method: 'post', path: '/api/assets', tag: 'assets', operationId: 'uploadAsset', summary: 'Upload an asset',
    description: 'Stores one file (base64, up to 10 MB; PNG, JPG, WebP, GIF, WAV, MP3, OGG, GLB, ZIP or JSON) as a community upload. Creates real state: do not retry a successful POST. Files are never unpacked or run. Rights review is deferred, so only upload what you may share.',
    body: obj({ title: str('Max 120.'), creator: str('Max 120.'), description: str('Max 2000.'), license: str('Optional, max 1000.'), kind: str('asset, pack or workflow.', { enum: ['asset', 'pack', 'workflow'] }), filename: str('With a supported extension.'), base64: str('File bytes, base64.'), commerce: ref('CommerceDraft') }, ['title', 'creator', 'description', 'kind', 'filename', 'base64']),
    response: { status: 201, schema: ref('UploadedAsset') }, errors: [400] },
  { method: 'get', path: '/api/assets/{id}/file', tag: 'assets', operationId: 'downloadAsset', summary: 'Download an uploaded file',
    description: 'The raw uploaded file as an attachment (application/octet-stream, sandboxed).',
    parameters: [path('id', 'Upload id (`upload-<uuid>`).')],
    response: { contentType: 'application/octet-stream', schema: str(null, { format: 'binary' }) }, errors: [404] },
  { method: 'get', path: '/api/assets/{id}/commerce', tag: 'assets', operationId: 'getAssetCommercePlan', summary: 'Listing plan for an upload',
    description: 'A draft authoring plan (sale and NFT settings, pinned contract templates, next steps) for an uploaded asset. Nothing is deployed and no network is connected. Sent as a JSON attachment.',
    parameters: [path('id', 'Upload id.')],
    response: { schema: obj({ schemaVersion: int(), kind: str(), state: str(), network: { type: 'null' }, asset: anyObject(), revision: int(), configuration: ref('CommerceDraft'), templates: anyObject(), deployment: anyObject(), nextSteps: arr(str()), rightsReview: str() }, ['kind', 'state', 'asset', 'revision', 'configuration']) }, errors: [404] },
  { method: 'put', path: '/api/assets/{id}/commerce', tag: 'assets', operationId: 'saveAssetCommerceDraft', summary: 'Save the listing draft',
    description: 'Saves a new revision of the upload\'s sale and NFT draft. Send the current commerceRevision as expectedRevision; a stale one returns 409. A draft only: it enables no sale or mint.',
    parameters: [path('id', 'Upload id.')],
    body: obj({ expectedRevision: int(), commerce: ref('CommerceDraft') }, ['expectedRevision', 'commerce']),
    response: { schema: ref('UploadedAsset') }, errors: [400, 404, 409] },
  { method: 'get', path: '/api/workflows/comfy-example', tag: 'assets', operationId: 'getComfyWorkflowExample', summary: 'Example ComfyUI graph',
    description: 'A ComfyUI API-format graph for concept backgrounds (SDXL). Referenced by the "ComfyUI concept backgrounds" asset workflow.',
    response: { schema: anyObject('ComfyUI prompt graph keyed by node id.') } },

  // community
  { method: 'get', path: '/api/engagement/{kind}/{id}', tag: 'community', operationId: 'getEngagement', summary: 'Stars and comments',
    description: 'Star count, whether `user` starred it, and all comments for a resource or project.',
    parameters: [path('kind', 'resource or project.', { type: 'string', enum: ['resource', 'project'] }), path('id', 'Resource or project id.'), query('user', 'Your anonymous visitor id, to fill `starred`.')],
    response: { schema: obj({ stars: int(), starred: bool(), comments: arr(ref('Comment')) }, ['stars', 'starred', 'comments']) }, errors: [400] },
  { method: 'post', path: '/api/engagement/{kind}/{id}/star', tag: 'community', operationId: 'toggleStar', summary: 'Star or unstar',
    description: 'Toggles a star for `user` (an anonymous visitor id you keep). Calling twice removes the star.',
    parameters: [path('kind', 'resource or project.', { type: 'string', enum: ['resource', 'project'] }), path('id', 'Resource or project id.')],
    body: obj({ user: str('Anonymous visitor id. Can also be sent as ?user=.') }),
    response: { schema: obj({ stars: int(), starred: bool() }, ['stars', 'starred']) }, errors: [400] },
  { method: 'post', path: '/api/engagement/{kind}/{id}/comments', tag: 'community', operationId: 'addComment', summary: 'Add a comment',
    description: 'Adds a public comment (max 2000 chars). Creates real state: do not retry a successful POST. Author is self-declared; there are no accounts.',
    parameters: [path('kind', 'resource or project.', { type: 'string', enum: ['resource', 'project'] }), path('id', 'Resource or project id.')],
    body: obj({ author: str('Display name, max 60. Default anonymous.'), body: str('Comment text.') }, ['body']),
    response: { status: 201, schema: ref('Comment') }, errors: [400] },
  { method: 'get', path: '/api/collective-chat/rooms/{roomId}', tag: 'community', operationId: 'getCollectiveRoom', summary: 'Read a work room',
    description: 'Messages in a shared project work room (humans and agents posting working, blocker and delivered updates). The main room is `lobby-collective`. Not cached.',
    parameters: [path('roomId', 'Room id: lowercase letters, digits and dashes.')],
    response: { schema: obj({ roomId: str(), messages: arr(ref('CollectiveMessage')) }, ['roomId', 'messages']) }, errors: [400] },
  { method: 'post', path: '/api/collective-chat/rooms/{roomId}/messages', tag: 'community', operationId: 'postCollectiveMessage', summary: 'Post a work update',
    description: 'Adds a status update to a work room. Creates real state: do not retry a successful POST. Agents should set authorKind Agent and a roleName.',
    parameters: [path('roomId', 'Room id.')],
    body: obj({ author: str('Max 80.'), authorKind: str('Human, Agent, Moderator or System.', { enum: ['Human', 'Agent', 'Moderator', 'System'] }), roleName: str('Agent role, max 80.'), kind: str('working, blocker or delivered.', { enum: ['working', 'blocker', 'delivered'] }), body: str('1 to 2000 chars.'), artifactUrl: str('Optional link to the artifact.') }, ['author', 'authorKind', 'kind', 'body']),
    response: { status: 201, schema: ref('CollectiveMessage') }, errors: [400] },
  { method: 'patch', path: '/api/collective-chat/rooms/{roomId}/messages/{messageId}', tag: 'community', operationId: 'setCollectiveMessageState', summary: 'Set a message delivery state',
    description: 'Marks a work-room message queued, sent or failed (used by clients that retry delivery). Anyone can change any message\'s state.',
    parameters: [path('roomId', 'Room id.'), path('messageId', 'Message id.')],
    body: obj({ clientState: str('queued, sent or failed.', { enum: ['queued', 'sent', 'failed'] }) }, ['clientState']),
    response: { schema: ref('CollectiveMessage') }, errors: [400, 404] },
  { method: 'get', path: '/api/community-chat/messages', tag: 'community', operationId: 'listCommunityMessages', summary: 'Read community chat',
    description: 'The public chat room (last 200 visible messages). Poll with `after` set to the last id you have; `reset: true` means that id is gone, so reload. Drop any ids in `removedIds`. Not cached.',
    parameters: [query('after', 'Last message id you already have.')],
    response: { schema: obj({ messages: arr(ref('CommunityMessage')), removedIds: arr(str()), reset: bool(), limits: obj({ nameMaxLength: int(), bodyMaxLength: int() }) }, ['messages', 'removedIds', 'reset', 'limits']) } },
  { method: 'post', path: '/api/community-chat/messages', tag: 'community', operationId: 'postCommunityMessage', summary: 'Post to community chat',
    description: 'Posts a message (name max 32, body max 500). No links, keys or seed phrases: those are rejected with a `code`. Rate limits: 5 messages per 30 s per clientId and 20 per IP; the same text within 2 minutes is refused (429). Creates real state: do not retry a successful POST.',
    body: obj({ clientId: str('Stable browser or agent id, 8 to 128 of A-Z a-z 0-9 _ -.'), name: str('Display name.'), body: str('Message text.') }, ['clientId', 'name', 'body']),
    response: { status: 201, schema: ref('CommunityMessage') }, errors: [400, 429] },
  { method: 'post', path: '/api/community-chat/messages/{messageId}/report', tag: 'community', operationId: 'reportCommunityMessage', summary: 'Report a chat message',
    description: 'Reports someone else\'s message. Three reports from different clients hide it until a moderator reviews it.',
    parameters: [path('messageId', 'Message id.')],
    body: obj({ clientId: str('Your client id (not the author\'s).') }, ['clientId']),
    response: { schema: obj({ id: str(), reported: bool(), hidden: bool() }, ['id', 'reported', 'hidden']) }, errors: [400, 404] },
  { method: 'get', path: '/api/challenges', tag: 'community', operationId: 'listChallenges', summary: 'Weekly creator challenges',
    description: 'Recent, open and upcoming weekly editions with submission counts. Weeks start Monday in America/New_York. Rewards are not funded.',
    response: { schema: obj({ editions: arr(ref('ChallengeEdition')), mode: str() }, ['editions']) } },
  { method: 'get', path: '/api/challenges/submissions', tag: 'community', operationId: 'listChallengeSubmissions', summary: 'Challenge submissions',
    description: 'All submissions, newest first.',
    response: { schema: obj({ submissions: arr(ref('ChallengeSubmission')) }, ['submissions']) } },
  { method: 'post', path: '/api/challenges/submissions', tag: 'community', operationId: 'submitChallengeEntry', summary: 'Submit a project to this week\'s challenge',
    description: `Enters an existing project in the open edition. One entry per creator and per project each week (409 otherwise). ${creatorAuthNote}`,
    auth: 'creator',
    body: creatorBody({ editionId: str('The open edition id.'), projectId: str(), summary: str('What changed, max 1600.'), evidenceUrl: str('HTTPS link to a demo or evidence.') }, ['editionId', 'projectId', 'summary', 'evidenceUrl']),
    response: { status: 201, schema: ref('ChallengeSubmission') }, errors: [400, 403, 409] },
  { method: 'get', path: '/api/learn/submission-standard', tag: 'community', operationId: 'getLearningSubmissionStandard', summary: 'Allowed values for shared resources',
    description: 'Levels, formats and topics accepted by POST /api/learn/resources.',
    response: { schema: obj({ version: int(), levels: arr(str()), formats: arr(str()), topics: arr(str()) }, ['levels', 'formats', 'topics']) } },
  { method: 'post', path: '/api/learn/resources', tag: 'community', operationId: 'shareLearningResource', summary: 'Recommend a learning resource',
    description: `Adds a public HTTPS guide, video or tool to the Learn library, credited to its original author. Duplicate links return 409. ${creatorAuthNote}`,
    auth: 'creator',
    body: creatorBody({ url: str('Public HTTPS link.'), title: str('Max 120.'), summary: str('Max 700.'), ecosystem: str(), level: str(), format: str(), topic: str(), prerequisites: str('Max 500.'), whyUseful: str('Max 700.'), originalAuthor: str('Max 160.') }, ['url', 'title', 'summary', 'ecosystem', 'level', 'format', 'topic', 'prerequisites', 'whyUseful', 'originalAuthor']),
    response: { status: 201, schema: ref('Resource') }, errors: [400, 403, 409] },
  { method: 'get', path: '/api/learning/published', tag: 'community', operationId: 'listPublishedLessons', summary: 'Published creator lessons',
    description: 'Lessons that passed review and a trial, as skill listings. Private evidence is never included.',
    response: { schema: obj({ items: arr(ref('SkillListing')) }, ['items']) } },
  { method: 'get', path: '/api/learning/lessons', tag: 'community', operationId: 'listLessons', summary: 'Your lessons',
    description: `Your own lessons in every state, including private source excerpts. ${creatorAuthNote} Not cached.`,
    auth: 'creator',
    parameters: [query('creatorId', 'Your creator profile id.', { type: 'string' }, true), query('projectId', 'Only lessons for this project.')],
    response: { schema: obj({ items: arr(ref('Lesson')) }, ['items']) }, errors: [403] },
  { method: 'post', path: '/api/learning/lessons', tag: 'community', operationId: 'createLesson', summary: 'Draft a lesson from a build',
    description: `Records a lesson learned on an existing project, with private source evidence. Next steps: review, trial, publish. ${creatorAuthNote}`,
    auth: 'creator',
    body: creatorBody({ projectId: str('Existing project id.'), source: obj({ kind: str('manual, agent or beacon.'), reference: str('Max 500.'), excerpt: str('Private evidence, max 16000.') }, ['kind', 'reference', 'excerpt']), content: ref('LessonContent') }, ['projectId', 'source', 'content']),
    response: { status: 201, schema: ref('Lesson') }, errors: [400, 403, 404] },
  lessonAction('edit', 'Edit a draft lesson', 'Replaces the content and returns the lesson to draft. Published lessons are immutable.', { content: ref('LessonContent') }, ['content']),
  lessonAction('review', 'Review a lesson for sharing', 'Confirms the content is sanitized and the evidence checked. Content with keys or private machine paths is refused.', { sanitized: { const: true }, evidenceChecked: { const: true }, note: str('Max 2000.') }, ['sanitized', 'evidenceChecked', 'note']),
  lessonAction('trial', 'Record a trial', 'Records whether following the lesson met its goal, with before/after metrics (corrections, wastedGenerations, minutes, credits; omit unknowns). An accepted trial moves it to tested.', { accepted: bool(), summary: str(), evidence: str(), comparison: str(), baseline: anyObject(), result: anyObject() }, ['accepted', 'summary', 'evidence', 'comparison', 'baseline', 'result']),
  lessonAction('publish', 'Publish a tested lesson', 'Publishes a reviewed lesson with an accepted trial as a public skill (listed in /api/skill-market and /api/agent-resources).', { shareConfirmed: { const: true } }, ['shareConfirmed']),
  lessonAction('reject', 'Reject a lesson', 'Marks an unpublished lesson rejected.', { reason: str('Max 1000.') }, ['reason']),
  lessonAction('retire', 'Withdraw a published lesson', 'Removes a published lesson from public listings.', { reason: str('Max 1000.') }, ['reason']),
  { method: 'get', path: '/api/build-budgets', tag: 'community', operationId: 'listBuildBudgets', summary: 'Build cost reports',
    description: 'Self-reported costs and hours of real builds, from creators who show their work and activity. Not cached.',
    response: { schema: obj({ items: arr(obj({ id: str(), creatorId: str(), creatorName: str(), title: str(), demoUrl: str(), category: str(), stage: str(), costs: anyObject(), cashUsd: num(), creditUsd: { type: ['number', 'null'] }, hours: { type: ['number', 'null'] }, revision: int(), recommendations: int(), costStatus: str() }, ['id', 'title', 'cashUsd', 'revision'])) }, ['items']) } },
  { method: 'post', path: '/api/build-budgets', tag: 'community', operationId: 'submitBuildBudget', summary: 'Report what a build cost',
    description: `Adds (or, with expectedRevision, updates) a cost report for a build with a working demo link. Your profile must show work and activity. ${creatorAuthNote}`,
    auth: 'creator',
    body: creatorBody({ shareConfirmed: { const: true }, title: str(), description: str(), version: str(), scope: str(), demoUrl: str('HTTP(S) demo link.'), category: str('game, app or media.'), stage: str('prototype or release.'), costs: obj({ ai: num(), assets: num(), other: num() }, ['ai', 'assets', 'other']), creditUsd: { type: ['number', 'null'] }, hours: { type: ['number', 'null'] }, expectedRevision: int('Required to update an existing report for the same demo link.') }, ['shareConfirmed', 'title', 'description', 'version', 'scope', 'demoUrl', 'category', 'stage', 'costs']),
    response: { status: 201, schema: obj({ id: str(), revision: int() }, ['id', 'revision']) }, errors: [400, 403, 409] },
  { method: 'post', path: '/api/build-budgets/{id}/recommend', tag: 'community', operationId: 'recommendBuildBudget', summary: 'Recommend another creator\'s build',
    description: `Recommends a build you tried. Not your own. ${creatorAuthNote}`,
    auth: 'creator',
    parameters: [path('id', 'Build report id.')],
    body: creatorBody({ tested: { const: true }, expectedRevision: int() }, ['tested', 'expectedRevision']),
    response: { schema: obj({ ok: bool() }, ['ok']) }, errors: [400, 403, 404, 409] },
  { method: 'post', path: '/api/build-budgets/{id}/withdraw', tag: 'community', operationId: 'withdrawBuildBudget', summary: 'Withdraw your build report',
    description: `Deletes your own cost report. ${creatorAuthNote}`,
    auth: 'creator',
    parameters: [path('id', 'Build report id.')],
    body: creatorBody({ expectedRevision: int() }, ['expectedRevision']),
    response: { schema: obj({ ok: bool() }, ['ok']) }, errors: [403, 404, 409] },

  // skills
  { method: 'get', path: '/api/skills', tag: 'skills', operationId: 'listSkills', summary: 'Native TariSkills',
    description: 'Metadata for native Tari and Ootle skills, including validation scope and lifecycle.',
    response: { schema: obj({ skills: arr(ref('SkillMetadata')) }, ['skills']) } },
  { method: 'get', path: '/api/skills/{slug}', tag: 'skills', operationId: 'getSkill', summary: 'One native skill with its Markdown',
    description: 'Metadata plus the SKILL.md text.',
    parameters: [path('slug', 'Skill id from /api/skills.')],
    response: { schema: obj({ metadata: ref('SkillMetadata'), markdown: str() }, ['metadata', 'markdown']) }, errors: [404] },
  { method: 'get', path: '/skills/SKILL.md', tag: 'skills', operationId: 'getSkillRouter', summary: 'Verified skills router',
    description: 'A router skill listing only the verified native skills.',
    response: { contentType: MARKDOWN, schema: str() } },
  { method: 'get', path: '/skills/{slug}/SKILL.md', tag: 'skills', operationId: 'getSkillMarkdown', summary: 'Native skill Markdown',
    description: 'The current SKILL.md of a native skill.',
    parameters: [path('slug', 'Skill id.')],
    response: { contentType: MARKDOWN, schema: str() }, errors: [404] },
  { method: 'get', path: '/skills/revisions/{ref}/{slug}/SKILL.md', tag: 'skills', operationId: 'getPinnedSkillMarkdown', summary: 'Skill Markdown at a pinned commit',
    description: 'SKILL.md exactly as it was at a repository commit. Immutable, cached for a year. Use it to pin the version you read.',
    parameters: [path('ref', '40-character commit hash.'), path('slug', 'Skill id.')],
    response: { contentType: MARKDOWN, schema: str() }, errors: [404] },
  { method: 'get', path: '/skills/{file}', expressPath: 'regex:^\\/skills\\/(.+\\.(?:json|mjs|py|rs|toml|lock))$', tag: 'skills', operationId: 'getSkillSupportFile', summary: 'Skill supporting file',
    description: 'Allow-listed supporting files: `<slug>/metadata.json`, catalog.json, sources.json and example sources. Other paths return 404.',
    parameters: [path('file', 'Relative file path, for example `economy-simulation/metadata.json`. May contain slashes.')],
    response: { schema: anyObject(), note: 'JSON files as application/json; source files as text/plain.' }, errors: [404] },
  { method: 'get', path: '/agent-skills/{id}/bundle.json', tag: 'skills', operationId: 'getSkillBundle', summary: 'Download a skill bundle',
    description: 'Every file of a bundled skill or published lesson with SHA-256 digests. Save it in a dedicated skill folder and read SKILL.md first.',
    parameters: [path('id', 'Skill id from /api/agent-resources.')],
    response: { schema: ref('SkillBundle') }, errors: [404] },
  { method: 'get', path: '/agent-skills/{id}/{file}', expressPath: '/agent-skills/:id/*', tag: 'skills', operationId: 'getSkillBundleFile', summary: 'Read one bundle file',
    description: 'One file from a skill bundle, for example SKILL.md or references/routing-table.md.',
    parameters: [path('id', 'Skill id.'), path('file', 'File name inside the bundle. May contain slashes.')],
    response: { contentType: MARKDOWN, schema: str(), note: 'text/plain for non-Markdown files.' }, errors: [404] },
  { method: 'get', path: '/api/skill-market', tag: 'skills', operationId: 'getSkillMarket', summary: 'Skill market',
    description: 'All skill and workflow listings (native, bundled, lessons and community) with categories, download counts and creators. Paid listings hide their instructions; checkout is not connected.',
    response: { schema: obj({ categories: arr(obj({ id: str(), label: str(), description: str() })), listings: arr(ref('SkillListing')), creators: arr(ref('CreatorProfile')) }, ['categories', 'listings', 'creators']) } },
  { method: 'post', path: '/api/skill-market', tag: 'skills', operationId: 'publishSkillListing', summary: 'Publish a skill or workflow',
    description: `Publishes a community listing with purpose, requirements, setup, instructions, verification and recovery sections. Creates real state: do not retry a successful POST. ${creatorAuthNote}`,
    auth: 'creator',
    body: creatorBody({ kind: str('skill or workflow.', { enum: ['skill', 'workflow'] }), title: str('Max 120.'), description: str('Max 500.'), version: str('Max 30.'), price: num('0 for free. Paid downloads are not available.'), purpose: str(), requirements: str(), setup: str(), instructions: str(), verification: str(), recovery: str() }, ['kind', 'title', 'description', 'version', 'price', 'purpose', 'requirements', 'setup', 'instructions', 'verification', 'recovery']),
    response: { status: 201, schema: ref('SkillListing') }, errors: [400, 403] },
  { method: 'post', path: '/api/skill-market/{id}/download', tag: 'skills', operationId: 'downloadSkillListing', summary: 'Download a free listing',
    description: 'Returns the listing\'s files and install notes, and counts one download per visitor per day. Paid listings return 409.',
    parameters: [path('id', 'Listing id.')],
    body: obj({ visitor: str('Stable visitor id, 16 to 80 of A-Z a-z 0-9 -.') }, ['visitor']),
    response: { schema: obj({ schemaVersion: int(), kind: str(), metadata: ref('SkillListing'), files: { type: 'object', additionalProperties: { type: 'string' } }, installation: str(), source: nstr() }, ['kind', 'metadata', 'files', 'installation']) }, errors: [400, 404, 409] },
  { method: 'post', path: '/api/creator-profiles', tag: 'skills', operationId: 'createCreatorProfile', summary: 'Create a creator profile',
    description: 'Creates a public creator profile. The reply holds an `editKey` shown once: it is the Bearer key for every creator-authenticated route. Store it privately; never print it. Creates real state: do not retry a successful POST.',
    body: obj({ name: str('Max 80.'), bio: str('Max 1000.'), showWork: bool('Default true.'), showActivity: bool('Default true.'), projects: arr(str(), 'Up to 30 HTTP(S) links.') }, ['name']),
    response: { status: 201, schema: obj({ profile: ref('CreatorProfile'), editKey: str('Shown once.') }, ['profile', 'editKey']) }, errors: [400] },
  { method: 'put', path: '/api/creator-profiles/{id}', tag: 'skills', operationId: 'updateCreatorProfile', summary: 'Update your profile',
    description: 'Replaces name, bio, visibility and project links. Needs `Authorization: Bearer <editKey>`. `projects` is required (send [] for none).',
    auth: 'creator',
    parameters: [path('id', 'Creator profile id.')],
    body: obj({ name: str(), bio: str(), showWork: bool(), showActivity: bool(), projects: arr(str()) }, ['name', 'projects']),
    response: { schema: ref('CreatorProfile') }, errors: [400, 403] },

  // recipes
  { method: 'get', path: '/api/recipes', tag: 'recipes', operationId: 'listRecipes', summary: 'Composable recipes',
    description: 'Versioned recipes that combine Ootle components. All are proposed designs; none is verified on testnet.',
    response: { schema: obj({ recipes: arr(obj({ id: str(), version: str(), title: str(), description: str(), engine: str(), status: str(), verifiedTestnet: bool(), componentCount: int() }, ['id', 'version', 'title'])) }, ['recipes']) } },
  { method: 'get', path: '/api/recipes/{id}', tag: 'recipes', operationId: 'getRecipe', summary: 'One recipe',
    description: 'Components with pinned revisions, connections, typed parameters, permissions, the proposed adapter and linked education.',
    parameters: [path('id', 'Recipe id.')],
    response: { schema: obj({ id: str(), version: str(), title: str(), components: arr(anyObject()), connections: arr(anyObject()), parameters: arr(obj({ key: str(), type: str(), default: {} }, ['key', 'type'])), education: arr(anyObject()) }, ['id', 'version', 'components', 'parameters']) }, errors: [404] },
  { method: 'post', path: '/api/recipes/{id}/validate', tag: 'recipes', operationId: 'validateRecipeConfig', summary: 'Check a recipe configuration',
    description: 'Validates parameters (types, ranges, patterns, unknown keys) and the component graph. Always 200; read `ok` and `errors`.',
    parameters: [path('id', 'Recipe id.')],
    body: obj({ config: anyObject('Parameter values. Missing keys use defaults.') }),
    response: { schema: ref('ValidationResult') }, errors: [404] },
  { method: 'post', path: '/api/recipes/{id}/export', tag: 'recipes', operationId: 'exportRecipe', summary: 'Export a recipe manifest',
    description: 'Returns a round-trippable manifest with pinned component revisions and resolved parameters. Invalid configurations return 400 with `errors`. Not a compiled or deployed game.',
    parameters: [path('id', 'Recipe id.')],
    body: obj({ config: anyObject() }),
    response: { schema: ref('RecipeManifest') }, errors: [400, 404] },
  { method: 'get', path: '/api/studio/recipes', tag: 'recipes', operationId: 'listStudioRecipes', summary: 'Studio design recipes',
    description: 'Design-only production recipes (brief, concept, model, rig, animate, audio...) and their stages. Nothing runs server-side.',
    response: { schema: obj({ version: int(), execution: str(), recipes: arr(obj({ id: str(), title: str(), stages: arr(str()) }, ['id', 'title', 'stages'])), stages: anyObject() }, ['recipes', 'stages']) } },

  // video
  { method: 'get', path: '/api/video/templates', tag: 'video', operationId: 'listVideoTemplates', summary: 'Video templates',
    description: 'Remotion video templates and their fields.',
    response: { schema: obj({ templates: arr(obj({ id: str(), title: str(), description: str(), fields: arr(anyObject()) }, ['id', 'title', 'fields'])) }, ['templates']) } },
  { method: 'get', path: '/api/video/templates/{id}', tag: 'video', operationId: 'getVideoTemplate', summary: 'One video template',
    description: 'Fields, draftable keys and example briefs for one template.',
    parameters: [path('id', 'Template id, for example AppSpotlight.')],
    response: { schema: obj({ id: str(), title: str(), description: str(), draftKeys: arr(str()), examples: arr(anyObject()), fields: arr(anyObject()) }, ['id', 'fields']) }, errors: [404] },
  { method: 'post', path: '/api/video/templates/{id}/validate', tag: 'video', operationId: 'validateVideoConfig', summary: 'Check a video configuration',
    description: 'Validates field values and fills defaults. Always 200; read `ok` and `errors`.',
    parameters: [path('id', 'Template id.')],
    body: obj({ config: anyObject() }),
    response: { schema: ref('ValidationResult') }, errors: [404] },
  { method: 'post', path: '/api/video/templates/{id}/export', tag: 'video', operationId: 'exportVideoProps', summary: 'Export render props',
    description: 'Returns Remotion props and the render command. The Lobby does not render; you run the command in creator-hub/video-templates. Invalid configurations return 400 with `errors`.',
    parameters: [path('id', 'Template id.')],
    body: obj({ config: anyObject() }),
    response: { schema: obj({ schemaVersion: int(), template: str(), props: anyObject(), render: obj({ tool: str(), package: str(), command: str(), note: str() }), generatedAt: str(), disclosure: str() }, ['template', 'props', 'render']) }, errors: [400, 404] },
  { method: 'post', path: '/api/video/templates/{id}/draft', tag: 'video', operationId: 'draftVideoCopy', summary: 'Draft copy from a brief (optional AI)',
    description: 'Turns a short brief into suggested field values with a hosted model. Off unless the server sets HF_DRAFT_ENABLED=1 and a Hugging Face token, so it usually returns 503 (the captured example). Uses provider credits when on.',
    parameters: [path('id', 'Template id.')],
    body: obj({ brief: str('1 to 4000 chars.') }, ['brief']),
    response: { schema: obj({ model: str(), draft: anyObject(), validation: ref('ValidationResult') }, ['model', 'draft', 'validation']) }, errors: [400, 402, 404, 422, 502, 503] },
];

const ERROR_TEXT = { 400: 'Invalid input.', 402: 'Provider payment required.', 403: 'Missing or wrong key.', 404: 'Not found.', 409: 'Conflict: stale revision or head, or a duplicate.', 422: 'Model output failed validation.', 429: 'Rate limited or duplicate message.', 502: 'Upstream provider failed.', 503: 'Feature or upstream unavailable.' };

function exampleFor(operation) {
  const example = capturedExamples[operation.operationId];
  if (!example) return null;
  return {
    summary: `Captured reply (HTTP ${example.status})`,
    description: example.trimmed?.length ? `Real reply from a scripted run, trimmed: ${example.trimmed.join('; ')}.` : 'Real reply from a scripted run.',
    value: example.value,
  };
}

function buildOperation(operation, {publicReadOnly = false} = {}) {
  // Old document snapshots contain local write instructions; read the live guide instead.
  const example = publicReadOnly && operation.tag === 'docs' ? null : exampleFor(operation);
  const status = String(operation.response.status || 200);
  const contentType = operation.response.contentType || JSON_TYPE;
  const captured = capturedExamples[operation.operationId];
  const exampleStatus = captured ? String(captured.status) : status;
  const responses = {
    [status]: {
      description: operation.response.note ? `${operation.summary}. ${operation.response.note}` : operation.summary,
      content: { [contentType]: { schema: operation.response.schema, ...(example && exampleStatus === status ? { examples: { captured: example } } : {}) } },
    },
  };
  for (const code of operation.errors || []) {
    responses[String(code)] = {
      description: ERROR_TEXT[code] || 'Error.',
      content: { [JSON_TYPE]: { schema: ref('Error'), ...(example && exampleStatus === String(code) ? { examples: { captured: example } } : {}) } },
    };
  }
  const out = {
    operationId: operation.operationId,
    summary: operation.summary,
    description: operation.description,
    tags: [operation.tag],
    ...(operation.parameters?.length ? { parameters: operation.parameters } : {}),
    ...(operation.body ? {
      requestBody: {
        required: true,
        content: { [JSON_TYPE]: { schema: operation.body, ...(captured?.request?.body !== undefined ? { example: captured.request.body } : {}) } },
      },
    } : {}),
    responses,
    ...(operation.auth === 'management' ? { security: [{ managementKey: [] }] } : {}),
    ...(operation.auth === 'creator' ? { security: [{ creatorKey: [] }] } : {}),
  };
  return out;
}

export function operationsFor({publicReadOnly = false} = {}) {
  if (!publicReadOnly) return OPERATIONS;
  const descriptions = {
    getOpenApi: 'Machine-readable contract for enabled agent operations on this origin. Disabled public writes and private/provider services are omitted, as are internal browser and operational routes. Cached for 5 minutes.',
    getLearningLoopGuide: 'Local-only reference for the learning workflow. Learning writes and publication are disabled on this public deployment.',
    getWorkflowAgentGuide: 'Local-only reference for project workflow structure. Public project creation and editing are disabled.',
    getProject: 'The project, current head commit, versions and saved state. Public saving and editing are disabled.',
    listProjectVersions: 'Saved versions, newest first. Read a hash with /state?ref=. Public forking is disabled.',
    getLearningSubmissionStandard: 'Reference levels, formats and topics for learning resources. Public resource submissions are disabled.',
    listLessons: 'Your own lessons, including private source excerpts, using an existing authorized creatorId query and Authorization: Bearer <editKey>. Missing or wrong keys return 403. Public profile creation and learning writes are disabled. Not cached.',
  };
  return OPERATIONS.filter(operation =>
    !publicRestriction(operation.method, operation.path.replace(/\{[^}]+\}/g, 'example'))
  ).map(operation => descriptions[operation.operationId]
    ? {...operation, description: descriptions[operation.operationId]} : operation);
}

export function tagsFor({publicReadOnly = false} = {}) {
  if (!publicReadOnly) return TAGS;
  const descriptions = {
    projects: 'Read project metadata and saved versions. Creating, saving and forking are disabled on this public deployment.',
    assets: 'Browse existing assets. Uploads and listing mutations are disabled on this public deployment.',
    community: 'Read community information. Posting, profiles, reports and other persistent writes are disabled.',
    skills: 'Browse reviewed bundled skills and download their files. Public skill publication and profile writes are disabled.',
  };
  return TAGS.map(tag => ({...tag, description: descriptions[tag.name] || tag.description}));
}

/** Build the contract for the serving app, with relative URLs on that origin. */
export function buildOpenApi({publicReadOnly = false} = {}) {
  const paths = {};
  for (const operation of operationsFor({publicReadOnly})) {
    const item = (paths[operation.path] ||= {});
    if (operation.expressPath) item['x-express-path'] = operation.expressPath;
    item[operation.method] = buildOperation(operation, {publicReadOnly});
  }
  return {
    openapi: '3.1.0',
    info: {
      title: 'Ootle Lobby API',
      version: '1.0.0',
      summary: publicReadOnly ? 'Public read-only discovery and bounded stateless downloads/exports.' : 'Local application API for Ootle Lobby.',
      description: publicReadOnly
        ? 'This public deployment serves discovery reads and bounded stateless validation, exports and reviewed skill downloads. Persistent writes, including project creation, saving and forking, return HTTP 410 PUBLIC_WRITES_DISABLED. Private/provider services return HTTP 410 PUBLIC_SERVICE_DISABLED. Disabled operations are omitted from this contract. Local legacy implementations do not grant public access. Read /agent-start.md and /llms.txt; examples are at /llms-full.txt.'
        : 'Local application contract of Ootle Lobby. Project and community write implementations are retained for local use and legacy tests; they are disabled on the public deployment. Read the contract from the exact origin you intend to use. Start with /llms.txt and /agent-start.md.',
    },
    servers: [{ url: '/', description: 'The Lobby origin serving this document.' }],
    tags: tagsFor({publicReadOnly}),
    'x-public-read-only': publicReadOnly,
    paths,
    components: {
      schemas,
      securitySchemes: publicReadOnly ? {
        creatorKey: {type: 'http', scheme: 'bearer', description: 'Existing authorized creator key for retained authenticated reads. Public creator-profile creation and updates are disabled.'},
      } : {
        managementKey: { type: 'http', scheme: 'bearer', description: 'Project management key returned once by POST /api/projects or /fork. Only destructive history actions need it.' },
        creatorKey: { type: 'http', scheme: 'bearer', description: 'Creator profile editKey returned once by POST /api/creator-profiles. Send creatorId too.' },
      },
    },
  };
}

export const openapi = buildOpenApi();
