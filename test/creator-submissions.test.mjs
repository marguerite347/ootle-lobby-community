import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {safeHref} from '../creator-hub/hub/shared/safeLinks.mjs';

const registry = JSON.parse(readFileSync(new URL('../content/creator-submissions/launch-2026.json', import.meta.url)));
const resources = JSON.parse(readFileSync(new URL('../creator-hub/hub/shared/ecosystemResources.json', import.meta.url))).records;

test('creator entries retain unique forum identities and distinct public work links', () => {
  const posts = new Set(), works = new Set(), ids = new Set();
  assert.match(registry.threadUrl, /\/503$/);
  assert.ok(Number.isFinite(Date.parse(registry.checkedAt)));
  for (const entry of registry.entries) {
    assert.ok(entry.sourceUrl.startsWith(`${registry.threadUrl}/`));
    assert.ok(!posts.has(entry.sourceUrl)); posts.add(entry.sourceUrl);
    assert.ok(!ids.has(entry.id)); ids.add(entry.id);
    assert.ok(Date.parse(entry.updatedAt) >= Date.parse(entry.publishedAt));
    for (const work of entry.works) {
      assert.ok(safeHref(work.url)?.startsWith('https://'));
      const url = new URL(work.url); url.hash = '';
      for (const name of [...url.searchParams.keys()]) if (name.startsWith('utm_') || ['si', 'feature'].includes(name)) url.searchParams.delete(name);
      const key = url.href.replace(/\/$/, '');
      assert.ok(!works.has(key), `Duplicate publication: ${key}`); works.add(key);
    }
    for (const id of entry.resourceIds) assert.ok(resources.some(resource => resource.id === id), `Missing canonical resource: ${id}`);
    if (!entry.works.length) assert.match(entry.note, /links have not been shared/);
  }
  // A moved article/update stays in the original creator's entry, not a second submission.
  assert.equal(registry.entries.filter(entry => entry.creator === 'hycorange').length, 1);
  assert.ok(!posts.has(`${registry.threadUrl}/9`));
});
