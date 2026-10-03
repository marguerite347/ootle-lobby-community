// Community governance & game-balancing resources (curated from
// creator-hub/resources/governance.md, added on main in f328d17).
//
// First entry: Private Ballot — an INDEPENDENT privacy-preserving voting app with
// OPTIONAL Tari Ootle anchoring. It is not a Tari Labs project and not a verified
// Ootle integration (no local execution/security audit performed by the hub); the
// optional anchoring publishes aggregate evidence, and the offline archive stays
// authoritative. Recorded for education, community-app discovery and game-balancing
// workflows, with its source revision preserved.

import { makeResource } from '../model.mjs';
import { slug } from './http.mjs';

const CHECKED = '2026-09-19';

export const source = {
  id: 'governance-resources',
  name: 'Community governance & balancing',
  kind: 'curated',
  canonicalUrl: 'https://github.com/marguerite347/ootle-lobby/blob/main/creator-hub/resources/governance.md',
  ingestion: 'Curated from creator-hub/resources/governance.md (link-out)',
  native: false,
};

const ENTRIES = [
  {
    id: 'private-ballot',
    title: 'Private Ballot',
    repo: 'https://github.com/GSXRspartan/private-ballot',
    revision: '5f88f1892ff9c20af2fc55a0d756c22c76ed48af',
    summary: 'Independent open-source privacy-preserving desktop voting app (Tor transport, Tari Triptych eligibility proofs, independently verifiable offline archives) with OPTIONAL Tari Ootle anchoring. Alpha for non-binding governance pilots on the Esmeralda testnet — indexed for education, community-app discovery and game-balancing workflows.',
    docsUrl: 'https://github.com/GSXRspartan/private-ballot/blob/main/docs/OPERATOR_SETUP.md',
    license: 'MIT OR Apache-2.0',
    tags: ['governance', 'voting', 'privacy', 'tor', 'triptych', 'ootle-anchor', 'balancing', 'game-design'],
  },
];

export async function fetchLive() {
  const records = ENTRIES.map((e) => makeResource({
    id: `tari-ootle:app:${slug(e.id)}`,
    type: 'app',
    ecosystem: 'tari-ootle',
    title: e.title,
    summary: e.summary,
    category: 'Governance / balancing',
    sourceUrl: e.repo,
    repoUrl: e.repo,
    docsUrl: e.docsUrl,
    network: 'Ootle testnet (Esmeralda) — optional anchoring',
    readiness: 'runnable-example',
    license: e.license,
    prerequisites: ['Independent project (not Tari Labs)', 'Optional Ootle anchoring'],
    tags: e.tags,
    creator: { name: 'GSXRspartan', url: 'https://github.com/GSXRspartan' },
    attribution: 'Private Ballot by GSXRspartan — independent project, optional Tari Ootle anchoring (not a verified integration)',
    sourceId: source.id,
    sourceName: source.name,
    upstreamId: e.repo,
    upstreamUrl: e.repo,
    upstreamRevision: e.revision,
    // Curated snapshot: the upstream update time is unknown (we did not fetch upstream
    // this run), so leave sourceUpdatedAt null and keep the editorial review date in
    // lastVerifiedAt. 'provisional' marks a curated snapshot vs a live upstream check.
    sourceUpdatedAt: null,
    lastVerifiedAt: CHECKED,
    freshness: 'provisional',
    verification: 'source-attested',
    tariCompatible: null, // optional anchoring only; integration not verified by the hub
    setupHint: 'See the operator setup guide; anchoring on Ootle testnet is optional. No local execution/audit performed by the hub.',
  }));
  return { records };
}
