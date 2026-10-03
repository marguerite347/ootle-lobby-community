import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRelated, RELATIONSHIP_TYPES } from '../relationships.mjs';
import * as catalog from '../catalog.mjs';

const GUIDE = 'tari-ootle:learn:building-a-guessing-game-template';
const TEMPLATE = 'tari-ootle:starter:examples-guessing-game-template';

// A tiny fixture graph for the pure resolver.
const RECORDS = {
  [GUIDE]: { id: GUIDE, title: 'Build a Guessing Game', type: 'learn', ecosystem: 'tari-ootle', topic: 'combine-mechanics' },
  [TEMPLATE]: { id: TEMPLATE, title: 'Guessing game template', type: 'starter', ecosystem: 'tari-ootle' },
};
const getRecord = (id) => RECORDS[id] || null;
const EDGES = [{ from: GUIDE, to: TEMPLATE, type: 'walkthrough-for', verified: true, evidence: 'https://ootle.tari.com/guides/build-a-guessing-game/' }];

test('relationship is bidirectional with direction-aware labels', () => {
  const fromTemplate = resolveRelated(TEMPLATE, getRecord, EDGES);
  assert.equal(fromTemplate.length, 1);
  assert.equal(fromTemplate[0].label, RELATIONSHIP_TYPES['walkthrough-for'].inverseLabel); // "Walkthrough"
  assert.equal(fromTemplate[0].resource.id, GUIDE);

  const fromGuide = resolveRelated(GUIDE, getRecord, EDGES);
  assert.equal(fromGuide[0].label, RELATIONSHIP_TYPES['walkthrough-for'].label); // "Walkthrough for"
  assert.equal(fromGuide[0].resource.id, TEMPLATE);
});

test('an edge to a removed/unknown record produces no dangling link', () => {
  const removed = (id) => (id === TEMPLATE ? null : RECORDS[id] || null); // template "deleted"
  const res = resolveRelated(GUIDE, removed, EDGES);
  assert.equal(res.length, 0, 'no link when the target no longer exists');
});

test('conceptual vs verified is preserved', () => {
  const edges = [{ from: GUIDE, to: TEMPLATE, type: 'explains', verified: false, evidence: null }];
  const res = resolveRelated(GUIDE, getRecord, edges);
  assert.equal(res[0].verified, false);
  assert.equal(res[0].status, 'conceptual');
});

test('a verified relationship downgrades to needs-review when an endpoint identity changes', () => {
  const records = {
    g: { id: 'g', title: 'G', type: 'learn', ecosystem: 'tari-ootle', provenance: { upstreamRevision: 'rev-g1' } },
    t: { id: 't', title: 'T', type: 'starter', ecosystem: 'tari-ootle', provenance: { upstreamRevision: 'rev-t1' } },
  };
  const edges = [{ from: 'g', to: 't', type: 'walkthrough-for', verified: true, evidence: 'x', reviewed: { from: 'rev-g1', to: 'rev-t1' } }];
  const get = (x) => records[x] || null;

  // Endpoints unchanged → verified.
  assert.equal(resolveRelated('t', get, edges)[0].status, 'verified');

  // The template is updated to a new revision → the verified claim is no longer supported.
  records.t.provenance.upstreamRevision = 'rev-t2';
  const downgraded = resolveRelated('t', get, edges)[0];
  assert.equal(downgraded.status, 'needs-review');
  assert.equal(downgraded.verified, false);

  // A deprecated/replaced guide revision downgrades from the other direction too.
  records.t.provenance.upstreamRevision = 'rev-t1';
  records.g.provenance.upstreamRevision = 'rev-g2';
  assert.equal(resolveRelated('g', get, edges)[0].status, 'needs-review');
});

// Integration against the real catalog + curated edges.
test('catalog.get attaches verified relationships by shared id (both directions)', () => {
  catalog.load();
  const template = catalog.get(TEMPLATE);
  assert.ok(template, 'template exists');
  const rel = (template.related || []).find((x) => x.resource.id === GUIDE);
  assert.ok(rel, 'template links back to its walkthrough guide');
  assert.equal(rel.verified, false);
  assert.equal(rel.status, 'needs-review', 'unversioned starter evidence requires review');

  const guide = catalog.get(GUIDE);
  assert.ok((guide.related || []).some((x) => x.resource.id === TEMPLATE), 'guide links to the template');
});

test('update propagation: relationships resolve by stable id regardless of content', () => {
  catalog.load();
  const before = catalog.get(TEMPLATE).related.map((r) => r.resource.id).sort();
  catalog.load(); // simulate a refresh/re-load
  const after = catalog.get(TEMPLATE).related.map((r) => r.resource.id).sort();
  assert.deepEqual(before, after, 'same relationships survive a catalog refresh');
});

 test('unknown identities and deprecated or unverified endpoints cannot verify a relationship', () => {
  assert.equal(resolveRelated(GUIDE, getRecord, EDGES)[0].status, 'needs-review');
  const records = {
    g: { id: 'g', provenance: { upstreamRevision: 'g1' } },
    t: { id: 't', provenance: { upstreamRevision: 't1' } },
  };
  const edges = [{ from: 'g', to: 't', type: 'explains', verified: true, evidence: 'source', reviewed: { from: 'g1', to: 't1' } }];
  const get = (id) => records[id];
  records.t.readiness = 'deprecated';
  assert.equal(resolveRelated('g', get, edges)[0].status, 'needs-review');
  records.t.readiness = 'tested-release';
  records.t.verification = 'unverified';
  assert.equal(resolveRelated('g', get, edges)[0].status, 'needs-review');
  delete records.g;
  assert.deepEqual(resolveRelated('g', get, edges), []);
 });
