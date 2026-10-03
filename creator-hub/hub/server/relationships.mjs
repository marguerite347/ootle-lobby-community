// CH-022 — typed relationships between canonical learning resources and templates/
// recipes. Edges are curated and grounded in official Ootle sources; `verified` marks
// links backed by evidence (e.g. the guide builds that exact template) versus
// conceptual suggestions.
//
// A verified edge stores the evidence identity of BOTH endpoints at review time
// (`reviewed.from` / `reviewed.to`). If either endpoint's current identity changes, the
// relationship is downgraded to `needs-review` rather than silently keeping a stale
// "verified" claim. Stable IDs preserve the relationship; they must not preserve an
// unsupported verification. Edges to removed/private records resolve to nothing.

export const RELATIONSHIP_TYPES = {
  explains: { label: 'Explains', inverseLabel: 'Explained by', group: 'understand' },
  'walkthrough-for': { label: 'Walkthrough for', inverseLabel: 'Walkthrough', group: 'build' },
  'prerequisite-for': { label: 'Prerequisite for', inverseLabel: 'Prerequisite', group: 'build' },
  troubleshoots: { label: 'Troubleshoots', inverseLabel: 'Troubleshooting', group: 'troubleshoot' },
};

export const GROUP_LABELS = {
  understand: 'Understand',
  build: 'Build & combine',
  troubleshoot: 'Troubleshoot',
  related: 'Related',
};

// The evidence identity of a record: its upstream revision if any, else the editorial
// review date, else null. Used to detect when a verified relationship needs re-review.
export function evidenceIdentity(record) {
  if (!record) return null;
  return record.provenance?.upstreamRevision || record.lastVerifiedAt || null;
}

// Endpoint identities captured when these relationships were reviewed (2026-09-19):
// the Ootle guides carry lastVerifiedAt 2026-09-19; the curated starters have no
// upstream revision (identity null).
const GUIDE_ID = '2026-09-19';
const STARTER_ID = null;
const R = { from: GUIDE_ID, to: STARTER_ID };

// from = learning resource, to = template/recipe.
export const EDGES = [
  { from: 'tari-ootle:learn:building-a-guessing-game-template', to: 'tari-ootle:starter:examples-guessing-game-template', type: 'walkthrough-for', verified: true, evidence: 'https://ootle.tari.com/guides/build-a-guessing-game/', reviewed: R },
  { from: 'tari-ootle:learn:using-the-tari-ootle-cli', to: 'tari-ootle:starter:wasm-templates-empty', type: 'explains', verified: true, evidence: 'https://ootle.tari.com/guides/cli/', reviewed: R },
  { from: 'tari-ootle:learn:using-the-tari-ootle-cli', to: 'tari-ootle:starter:examples-guessing-game-template', type: 'explains', verified: true, evidence: 'https://ootle.tari.com/guides/cli/', reviewed: R },
  { from: 'tari-ootle:learn:publishing-templates-to-testnet', to: 'tari-ootle:starter:wasm-templates-empty', type: 'prerequisite-for', verified: true, evidence: 'https://ootle.tari.com/guides/publishing-templates/', reviewed: R },
  { from: 'tari-ootle:learn:what-is-the-tari-ootle-playground', to: 'tari-ootle:starter:wasm-templates-empty', type: 'explains', verified: true, evidence: 'https://ootle.tari.com/', reviewed: R },
  // Conceptual: the CLI guide covers the general flow for token starters, but each is
  // not individually verified against a pinned template release yet.
  { from: 'tari-ootle:learn:using-the-tari-ootle-cli', to: 'tari-ootle:starter:wasm-templates-fungible', type: 'explains', verified: false, evidence: null },
  { from: 'tari-ootle:learn:using-the-tari-ootle-cli', to: 'tari-ootle:starter:wasm-templates-nft', type: 'explains', verified: false, evidence: null },
];

/**
 * Resolve the relationships touching `id`. Each item carries a `status`:
 *   'verified'     — backed by evidence and both endpoint identities still match
 *   'needs-review' — was verified, but an endpoint's evidence identity changed
 *   'conceptual'   — a suggested combination, not verified
 * Edges to missing (removed/private) records are dropped (no dangling links).
 */
export function resolveRelated(id, getRecord, edges = EDGES) {
  const out = [];
  for (const e of edges) {
    let otherId; let direction;
    if (e.from === id) { otherId = e.to; direction = 'out'; }
    else if (e.to === id) { otherId = e.from; direction = 'in'; }
    else continue;
    const other = getRecord(otherId);
    if (!other || !getRecord(id)) continue; // removed / private / unknown → no public link

    let status = 'conceptual';
    if (e.verified) {
      const curFrom = evidenceIdentity(getRecord(e.from));
      const curTo = evidenceIdentity(getRecord(e.to));
      const rf = e.reviewed ? e.reviewed.from : null;
      const rt = e.reviewed ? e.reviewed.to : null;
      const endpoints = [getRecord(e.from), getRecord(e.to)];
      const eligible = endpoints.every((r) => r.readiness !== 'deprecated' && r.verification !== 'unverified');
      status = (eligible && e.evidence && curFrom && curTo && curFrom === rf && curTo === rt) ? 'verified' : 'needs-review';
    }

    const def = RELATIONSHIP_TYPES[e.type] || { label: e.type, inverseLabel: e.type, group: 'related' };
    out.push({
      type: e.type,
      label: direction === 'out' ? def.label : def.inverseLabel,
      group: def.group,
      status,
      verified: status === 'verified',
      evidence: e.evidence || null,
      resource: { id: other.id, title: other.title, type: other.type, ecosystem: other.ecosystem, topic: other.topic || null },
    });
  }
  return out;
}
