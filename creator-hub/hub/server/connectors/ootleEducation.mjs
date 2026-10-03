// Official Tari Ootle education — a small curated set of Ootle Playground guides and
// docs (ootle.tari.com). These are source-attested official references (verification
// 'source-attested'), classified for the Learn section by creator goal (topic),
// level and format. They link out by default and are labeled distinct from tested
// walkthroughs. Approved community-wiki education (CH-020) will extend this source
// once its endpoint and reuse rights are confirmed.

import { makeResource } from '../model.mjs';
import { slug } from './http.mjs';

const SITE = 'https://ootle.tari.com';
const CHECKED = '2026-09-19';

export const source = {
  id: 'ootle-education',
  name: 'Tari Ootle Playground (official docs)',
  kind: 'curated',
  canonicalUrl: SITE,
  ingestion: 'Curated official Ootle Playground guides/docs (link-out)',
  native: true,
};

// Creator-goal taxonomy for the Learn section (shared with the client).
export const LEARN_TOPICS = [
  { id: 'understand', label: 'Understand Ootle' },
  { id: 'use-templates', label: 'Use templates' },
  { id: 'combine-mechanics', label: 'Combine mechanics' },
  { id: 'build-frontend', label: 'Build a frontend' },
  { id: 'test-deploy', label: 'Test & deploy' },
  { id: 'troubleshoot', label: 'Troubleshoot' },
];

const GUIDES = [
  {
    title: 'What is the Tari Ootle Playground?',
    url: `${SITE}/`,
    summary: 'Orientation to the Ootle Playground: building Rust/WASM smart-contract templates and apps on the Tari L2 (Ootle) testnet.',
    topic: 'understand', level: 'beginner', format: 'guide',
    tags: ['ootle', 'orientation', 'overview'],
  },
  {
    // One canonical record for the /guides/cli/ page. It covers both creating/using
    // templates AND testing them locally, so it is associated with several goals
    // rather than duplicated into separate records for the same URL.
    title: 'Using the Tari Ootle CLI',
    url: `${SITE}/guides/cli/`,
    summary: 'Install the Tari Ootle CLI and use it to create a template project, add templates to a workspace, write a Hello World template in Rust, and test locally with the TemplateTest tooling (compile to WASM and run transactions against the same engine as the network).',
    topic: 'use-templates', topics: ['use-templates', 'test-deploy'], level: 'beginner', format: 'guide',
    tags: ['cli', 'rust', 'wasm', 'template', 'testing', 'tari'],
  },
  {
    title: 'Building a Guessing Game Template',
    url: `${SITE}/guides/build-a-guessing-game/`,
    summary: 'End-to-end walkthrough: design and implement state and logic for a decentralized guessing game template, manage resources, and write unit tests with the template test harness.',
    topic: 'combine-mechanics', level: 'intermediate', format: 'walkthrough',
    tags: ['game', 'template', 'rust', 'wasm', 'tutorial'],
  },
  {
    title: 'Publishing Templates to testnet',
    url: `${SITE}/guides/publishing-templates/`,
    summary: 'Compile a template to WASM and publish it to the Ootle testnet with the Wallet Web UI, paying fees with TTARI testnet funds.',
    topic: 'test-deploy', level: 'intermediate', format: 'guide',
    tags: ['publish', 'testnet', 'wallet', 'ttari'],
  },
];

export async function fetchLive() {
  const records = GUIDES.map((g) => makeResource({
    id: `tari-ootle:learn:${slug(g.title)}`,
    type: 'learn',
    ecosystem: 'tari-ootle',
    title: g.title,
    summary: g.summary,
    category: 'Ootle education',
    sourceUrl: g.url,
    docsUrl: g.url,
    network: 'Ootle testnet',
    readiness: 'conceptual',
    license: null,
    topic: g.topic,
    topics: g.topics || [g.topic],
    level: g.level,
    format: g.format,
    tags: ['learn', ...g.tags],
    creator: { name: 'Tari / Ootle', url: SITE },
    attribution: 'Official Tari Ootle Playground documentation',
    sourceId: source.id,
    sourceName: source.name,
    upstreamId: g.url,
    upstreamUrl: g.url,
    // Curated snapshot: leave upstream update time unknown, keep the editorial review
    // date in lastVerifiedAt, and mark 'provisional' vs a live upstream check.
    sourceUpdatedAt: null,
    lastVerifiedAt: CHECKED,
    freshness: 'provisional',
    verification: 'source-attested',
    tariCompatible: true,
  }));
  return { records };
}
