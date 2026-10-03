// Canonical public app directory. Read only linked pages in this namespace.
import { createHash } from 'node:crypto';
import { makeResource } from '../model.mjs';
import { slug } from './http.mjs';
export const DIRECTORY = 'https://wiki.tari.com/resources:app_directory:start';
const BASE = 'https://wiki.tari.com/resources:app_directory:';
export const source = {
  id: 'tari-wiki-apps', name: 'Tari Wiki Community Application Directory', kind: 'wiki',
  canonicalUrl: DIRECTORY, native: true,
  ingestion: 'Public Markdown directory and linked app pages; content SHA-256 revision; hourly while the hub server runs',
  note: 'Community-maintained facts, not an endorsement or verification of app behavior. Forum-only projects remain supplemental.',
};
const aliases = { soooon_fun: 'sooon-fun', tari_market: 'tari-market-0-21-a-tari-concept',
  labyrinthos: 'labyrinthos', sapient: 'sapient', tari_universe: 'tari-universe',
  tariorg: 'tariorg', caravel_labs: 'caravel-labs', shadowtix: 'shadowtix', ootle_playground: 'tari-ootle-playground' };
export async function readMarkdown(url) {
  const res = await fetch(`${url}?do=export_raw`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Wiki HTTP ${res.status}`);
  const text = await res.text();
  if (!/^#\s+\S/m.test(text) || /<!doctype|<html[\s>]/i.test(text)) throw new Error('Wiki did not return Markdown');
  return text;
}
export function parseDirectory(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*\|\s*\[([^\]]+)\]\(\.\/([a-z0-9_-]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|/i);
    if (m && !rows.some(x => x.page === m[2])) rows.push({ title: m[1], page: m[2], status: m[3].trim(), summary: m[4].trim() });
  }
  if (!rows.length) throw new Error('Wiki directory has no recognized app rows; retaining last good snapshot');
  return rows;
}
function safeUrl(value) {
  const match = value?.match(/https?:\/\/[^\s<>\])]+/);
  return match?.[0] || null;
}
export function parseApp(row, text, directoryText) {
  const field = label => {
    const line = text.split('\n').find(l => l.replace(/\*\*/g, '').toLowerCase().startsWith(`${label.toLowerCase()}:`));
    return line?.replace(/\*\*/g, '').slice(label.length + 1).trim() || null;
  };
  const summary = field('Short Description');
  if (!summary) throw new Error(`Wiki app ${row.page} has no description; retaining last good snapshot`);
  const url = `${BASE}${row.page}`;
  const owner = field('Powered by');
  return makeResource({
    id: `tari-ootle:app:${aliases[row.page] || slug(row.page)}`, type: 'app', ecosystem: 'tari-ootle',
    title: text.match(/^#\s+(.+)$/m)?.[1].trim() || row.title,
    summary: [summary, field('Project Status')].filter(Boolean).join(' '),
    category: field('Category'), sourceUrl: url, docsUrl: url,
    demoUrl: safeUrl(field('Website')), repoUrl: safeUrl(field('Github')),
    network: field('Testnet') && /esmeralda/i.test(field('Testnet')) ? 'Ootle testnet (Esmeralda)' : row.status,
    readiness: 'conceptual', // A directory listing does not establish that an app runs.
    tags: ['ootle', 'community-app', row.status.toLowerCase(), ...(field('Category') || '').toLowerCase().split(/\s*\/\s*/)].filter(Boolean),
    creator: owner ? { name: owner, url: null } : null,
    attribution: 'Adapted from Tari Wiki Community Application Directory (CC BY-SA 4.0 unless otherwise stated).',
    sourceId: source.id, sourceName: source.name, upstreamId: row.page,
    upstreamRevision: createHash('sha256').update(directoryText + '\n' + text).digest('hex'),
    sourceUpdatedAt: null, freshness: 'current', verification: 'source-attested', tariCompatible: null,
  });
}
export async function fetchLive({ read = readMarkdown } = {}) {
  const directory = await read(DIRECTORY);
  const rows = parseDirectory(directory);
  // Bound concurrency. Any incomplete page rejects the snapshot instead of erasing facts.
  const records = [];
  for (let i = 0; i < rows.length; i += 3) {
    records.push(...await Promise.all(rows.slice(i, i + 3).map(async row => parseApp(row, await read(`${BASE}${row.page}`), directory))));
  }
  return { records };
}
