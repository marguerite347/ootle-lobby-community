import {readFileSync} from 'node:fs';
import {makeResource} from './model.mjs';

const libraryFile = new URL('../data/genre-reference-games.json', import.meta.url);
const SOURCE_ID = 'genre-reference-library';
const REFERENCE_NOTICE = 'Creative inspiration for internal experiments. This listing provides study notes and source links.';

export function canonicalReferenceUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    url.protocol = 'https:';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
    }
    // Steam's title slug and locale are presentation, not application identity.
    const steamApp = url.hostname === 'store.steampowered.com' && url.pathname.match(/^\/app\/(\d+)(?:\/|$)/);
    if (steamApp) { url.pathname = `/app/${steamApp[1]}`; url.search = ''; }
    else url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    url.searchParams.sort();
    return url.toString();
  } catch { return null; }
}

function validateEntry(entry) {
  if (!entry || typeof entry.id !== 'string' || !/^[a-z0-9][a-z0-9:_-]{0,159}$/.test(entry.id)) throw new Error('Genre reference needs a stable id');
  for (const key of ['title', 'summary', 'lastVerifiedAt']) {
    if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`Genre reference ${entry.id} needs ${key}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(entry.lastVerifiedAt) || !Number.isFinite(Date.parse(entry.lastVerifiedAt))) throw new Error(`Genre reference ${entry.id} needs a verification date`);
  if (typeof entry.sourceUrl !== 'string' || !entry.sourceUrl.startsWith('https://') || !canonicalReferenceUrl(entry.sourceUrl)) throw new Error(`Genre reference ${entry.id} needs an official HTTPS source URL`);
  if (!Array.isArray(entry.genres) || !entry.genres.length || entry.genres.some(genre => typeof genre !== 'string' || !genre.trim())) throw new Error(`Genre reference ${entry.id} needs genres`);
  for (const key of ['tags', 'studyFocus', 'evidenceUrls']) {
    if (entry[key] !== undefined && (!Array.isArray(entry[key]) || entry[key].some(value => typeof value !== 'string'))) throw new Error(`Genre reference ${entry.id} has invalid ${key}`);
  }
  if (entry.evidenceUrls?.some(url => !url.startsWith('https://') || !canonicalReferenceUrl(url))) throw new Error(`Genre reference ${entry.id} has unsafe evidence URLs`);
}

export function normalizeGenreReference(entry) {
  validateEntry(entry);
  const resource = makeResource({
    ...entry,
    type: 'learn', ecosystem: 'creative', category: 'Genre reference games',
    topic: 'understand', format: 'reference', readiness: 'conceptual',
    summary: `${entry.summary}\n\n${REFERENCE_NOTICE}`,
    tags: ['genre-reference', 'reference-only', 'commercial', ...entry.genres, ...(entry.tags || [])],
    sourceId: SOURCE_ID, sourceName: 'Curated genre reference games',
    fetchedAt: entry.lastVerifiedAt, lastVerifiedAt: entry.lastVerifiedAt,
    sourceUpdatedAt: null, freshness: 'provisional', verification: 'source-attested',
    license: entry.license || 'Proprietary; reference only',
    access: entry.access || 'Commercial game; purchase or platform access may be required. No purchase is authorized by this listing.',
    setupHint: 'Start from the linked game, explore the mechanics you want, and build a playable experiment with your available engine and materials.',
    repoUrl: null, demoUrl: null, network: null, tariCompatible: null,
    compatibility: [], signals: {}, preview: null,
  });
  return {...resource, successEvidence: entry.successEvidence ?? null, editorialNote: entry.editorialNote ?? null, referenceOnly: true, editable: false, openSource: false, genres: [...entry.genres], studyFocus: [...(entry.studyFocus || [])], evidenceUrls: [...(entry.evidenceUrls || [entry.sourceUrl])]};
}

export function loadGenreReferences(file = libraryFile) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(data?.records)) throw new Error('Genre reference library needs a records array');
  return data.records.map(normalizeGenreReference);
}

/** Add reviewed records to the read projection; never rewrite the cached source. */
export function withGenreReferences(records, references = loadGenreReferences()) {
  const result = [...records];
  const byId = new Map(records.map((record, index) => [record.id, index]));
  const byUrl = new Map();
  records.forEach((record, index) => {
    const url = canonicalReferenceUrl(record.sourceUrl);
    if (url && !byUrl.has(url)) byUrl.set(url, index);
  });
  for (const reference of references) {
    const canonicalUrl = canonicalReferenceUrl(reference.sourceUrl);
    const index = byId.get(reference.id) ?? byUrl.get(canonicalUrl);
    if (index === undefined) {
      byId.set(reference.id, result.length);
      if (canonicalUrl) byUrl.set(canonicalUrl, result.length);
      result.push(reference);
      continue;
    }
    byId.set(reference.id, index);
    if (canonicalUrl) byUrl.set(canonicalUrl, index);
    const existing = result[index];
    result[index] = {
      ...existing, ...reference, id: existing.id,
      editorial: existing.editorial ?? reference.editorial,
      preview: existing.preview ?? reference.preview,
      tags: [...new Set([...(existing.tags || []), ...reference.tags])].filter(tag => !['open-source', 'editable', 'starter', 'remixable'].includes(tag.toLowerCase())),
      referenceId: reference.id,
    };
  }
  return result;
}
