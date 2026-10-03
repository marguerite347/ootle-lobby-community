// Native Ootle starter templates from the official starter repo used by the
// `tari` CLI: https://github.com/tari-project/wasm-template
// Subfolders under wasm_templates/ (blank starters) and examples/ (complete
// examples with template + client) become native starter records. A small
// curated base guarantees the well-documented starters are always present with
// their Ootle Playground guide links.

import { getJson, githubHeaders, slug } from './http.mjs';
import { makeResource } from '../model.mjs';

const REPO = 'tari-project/wasm-template';
const REPO_URL = `https://github.com/${REPO}`;

export const source = {
  id: 'ootle-starters',
  name: 'Tari Ootle WASM starter templates',
  kind: 'github',
  canonicalUrl: REPO_URL,
  ingestion: 'GitHub contents API over wasm_templates/ and examples/',
  native: true,
};

// Curated, guide-backed starters (always present, source-attested by ootle.tari.com).
const CURATED = [
  {
    path: 'wasm_templates/empty',
    title: 'Empty Ootle template',
    summary: 'Minimal Rust/WASM template scaffold — the starting point for a new Ootle smart-contract template. Created via `tari create` / `cargo generate ... wasm_templates/empty`.',
    docsUrl: 'https://ootle.tari.com/guides/cli/',
    tags: ['starter', 'rust', 'wasm', 'template'],
  },
  {
    path: 'examples/guessing_game/template',
    title: 'Guessing game template',
    summary: 'Complete decentralized guessing-game template with tests, resources and a client CLI. Pre-published template addresses are available on the Esmeralda testnet.',
    docsUrl: 'https://ootle.tari.com/guides/build-a-guessing-game/',
    tags: ['starter', 'game', 'rust', 'wasm', 'example'],
  },
];

function starterRecord({ path, title, summary, docsUrl, tags, revision, updatedAt }) {
  return makeResource({
    id: `tari-ootle:starter:${slug(path)}`,
    type: 'starter',
    ecosystem: 'tari-ootle',
    title,
    summary: summary || `Ootle WASM starter: ${path}`,
    sourceUrl: `${REPO_URL}/tree/main/${path}`,
    repoUrl: REPO_URL,
    docsUrl: docsUrl || 'https://ootle.tari.com/guides/cli/',
    network: 'Ootle testnet (Esmeralda)',
    readiness: 'runnable-example',
    license: null,
    prerequisites: ['Rust toolchain', 'cargo-generate', 'wasm32-unknown-unknown target', 'Tari Ootle CLI (`tari`)'],
    tags: tags || ['starter', 'rust', 'wasm'],
    creator: { name: 'tari-project', url: 'https://github.com/tari-project' },
    attribution: 'Official Tari Ootle WASM template repository',
    sourceId: source.id,
    sourceName: source.name,
    upstreamId: path,
    upstreamRevision: revision || null,
    sourceUpdatedAt: updatedAt || null,
    freshness: 'current',
    verification: 'source-attested',
    tariCompatible: true,
    setupHint: `tari create <name>  #  or: cargo generate ${REPO_URL} ${path}`,
  });
}

async function listDir(dir) {
  // Throws on network/API failure (do not mask an outage as an empty directory).
  const items = await getJson(`https://api.github.com/repos/${REPO}/contents/${dir}`, {
    headers: githubHeaders(),
    timeoutMs: 15000,
  });
  return Array.isArray(items) ? items.filter((i) => i.type === 'dir') : [];
}

export async function fetchLive() {
  const byPath = new Map();
  for (const c of CURATED) byPath.set(c.path, starterRecord(c));

  // Live discovery of any additional starters/examples. A failed read must NOT be
  // reported as a fresh, complete result: propagate the error so ingest retains the
  // last-good records (including previously discovered ones) and marks them stale,
  // instead of silently collapsing the source to just the curated pair.
  let blanks, examples;
  try {
    [blanks, examples] = await Promise.all([listDir('wasm_templates'), listDir('examples')]);
  } catch (e) {
    throw new Error(`Ootle starter discovery failed: ${e.message}`);
  }

  for (const d of blanks) {
    const path = `wasm_templates/${d.name}`;
    if (!byPath.has(path)) {
      byPath.set(path, starterRecord({
        path,
        title: `${d.name.replace(/[_-]/g, ' ')} template`.replace(/\b\w/g, (m) => m.toUpperCase()),
        summary: `Ootle WASM blank starter (${d.name}).`,
        revision: d.sha,
      }));
    }
  }
  for (const d of examples) {
    const path = `examples/${d.name}/template`;
    if (!byPath.has(path)) {
      byPath.set(path, starterRecord({
        path,
        title: `${d.name.replace(/[_-]/g, ' ')} example`.replace(/\b\w/g, (m) => m.toUpperCase()),
        summary: `Complete Ootle example (${d.name}) with template and client.`,
        tags: ['starter', 'example', 'rust', 'wasm'],
        revision: d.sha,
      }));
    }
  }
  return { records: Array.from(byPath.values()) };
}
