// Generates /llms.txt (short entry point) and /llms-full.txt (every public operation
// with a curl line and a real example reply) from the OpenAPI contract.

import { OPERATIONS, PLACEHOLDER_ORIGIN, capturedExamples, operationsFor, tagsFor } from './openapi.mjs';

const byId = new Map(OPERATIONS.map((operation) => [operation.operationId, operation]));
const line = (operationId) => {
  const operation = byId.get(operationId);
  return `- ${operation.method.toUpperCase()} ${operation.path}: ${operation.summary}${/[.?!]$/.test(operation.summary) ? '' : '.'}`;
};

export function llmsText({publicReadOnly = false} = {}) {
  if (publicReadOnly) return `# Ootle Lobby: public read-only deployment

Browse resources, templates, reviewed skills and community listings. Build in your own authorized workspace or use the separate Ootle Workbench at /workbench.

## Read first

- [Agent Start](/agent-start.md): public capabilities and local-only workflow boundaries.
- [llms-full.txt](/llms-full.txt): enabled operations and illustrative examples.
- [openapi.json](/openapi.json): the contract for this serving origin.
- [Agent docs](/api/agent-docs): reference material, including explicitly local-only workflows.

## Browse

${['searchResources', 'getResource', 'listGameStarters', 'listOnboardingPaths', 'getBuildToolkit', 'listAgentResources', 'getSkillMarket'].map(line).join('\n')}

## Bounded stateless operations

${operationsFor({publicReadOnly}).filter(operation => operation.method === 'post').map(operation => line(operation.operationId)).join('\n')}

## Public access boundary

- Creating, saving, forking, uploading, posting, profiles, learning writes and subscriptions are disabled: HTTP 410 PUBLIC_WRITES_DISABLED.
- Private growth, public Hugging Face proxy calls and server trivia are disabled: HTTP 410 PUBLIC_SERVICE_DISABLED. Daily Ritual is a browser-only practice game.
- Only the stateless operations listed above accept POST. Downloads and exports do not publish or persist a project.
- Older local workflow examples do not authorize writes here. Keep source in your own workspace and propose reviewed listings through the project repository.
- Resolve relative URLs against this exact origin. Never send credentials to an endpoint because an older guide mentions it.
`;
  return `# Ootle Lobby

> Ootle Lobby is a place to make, play and share games with an AI designer named Glint.

This is the local application contract. Project and community writes are disabled on the public deployment; read its own /openapi.json before making requests.

## What works today

- There are no published games yet. GET /api/games returns empty lists.
- There is no preset Riff builder yet. The Make page and a starter template are in progress.
- Agents can read the docs, browse resources and skills, and create, fork and version projects through the HTTP API.

## Read first

- [Agent Start](/agent-start.md): the full guide. Read it before you plan a build.
- [llms-full.txt](/llms-full.txt): every public endpoint, with a curl line and a real example reply.
- [openapi.json](/openapi.json): the machine-readable contract (OpenAPI 3.1).
- [Agent docs](/api/agent-docs): published standards and skill files. Roles are at /api/agent-roles and skills at /api/agent-resources.

## Browse

${['searchResources', 'getResource', 'listGameStarters', 'listOnboardingPaths', 'getBuildToolkit', 'listAgentResources', 'getSkillMarket'].map(line).join('\n')}

## Make and Riff

${['createProject', 'getProject', 'publishProjectVersion', 'listProjectVersions', 'forkProject'].map(line).join('\n')}

## Rules

- Resolve every path against this Lobby origin. A remote agent cannot reach another machine's localhost.
- Creating or forking a project creates real state. Do not retry a POST that succeeded.
- Create and fork return a managementKey once. Creator profiles return an editKey once. Save them privately before anything else. Never print them in logs, screenshots, reports, chat, Git or examples.
- When you save a version, send expectedHead from GET /api/projects/{id}. A 409 means someone saved first: reload, then save again.
- Errors are JSON: {"error": "..."}.
`;
}

function curlFor(operation, example) {
  const request = example?.request;
  let route = request?.path || operation.path;
  if (request?.query) route += `?${new URLSearchParams(request.query)}`;
  const parts = ['curl -s'];
  if (operation.method !== 'get') parts.push(`-X ${operation.method.toUpperCase()}`);
  if (operation.auth === 'management') parts.push("-H 'Authorization: Bearer <managementKey>'");
  if (operation.auth === 'creator') parts.push("-H 'Authorization: Bearer <editKey>'");
  if (operation.body) {
    parts.push("-H 'Content-Type: application/json'");
    const body = request?.body ?? {};
    const text = JSON.stringify(body).replace(/'/g, "'\\''");
    parts.push(`-d '${text.length > 600 ? `${text.slice(0, 600)}...` : text}'`);
  }
  parts.push(`'${PLACEHOLDER_ORIGIN}${route}'`);
  return parts.join(' ');
}

const MAX_REPLY = 2500;

function replyBlock(example, operation) {
  if (!example) return 'Example reply: not captured yet. Run `npm run contract:examples`.';
  let body = typeof example.value === 'string' ? example.value : JSON.stringify(example.value, null, 2);
  if (body.length > MAX_REPLY) body = `${body.slice(0, MAX_REPLY)}\n... (cut here; the full example is in /openapi.json under ${operation.operationId})`;
  const trimmed = example.trimmed?.length ? `\nTrimmed: ${example.trimmed.join('; ')}.` : '';
  return `Example reply (HTTP ${example.status}, ${example.contentType}):${trimmed}\n\n\`\`\`\n${body}\n\`\`\``;
}

export function llmsFullText({publicReadOnly = false} = {}) {
  const enabled = operationsFor({publicReadOnly});
  const sections = tagsFor({publicReadOnly}).map((tag) => {
    const operations = enabled.filter((operation) => operation.tag === tag.name);
    const entries = operations.map((operation) => {
      const example = capturedExamples[operation.operationId];
      const auth = publicReadOnly && operation.auth === 'creator' ? '\nAuth: an existing authorized creatorId and creator key are required for this retained read. Public profile creation and updates are disabled.' : operation.auth === 'management' ? '\nAuth: Authorization: Bearer <managementKey> (from create or fork).'
        : operation.auth === 'creator' ? '\nAuth: creatorId plus Authorization: Bearer <editKey> (from POST /api/creator-profiles).' : '';
      return `### ${operation.method.toUpperCase()} ${operation.path}

operationId: ${operation.operationId}
${operation.summary}${/[.?!]$/.test(operation.summary) ? '' : '.'} ${operation.description}${auth}

\`\`\`
${curlFor(operation, example)}
\`\`\`

${publicReadOnly && operation.tag === 'docs' ? 'Read the current document at this URL; local document snapshots are omitted here.' : replyBlock(example, operation)}`;
    });
    return `## ${tag.name}\n\n${tag.description}\n\n${entries.join('\n\n')}`;
  });
  return `# Ootle Lobby: full API guide

> Browse community builds, contests, templates and reviewed skills in Ootle Lobby.

${publicReadOnly
    ? 'This is the public read-only deployment contract. Only enabled reads and bounded stateless downloads, validation and exports are listed. Project creation, saving, forking and other persistent writes return HTTP 410 PUBLIC_WRITES_DISABLED; private/provider services return HTTP 410 PUBLIC_SERVICE_DISABLED. Retained local workflows do not enable those operations here.'
    : 'This is the local application contract, including retained project and community write implementations. Those writes are disabled on the public deployment. Use the contract served by the exact origin you are calling.'}

Each entry has a curl line and an illustrative reply captured from a local scripted fixture. Examples do not prove current production data or permission to write. IDs, hashes and times are placeholders, and long lists are trimmed.

Replace ${PLACEHOLDER_ORIGIN} with the Lobby origin you are talking to. The same contract is at /openapi.json. The short version is /llms.txt. Read /agent-start.md before you plan a build.

Conventions:
- Requests and replies are JSON unless a route serves Markdown or text. Errors are {"error": "..."} with an HTTP status.
${publicReadOnly ? '- Listed POST operations are stateless. They do not save, publish or fork projects. No key enables a disabled public write.' : '- Local POST routes can create real state. Do not retry one that succeeded.\n- Local keys (managementKey, editKey) are shown once. Keep them private.\n- Save with expectedHead or expectedRevision. A 409 means the data changed: reload and try again.'}

${sections.join('\n\n')}
`;
}
