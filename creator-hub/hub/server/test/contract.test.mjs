// Contract drift test: the Express app, the OpenAPI contract, the internal route
// list, the captured examples and the generated llms files must agree.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = mkdtempSync(path.join(tmpdir(), 'contract-test-'));
process.env.CREATOR_HUB_DATA_DIR = root;
process.env.CREATOR_HUB_PREVIEWS_DIR = path.join(root, 'previews');
const { createApp } = await import('../app.mjs');
const catalog = await import('../catalog.mjs');
const { listRoutes, expressPathFromOpenApi } = await import('../contract/routeInventory.mjs');
const { buildOpenApi, OPERATIONS, TAGS, capturedExamples } = await import('../contract/openapi.mjs');
const { INTERNAL_ROUTES, INTERNAL_CATEGORIES } = await import('../contract/internalRoutes.mjs');
const { checkShape, collectRefs, resolvePointer } = await import('../contract/shape.mjs');

catalog.load();
const doc = buildOpenApi();
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const key = (method, route) => `${method.toUpperCase()} ${route}`;

function documentedRoutes() {
  const out = new Map();
  for (const [route, item] of Object.entries(doc.paths)) {
    const expressPath = item['x-express-path'] || expressPathFromOpenApi(route);
    for (const method of METHODS) if (item[method]) out.set(key(method, expressPath), { route, method, operation: item[method] });
  }
  return out;
}

let server;
let base;
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  rmSync(root, { recursive: true, force: true });
});

test('every registered route is either in the public contract or the internal list', () => {
  const registered = listRoutes(createApp()).map((route) => key(route.method, route.path));
  const documented = documentedRoutes();
  const internal = new Set(INTERNAL_ROUTES.map((route) => key(route.method, route.path)));
  const missing = registered.filter((route) => !documented.has(route) && !internal.has(route));
  assert.deepEqual(missing, [], `Add these routes to server/contract/openapi.mjs or internalRoutes.mjs:\n${missing.join('\n')}`);
  const ghost = [...documented.keys()].filter((route) => !registered.includes(route));
  assert.deepEqual(ghost, [], `The contract lists routes the app does not register:\n${ghost.join('\n')}`);
  const both = [...documented.keys()].filter((route) => internal.has(route));
  assert.deepEqual(both, [], `Routes cannot be public and internal:\n${both.join('\n')}`);
});

test('internal routes each have a known category and a reason', () => {
  const seen = new Set();
  for (const route of INTERNAL_ROUTES) {
    const id = key(route.method, route.path);
    assert.ok(!seen.has(id), `duplicate internal route ${id}`);
    seen.add(id);
    assert.ok(INTERNAL_CATEGORIES[route.category], `${id}: unknown category ${route.category}`);
    assert.ok(typeof route.reason === 'string' && route.reason.length > 10, `${id}: needs a one-line reason`);
  }
  assert.ok(INTERNAL_ROUTES.some((route) => route.path.startsWith('/api/daily-trivia')), 'Daily Spark trivia stays internal');
});

test('the OpenAPI document is structurally valid', () => {
  assert.equal(doc.openapi, '3.1.0');
  assert.ok(doc.info?.title && doc.info?.version);
  const tagNames = new Set(TAGS.map((tag) => tag.name));
  const ids = new Set();
  for (const [route, item] of Object.entries(doc.paths)) {
    assert.ok(route.startsWith('/'), route);
    for (const method of METHODS.filter((name) => item[name])) {
      const operation = item[method];
      const where = `${method.toUpperCase()} ${route}`;
      assert.ok(operation.operationId, `${where}: operationId`);
      assert.ok(!ids.has(operation.operationId), `${where}: duplicate operationId ${operation.operationId}`);
      ids.add(operation.operationId);
      assert.ok(operation.summary && operation.summary.length <= 80, `${where}: one-line summary`);
      assert.ok(operation.description, `${where}: description`);
      assert.equal(operation.tags?.length, 1, `${where}: one tag`);
      assert.ok(tagNames.has(operation.tags[0]), `${where}: unknown tag ${operation.tags[0]}`);
      const statuses = Object.keys(operation.responses || {});
      assert.ok(statuses.some((status) => /^2\d\d$/.test(status)), `${where}: a 2xx response`);
      for (const [status, response] of Object.entries(operation.responses)) {
        assert.ok(response.description, `${where} ${status}: description`);
        for (const media of Object.values(response.content || {})) assert.ok(media.schema, `${where} ${status}: schema`);
      }
      const examples = statuses.flatMap((status) => Object.values(operation.responses[status].content || {}).flatMap((media) => Object.values(media.examples || {})));
      assert.equal(examples.length, 1, `${where}: exactly one example reply (run npm run contract:examples)`);
      const templated = [...route.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();
      const declared = (operation.parameters || []).filter((parameter) => parameter.in === 'path').map((parameter) => parameter.name).sort();
      assert.deepEqual(declared, templated, `${where}: path parameters`);
      for (const parameter of operation.parameters || []) {
        assert.ok(parameter.name && parameter.in && parameter.schema && parameter.description, `${where}: parameter fields`);
        if (parameter.in === 'path') assert.equal(parameter.required, true, `${where}: path parameter ${parameter.name} is required`);
      }
      if (operation.security) for (const requirement of operation.security) for (const scheme of Object.keys(requirement)) assert.ok(doc.components.securitySchemes[scheme], `${where}: security scheme ${scheme}`);
    }
  }
  assert.equal(ids.size, OPERATIONS.length);
  for (const pointer of collectRefs(doc)) assert.doesNotThrow(() => resolvePointer(doc, pointer), pointer);
});

test('captured examples cover every operation and fit their documented schemas', () => {
  for (const operation of OPERATIONS) {
    const example = capturedExamples[operation.operationId];
    assert.ok(example, `${operation.operationId}: no captured example; run npm run contract:examples`);
    const response = doc.paths[operation.path][operation.method].responses[String(example.status)];
    assert.ok(response, `${operation.operationId}: example status ${example.status} is not documented`);
    const media = response.content[example.contentType];
    assert.ok(media, `${operation.operationId}: example content type ${example.contentType} is not documented`);
    assert.deepEqual(checkShape(media.schema, example.value, doc), [], operation.operationId);
    const text = JSON.stringify(example);
    assert.ok(!/"(?:managementKey|editKey)":\s*"(?![a-z]{2}_…)/.test(text), `${operation.operationId}: key not replaced by a placeholder`);
  }
  const unknown = Object.keys(capturedExamples).filter((id) => !OPERATIONS.some((operation) => operation.operationId === id));
  assert.deepEqual(unknown, [], 'examples.json has examples for operations that no longer exist');
});

// External calls (live Hugging Face) are not part of the offline check.
const NETWORK = new Set(['searchHuggingFace']);

test('live replies of setup-free public GETs match their documented shape', async () => {
  const checked = [];
  for (const operation of OPERATIONS) {
    if (operation.method !== 'get' || operation.path.includes('{') || operation.auth || NETWORK.has(operation.operationId)) continue;
    if ((operation.parameters || []).some((parameter) => parameter.required)) continue;
    const response = await fetch(base + operation.path);
    const where = `GET ${operation.path}`;
    assert.equal(response.status, 200, where);
    const documented = doc.paths[operation.path].get.responses['200'].content;
    const contentType = (response.headers.get('content-type') || '').split(';')[0];
    assert.ok(documented[contentType], `${where}: content type ${contentType} is not documented`);
    const body = contentType === 'application/json' ? await response.json() : await response.text();
    assert.deepEqual(checkShape(documented[contentType].schema, body, doc), [], where);
    checked.push(operation.operationId);
  }
  assert.ok(checked.length >= 25, `only ${checked.length} live checks ran`);
});

test('llms.txt, llms-full.txt and openapi.json are served and complete', async () => {
  const get = async (route) => {
    const response = await fetch(base + route);
    return { status: response.status, type: (response.headers.get('content-type') || '').split(';')[0], cache: response.headers.get('cache-control'), link: response.headers.get('link'), text: await response.text() };
  };
  const short = await get('/llms.txt');
  assert.equal(short.status, 200);
  assert.equal(short.type, 'text/plain');
  assert.match(short.link, /\/openapi\.json>; rel="service-desc"/);
  for (const link of ['/agent-start.md', '/llms-full.txt', '/openapi.json', '/api/agent-docs']) assert.ok(short.text.includes(link), `llms.txt links ${link}`);
  assert.match(short.text, /AI designer named Glint/);
  assert.match(short.text, /no published games/);
  assert.match(short.text, /no preset Riff builder/);
  assert.ok(!short.text.includes('—'), 'llms.txt uses no em dashes');
  assert.ok(!/wXTM|TARI\b|\btokens?\b/.test(short.text), 'llms.txt does not present tokens as a feature');

  const full = await get('/llms-full.txt');
  assert.equal(full.status, 200);
  assert.equal(full.type, 'text/plain');
  for (const operation of OPERATIONS) {
    assert.ok(full.text.includes(`### ${operation.method.toUpperCase()} ${operation.path}\n`), `llms-full.txt covers ${operation.operationId}`);
    assert.ok(full.text.includes(`operationId: ${operation.operationId}\n`), `llms-full.txt names ${operation.operationId}`);
  }
  assert.ok(!/"(?:managementKey|editKey)": "[a-f0-9]{64}"/.test(full.text), 'no key values in llms-full.txt');

  const contract = await get('/openapi.json');
  assert.equal(contract.status, 200);
  assert.equal(contract.type, 'application/json');
  assert.match(contract.cache, /max-age=300/);
  assert.deepEqual(JSON.parse(contract.text), JSON.parse(JSON.stringify(doc)));

  const index = JSON.parse((await get('/api/agent-docs')).text);
  assert.equal(index.openapi, '/openapi.json');
  assert.equal(index.llmsFull, '/llms-full.txt');
});
