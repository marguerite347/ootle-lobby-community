// Generates /llms.txt (short entry point) and /llms-full.txt (every public operation
// with a curl line and a real example reply) from the OpenAPI contract.

import { OPERATIONS, TAGS, PLACEHOLDER_ORIGIN, capturedExamples } from './openapi.mjs';

const byId = new Map(OPERATIONS.map((operation) => [operation.operationId, operation]));
const line = (operationId) => {
  const operation = byId.get(operationId);
  return `- ${operation.method.toUpperCase()} ${operation.path}: ${operation.summary}${/[.?!]$/.test(operation.summary) ? '' : '.'}`;
};

export function llmsText() {
  return `# Ootle Lobby

> Ootle Lobby is a place to make, play and share games with an AI designer named Glint.

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

export function llmsFullText() {
  const sections = TAGS.map((tag) => {
    const operations = OPERATIONS.filter((operation) => operation.tag === tag.name);
    const entries = operations.map((operation) => {
      const example = capturedExamples[operation.operationId];
      const auth = operation.auth === 'management' ? '\nAuth: Authorization: Bearer <managementKey> (from create or fork).'
        : operation.auth === 'creator' ? '\nAuth: creatorId plus Authorization: Bearer <editKey> (from POST /api/creator-profiles).' : '';
      return `### ${operation.method.toUpperCase()} ${operation.path}

operationId: ${operation.operationId}
${operation.summary}${/[.?!]$/.test(operation.summary) ? '' : '.'} ${operation.description}${auth}

\`\`\`
${curlFor(operation, example)}
\`\`\`

${replyBlock(example, operation)}`;
    });
    return `## ${tag.name}\n\n${tag.description}\n\n${entries.join('\n\n')}`;
  });
  return `# Ootle Lobby: full API guide

> Ootle Lobby is a place to make, play and share games with an AI designer named Glint.

This file lists every public HTTP operation in the order an agent usually needs them: read the docs, browse the catalogue, make a project, fork (Riff) it, add assets, then join the community. Each entry has what it is for, a curl line and a real reply captured from a scripted run. IDs, hashes and times in the replies are placeholders, and long lists are trimmed.

Replace ${PLACEHOLDER_ORIGIN} with the Lobby origin you are talking to. The same contract is at /openapi.json. The short version is /llms.txt. Read /agent-start.md before you plan a build.

Conventions:
- Requests and replies are JSON unless a route serves Markdown or text. Errors are {"error": "..."} with an HTTP status.
- POST routes that create things create real state. Do not retry one that succeeded.
- Keys (managementKey, editKey) are shown once. Keep them private. Send them as Authorization: Bearer <key>.
- Save with expectedHead or expectedRevision. A 409 means the data changed: reload and try again.

${sections.join('\n\n')}
`;
}
