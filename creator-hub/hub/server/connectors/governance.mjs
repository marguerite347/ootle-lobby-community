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
    summary: 'Privacy-preserving voting pilots with independently verifiable offline archives and optional Ootle anchoring. November 14 review: Veil displays TariPrivateBallotAnchorV2 (43 KB) with publish_anchor_v2, matching the creator’s November 12 mainnet publication announcement. This establishes the anchor template deployment. The creator says the hosted website and browser-wallet integration are still being configured and will provide the final website link and completed live-anchor evidence later. The older README describes an Esmeralda desktop alpha for non-binding governance pilots; no production election or working hosted mainnet app is claimed here. The new recording is the creator announcement walkthrough. Original repository, earlier testnet observations and media are retained in maintenance history.',
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
    network: "Ootle mainnet anchor template; Esmeralda desktop alpha",
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
    setupHint: "Inspect the mainnet anchor template and creator announcement. Hosted website and browser-wallet configuration remain pending; desktop pilots are non-binding.",
    preview: {"video": "https://lobby.tari.com/previews/community/resource-private-ballot-20261114.mp4", "image": "https://lobby.tari.com/previews/community/resource-private-ballot-20261114.jpg", "source": "Announcement"},
    discussionLinks: [{"url": "https://community.tari.com/t/september-contest-thread/324/3", "platform": "Original contest post"}, {"url": "https://community.tari.com/t/november-bonus-contest-first-to-launch/521/11", "platform": "Mainnet anchor announcement"}],
  }));
  return { records };
}
