// Luanti (formerly Minetest) games & mods from the ContentDB public API.
// Source: https://content.luanti.org/api/packages/
// External voxel-engine ecosystem. Rich metadata (author, license, type, repo).
// Tari compatibility unknown (null). "Minetest" name preserved in tags for search.

import { getJson, slug } from './http.mjs';
import { makeResource } from '../model.mjs';

const API = 'https://content.luanti.org/api/packages/';
const SITE = 'https://content.luanti.org';
const LIMIT = 24;
const STATS_CAP = 20; // per-package download/score lookups (real popularity signal)

export const source = {
  id: 'luanti-contentdb',
  name: 'Luanti ContentDB',
  kind: 'rest',
  canonicalUrl: SITE,
  ingestion: 'ContentDB REST API (games + mods, capped)',
  native: false,
};

const TYPE_MAP = { game: 'starter', mod: 'component', txp: 'asset' };

async function fetchType(type, limit) {
  const list = await getJson(`${API}?type=${type}&limit=${limit}`, { timeoutMs: 15000 });
  return Array.isArray(list) ? list : [];
}

// Fetch downloads/score for a capped subset (concurrency-limited) — the ContentDB
// list endpoint omits these, so we look them up per package. Tolerates failures.
async function withStats(pkgs) {
  const targets = pkgs.slice(0, STATS_CAP);
  const stats = new Map();
  const pool = 5;
  for (let i = 0; i < targets.length; i += pool) {
    const batch = targets.slice(i, i + pool);
    await Promise.all(batch.map(async (p) => {
      try {
        const d = await getJson(`${API}${p.author}/${p.name}/`, { timeoutMs: 9000 });
        if (d.downloads != null || d.score != null) {
          stats.set(`${p.author}/${p.name}`, { downloads: d.downloads ?? null, score: d.score ?? null });
        }
      } catch { /* leave without a signal */ }
    }));
  }
  return stats;
}

export async function fetchLive() {
  const [games, mods] = await Promise.all([
    fetchType('game', LIMIT),
    fetchType('mod', LIMIT),
  ]);
  const stats = await withStats([...games, ...mods]);
  const records = [...games, ...mods].map((p) => {
    const stat = stats.get(`${p.author}/${p.name}`);
    const type = TYPE_MAP[p.type] || 'component';
    const page = `${SITE}/packages/${p.author}/${p.name}`;
    return makeResource({
      id: `luanti:${p.type}:${slug(p.author + '-' + p.name)}`,
      type,
      ecosystem: 'luanti',
      title: p.title || p.name,
      summary: p.short_description || null,
      sourceUrl: page,
      repoUrl: p.repo || null,
      docsUrl: p.website || 'https://docs.luanti.org/',
      readiness: 'runnable-example',
      license: p.license || null,
      prerequisites: type === 'component' ? ['Luanti engine', 'a Luanti game'] : ['Luanti engine'],
      tags: ['luanti', 'minetest', 'voxel', p.type, ...(p.tags || [])].slice(0, 8),
      creator: { name: p.author, url: `${SITE}/users/${p.author}` },
      attribution: `${p.title || p.name} by ${p.author} on Luanti ContentDB`,
      sourceId: source.id,
      sourceName: source.name,
      upstreamId: `${p.author}/${p.name}`,
      upstreamRevision: p.release || null,
      freshness: 'current',
      verification: 'source-attested',
      tariCompatible: null,
      setupHint: 'Install via Luanti in-app ContentDB browser, or download from the package page.',
      signals: stat ? { contentdb: stat } : {},
      preview: p.thumbnail ? { image: p.thumbnail, video: null, source: 'ContentDB thumbnail' } : null,
    });
  });
  return { records };
}
