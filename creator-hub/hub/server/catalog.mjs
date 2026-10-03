import {withGenreReferences} from './genreReferences.mjs';
import {learningCategories, categoriesFor, learningSkills} from './learningCategories.mjs';
import {insightSource} from './creatorIdeas.mjs';
import {monitoredSources} from './sourceMonitoring.mjs';
import {withContestEntries} from './contestEntries.mjs';
import {createCommunityLearning} from './communityLearning.mjs';
const communityLearning=createCommunityLearning();
import { listUploads, builtins } from './assets.mjs';
// Catalog service: loads the ingested snapshot (runtime cache if present, else the
// committed seed), builds a rebuildable in-memory search projection, and resolves
// onboarding recommendations. Reviewed genre references join the read projection;
// source snapshots and creator annotations are never rewritten by that overlay.

import { readFileSync, existsSync, watchFile } from 'node:fs';
import { ECOSYSTEMS } from './model.mjs';
import { paths, pathById } from './onboarding.mjs';
import { computePopularity } from './popularity.mjs';
import { LEARN_TOPICS } from './connectors/ootleEducation.mjs';
import { resolveRelated } from './relationships.mjs';
import * as engagement from './engagement.mjs';
import * as previews from './previews.mjs';
import { seedCatalog, cacheCatalog } from './paths.mjs';
import { presentStarter, RECOMMENDED_STARTER_LIMIT } from '../shared/starterShelf.mjs';

let snapshot = { records: [], sources: [], generatedAt: null };
let byId = new Map();

function activePath() {
  return existsSync(cacheCatalog) ? cacheCatalog : seedCatalog;
}

export function load() {
  const p = activePath();
  if (!existsSync(p)) {
    snapshot = { records: [], sources: [], generatedAt: null, note: 'no snapshot; run npm run ingest' };
    byId = new Map();
    return snapshot;
  }
  const candidate = JSON.parse(readFileSync(p, 'utf8'));
  if (!Array.isArray(candidate?.records) || !Array.isArray(candidate?.sources) || candidate.records.some(record => !record || typeof record.id !== 'string')) {
    throw new Error('Invalid catalog snapshot');
  }
  const candidateIndex = new Map(candidate.records.map(record => [record.id, record]));
  snapshot = candidate;
  byId = candidateIndex;
  previews.load();
  return snapshot;
}

// Hot-reload the catalog when a fresh ingest rewrites the cache.
export function watchCatalog() {
  // Watching path metadata survives atomic renames and seed -> cache transitions.
  for (const p of [seedCatalog, cacheCatalog]) {
    watchFile(p, { persistent: false, interval: 1000 }, () => { try { load(); } catch (e) { console.warn('[catalog] kept last good snapshot:', e.message); } });
  }
  // watchFile establishes its initial stat asynchronously. A cache written during
  // that baseline window may not emit a change, so reconcile once after startup.
  const startupReconcile = setTimeout(() => {
    try { load(); } catch (error) { console.warn('[catalog] kept last good snapshot:', error.message); }
  }, 1100);
  startupReconcile.unref();
  previews.watchPreviews();
}

export function meta() {
  return { generatedAt: snapshot.generatedAt, records: all().length, sources: sources() };
}

// Attach live engagement counts + the computed popularity signal to a record.
export function decorate(r) {
  if (!r) return r;
  const eng = engagement.counts('resource', r.id);
  const popularity = computePopularity(r.signals, { stars: eng.stars, comments: eng.comments });
  // A real webpage-capture clip (or generated cover) for apps without an ingested preview.
  const preview = previews.previewFor(r);
  return { ...r, engagement: eng, popularity, preview };
}

// Typed learning<->template relationships for a record (CH-022), resolved against
// the current catalog so removed/unknown targets never produce a dangling link.
export function related(id) {
  return resolveRelated(id, (x) => byId.get(x) || null);
}

export function get(id) {
  const r = all().find(record=>record.id===id || record.referenceId===id);
  if (!r) return null;
  return { ...decorate(r), related: related(id) };
}

export function all() {
  return withContestEntries(withGenreReferences([...snapshot.records,...listUploads(),...builtins,...communityLearning.list()]));
}

function matchText(r, q) {
  if (!q) return true;
  const hay = [
    r.title, r.summary, r.category, r.creator?.name, r.ecosystem,
    ...(r.tags || []),
  ].filter(Boolean).join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every((tok) => hay.includes(tok));
}

export function search(params = {}) {
  const { q, type, ecosystem, readiness, native, tag, verified, sort, topic, level, format } = params;
  let out = all().filter((r) => {
    if (type && r.type !== type) return false;
    if (ecosystem && r.ecosystem !== ecosystem) return false;
    if (readiness && r.readiness !== readiness) return false;
    if (topic && r.topic !== topic) return false;
    if (level && r.level !== level) return false;
    if (format && r.format !== format) return false;
    if (native === true && !r.native) return false;
    if (native === false && r.native) return false;
    if (verified === true && r.verification === 'unverified') return false;
    if (tag && !(r.tags || []).map((t) => t.toLowerCase()).includes(String(tag).toLowerCase())) return false;
    return matchText(r, q);
  }).map(decorate);

  if (sort === 'popular') {
    out = out.sort((a, b) => (b.popularity.score ?? -1) - (a.popularity.score ?? -1) || a.title.localeCompare(b.title));
  } else {
    // Default: native Ootle first, then by ecosystem, then title.
    out = out.sort((a, b) => (Number(b.native) - Number(a.native)) || a.ecosystem.localeCompare(b.ecosystem) || a.title.localeCompare(b.title));
  }
  return out;
}

export function facets(records = all()) {
  const count = (key, fn) => {
    const map = {};
    for (const r of records) {
      const v = fn(r);
      const list = Array.isArray(v) ? v : [v];
      for (const item of list) {
        if (item == null) continue;
        map[item] = (map[item] || 0) + 1;
      }
    }
    return map;
  };
  return {
    type: count('type', (r) => r.type),
    ecosystem: count('ecosystem', (r) => r.ecosystem),
    readiness: count('readiness', (r) => r.readiness),
    level: count('level', (r) => r.level),
    format: count('format', (r) => r.format),
    topic: count('topic', (r) => ((r.topics && r.topics.length) ? r.topics : (r.topic ? [r.topic] : []))),
    tag: count('tag', (r) => r.tags),
  };
}

// Learn section view: learn-type records grouped by creator-goal topic, plus
// references (learn records without a goal topic, e.g. external collections).
//
// Topic is a DISPLAY selector, not a server-side filter: grouping ignores `topic` so
// every bucket's availability stays accurate when one topic is selected in the UI. A
// record may belong to several goals (r.topics), so it can appear in multiple buckets.
export function learn(params = {}) {
  const { topic, ...rest } = params;
  const guides = search({ ...rest, type: 'learn' }).map(r=>({...r,learningKind:'guide'}));
  const skills = learningSkills().filter(r =>
    matchText(r, rest.q) &&
    ['ecosystem','level','format','readiness'].every(k=>!rest[k] || r[k]===rest[k]) &&
    (typeof rest.native !== 'boolean' || r.native === rest.native) &&
    (!rest.verified || r.verification !== 'unverified') &&
    (!rest.tag || r.tags.some(tag=>tag.toLowerCase()===String(rest.tag).toLowerCase()))
  );
  const items = [...guides,...skills];
  const byTopic = Object.fromEntries(LEARN_TOPICS.map((t) => [t.id, []]));
  const other = [];
  for (const r of items) {
    const goals = (r.topics && r.topics.length) ? r.topics : (r.topic ? [r.topic] : []);
    const placed = goals.filter((g) => byTopic[g]);
    if (placed.length) placed.forEach((g) => byTopic[g].push(r));
    else other.push(r);
  }
  return {
    generatedAt: snapshot.generatedAt,
    count: items.length,
    categories: learningCategories.map(({pattern,...category})=>({...category,items:items.filter(r=>categoriesFor(r).includes(category.id))})),
    activeTopic: topic || null,
    topics: LEARN_TOPICS.map((t) => ({ ...t, items: byTopic[t.id] })),
    other,
    facets: {...facets(items),learningKind:{guide:guides.length,skill:skills.length}},
  };
}

export function learnTopics() {
  return LEARN_TOPICS;
}

// Curated collections that map onto real ingested records.
export function collections() {
  const defs = [
    { id: 'native-ootle-starters', title: 'Native Ootle starters', description: 'Official Rust/WASM template starters for building on Ootle testnet.', query: { ecosystem: 'tari-ootle', type: 'starter' } },
    { id: 'ootle-testnet-apps', title: 'Live on Ootle testnet', description: 'Community-built apps currently listed in the Ootle testnet apps directory.', query: { ecosystem: 'tari-ootle', type: 'app' } },
    { id: 'nocode-games', title: 'No-code & 2D game starters', description: 'GDevelop example projects to Riff in a visual editor.', query: { ecosystem: 'gdevelop', type: 'starter' }, starterDimension: '2d' },
    { id: 'voxel-sandbox', title: 'Voxel & sandbox', description: 'Luanti games and mods from ContentDB.', query: { ecosystem: 'luanti' } },
  ];
  return defs.map((definition) => {
    const { starterDimension, ...collection } = definition;
    const matched = matchingStarters(definition.query, starterDimension);
    return { ...collection, count: matched.length, items: matched.slice(0, 6) };
  });
}

export function sources() {
  const monitors = monitoredSources();
  const imported = (snapshot.sources || []).map(source => {
    if (source.kind !== 'github-list') return source;
    const monitor = monitors.find(item => item.canonicalUrl.toLowerCase() === source.canonicalUrl.toLowerCase());
    return {...source, monitoring: monitor?.monitoring, note: [source.note, monitor?.note].filter(Boolean).join(' ')};
  });
  const importedUrls = new Set(imported.filter(source => source.kind === 'github-list').map(source => source.canonicalUrl.toLowerCase()));
  return [...imported, ...monitors.filter(source => !importedUrls.has(source.canonicalUrl.toLowerCase())), insightSource()];
}

function matchingStarters(query, starterDimension) {
  const matched = search(query || {});
  if (!starterDimension) return matched;
  return matched
    .map((record) => presentStarter(record))
    .filter((record) => record.starterDimension === starterDimension);
}

function preferredStarter(path) {
  if (!path.preferredStarterId) return null;
  const presented = presentStarter(get(path.preferredStarterId));
  if (!presented) return null;
  if (path.starterDimension && presented.starterDimension !== path.starterDimension) return null;
  return presented;
}

// Resolve an onboarding path into concrete recommendations from the live catalog.
export function onboarding(id) {
  if (!id) {
    return paths.map((p) => ({ id: p.id, goal: p.goal, audience: p.audience, ecosystem: p.ecosystem, blurb: p.blurb, external: !!p.external }));
  }
  const p = pathById(id);
  if (!p) return null;
  const recommended = matchingStarters(p.recommend || {}, p.starterDimension).slice(0, RECOMMENDED_STARTER_LIMIT);
  const preferred = preferredStarter(p);
  const alsoExplore = p.alsoExplore ? search(p.alsoExplore).slice(0, 6) : [];
  const learn = p.learnTags ? search({ tag: p.learnTags[0] }).filter((r) => r.type === 'learn').slice(0, 4) : [];
  return {
    ...p,
    ecosystemLabel: ECOSYSTEMS[p.ecosystem]?.label || p.ecosystem,
    preferred,
    recommended,
    alsoExplore,
    learn,
  };
}
