import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createApp} from '../app.mjs';
import {publicDocument, publicDocumentIndex, publicRoleIndex, publicRoleMarkdown, rewritePublicReferences} from '../agentDocs.mjs';

const canonicalTeam = JSON.parse(readFileSync(new URL('../../../agents/team.json', import.meta.url), 'utf8'));

test('public roles follow the canonical manifest without inheriting internal permissions', () => {
  const index = publicRoleIndex();
  assert.deepEqual(index.roles.map(role => role.id), canonicalTeam.roles.map(role => role.id));
  for (const role of index.roles) {
    const body = publicRoleMarkdown(role.id);
    assert.match(body, /private repository access is not required/i);
    assert.match(body, /## Specialty/);
    assert.doesNotMatch(body, /Repository: https:\/\/github.com\/marguerite347|existing Cursor access|this Mac|localhost4210|The user authorizes useful gap-based additions/);
    for (const read of role.requiredReads) {
      assert.ok(read.url || read.reason);
      if (!read.url) assert.equal(read.availability, 'internal-only');
    }
  }
  assert.equal(publicRoleMarkdown('../../team'), null);
  assert.match(publicRoleMarkdown('blueprints'), /implementation is not published/);
  assert.doesNotMatch(publicDocument('creator-hub/VIDEO_WORKFLOWS.md').body, /docs.google.com|14aIbM0Zga/);
});

test('allowlist excludes private reports, source, runtime and traversal paths', () => {
  for (const source of ['AGENTS.md', 'creator-hub/agents/team.json', 'creator-hub/agents/STORY_TRIAL.md', 'creator-hub/agents/REWARDS_TRIAL.md', 'creator-hub/ACHIEVEMENTS.md', 'creator-hub/hub/server/creatorAnalytics.mjs', 'creator-hub/hub/runtime/projects.json', '../AGENTS.md', 'creator-hub/../AGENTS.md', '__proto__']) {
    assert.equal(publicDocument(source), null, source);
  }
  const coordination = publicDocument('creator-hub/agents/COORDINATION.md').body;
  assert.doesNotMatch(coordination, /4198|4210|4211|PR186|heartbeat|existing Cursor/);
  assert.match(coordination, /GitHub is optional/);
  for (const entry of publicDocumentIndex().items) assert.ok(publicDocument(entry.source), entry.source);
});

test('public references resolve cross-skill paths while excluding internal links', () => {
  const output = rewritePublicReferences('[feel](skills/disciplines/game-feel/SKILL.md) [private](../../../agents/STORY_TRIAL.md)', 'skills/vendor/gamedev/router/SKILL.md');
  assert.match(output, /\/agent-docs\/skills\/vendor\/gamedev\/skills\/disciplines\/game-feel\/SKILL.md/);
  assert.doesNotMatch(output, /\]\([^)]*STORY_TRIAL/);
  const code = '```sh\ncat `creator-hub/BRAND.md`\n```';
  assert.equal(rewritePublicReferences(code, 'creator-hub/BRAND.md'), code);
});

test('website-only HTTP clients can read every role and all linked onboarding resources', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const indexResponse = await fetch(base + '/api/agent-roles');
    assert.equal(indexResponse.status, 200);
    const index = await indexResponse.json();
    const routes = new Set(['/api/agent-docs', '/agent-docs/creator-hub/hub/AGENT_BUILD_REFERENCE.md', '/agent-docs/skills/vendor/gamedev/router/SKILL.md', '/agent-skills/gamedev-phaser-core/bundle.json']);
    for (const role of index.roles) {
      routes.add(role.instructions);
      for (const read of role.requiredReads) if (read.url) routes.add(read.url);
      const markdown = await (await fetch(base + role.instructions)).text();
      for (const match of markdown.matchAll(/\]\((\/[^)#]+)(?:#[^)]*)?\)/g)) routes.add(match[1]);
    }
    for (const route of routes) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, route);
      if (route.endsWith('.md')) assert.match(response.headers.get('content-type'), /markdown/, route);
    }
    for (const route of ['/agent-docs/AGENTS.md', '/agent-docs/creator-hub/agents/team.json', '/agent-docs/creator-hub/agents/STORY_TRIAL.md', '/agent-docs/..%2FAGENTS.md', '/agent-docs/%252e%252e%252fAGENTS.md', '/agent-docs/creator-hub%2F..%2FAGENTS.md', '/agent-roles/unknown.md', '/agent-roles/__proto__.md']) {
      assert.equal((await fetch(base + route)).status, 404, route);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
