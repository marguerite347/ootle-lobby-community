import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as governance from '../connectors/governance.mjs';

test('Private Ballot is indexed as an independent app with optional Ootle anchoring, not a verified integration', async () => {
  const { records } = await governance.fetchLive();
  const pb = records.find((r) => /private ballot/i.test(r.title));
  assert.ok(pb, 'Private Ballot present');
  assert.equal(pb.type, 'app');
  assert.equal(pb.repoUrl, 'https://github.com/GSXRspartan/private-ballot');
  assert.equal(pb.license, 'MIT OR Apache-2.0');
  assert.equal(pb.tariCompatible, null, 'optional anchoring only — not a verified integration');
  assert.equal(pb.verification, 'source-attested');
  assert.ok(pb.provenance.upstreamRevision, 'source revision preserved');
  assert.match(pb.attribution, /independent/i);
  assert.ok(pb.tags.includes('governance') && pb.tags.includes('balancing'));
});

test('curated snapshot is not mislabeled as a fresh upstream check', async () => {
  const { records } = await governance.fetchLive();
  const pb = records.find((r) => /private ballot/i.test(r.title));
  assert.equal(pb.provenance.sourceUpdatedAt, null, 'upstream update time left unknown');
  assert.equal(pb.provenance.freshness, 'provisional', 'curated snapshot marked provisional, not current');
  assert.ok(pb.lastVerifiedAt, 'editorial review date preserved');
});
