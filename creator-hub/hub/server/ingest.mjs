// Ingestion pipeline: discover -> normalize -> write catalog snapshot.
//
// Runs every connector, collects normalized records plus per-source freshness.
// On a connector failure we RETAIN the last good records for that source from the
// existing snapshot and mark the source stale/failed (CREATOR_HUB.md: failed
// ingestion must retain the last good record and visibly mark stale coverage).
//
// Writes:
//   data/seed/catalog.json   committed snapshot so the hub runs offline/for demo
//   data/cache/catalog.json  runtime snapshot (gitignored) used when present
//
// Usage: node server/ingest.mjs [--seed] [--only=<sourceId,...>]

import { mkdirSync, writeFileSync, readFileSync, existsSync, renameSync } from 'node:fs';
import { connectors as defaultConnectors } from './connectors/index.mjs';
import { makeSource } from './model.mjs';
import { enrichGithub } from './enrich/github.mjs';
import { seedDir, cacheDir, seedCatalog, cacheCatalog } from './paths.mjs';

function loadExisting() {
  for (const p of [cacheCatalog, seedCatalog]) {
    if (existsSync(p)) {
      try { return JSON.parse(readFileSync(p, 'utf8')); } catch { /* ignore */ }
    }
  }
  return { records: [], sources: [] };
}

export async function ingest({ only, connectors = defaultConnectors, enrich = true } = {}) {
  const existing = loadExisting();
  const prevRecordsBySource = new Map();
  for (const r of existing.records || []) {
    const sid = r.provenance?.sourceId;
    if (!sid) continue;
    if (!prevRecordsBySource.has(sid)) prevRecordsBySource.set(sid, []);
    prevRecordsBySource.get(sid).push(r);
  }

  const records = [];
  const sources = [];
  const selected = only ? new Set(only) : null;

  for (const c of connectors) {
    const s = c.source;
    if (selected && !selected.has(s.id)) {
      // keep prior records + source entry untouched
      const prior = prevRecordsBySource.get(s.id) || [];
      records.push(...prior);
      const prevSource = (existing.sources || []).find((x) => x.id === s.id);
      if (prevSource) sources.push(prevSource);
      continue;
    }
    const attemptAt = new Date().toISOString();
    try {
      const { records: recs } = await c.fetchLive();
      // A local curated registry was loaded, not checked against its upstream.
      // Keep editorial review dates intact and never turn a replay into live evidence.
      const curated = s.kind === 'curated';
      records.push(...recs.map((r) => curated
        ? { ...r, provenance: { ...r.provenance, freshness: 'provisional' } }
        : r));
      sources.push(makeSource({
        ...s,
        lastAttemptAt: attemptAt,
        lastSuccessAt: curated ? null : attemptAt,
        freshness: curated ? 'provisional' : 'current',
        note: curated ? 'Local curated snapshot loaded; upstream not checked. See each record for its editorial review date.' : s.note,
        recordCount: recs.length,
      }));
      console.log(`[ingest] ${s.id}: ${recs.length} records (ok)`);
    } catch (e) {
      const prior = prevRecordsBySource.get(s.id) || [];
      // Retain last good, but mark those records stale.
      for (const r of prior) {
        records.push({ ...r, provenance: { ...r.provenance, freshness: 'stale' } });
      }
      const prevSource = (existing.sources || []).find((x) => x.id === s.id);
      sources.push(makeSource({
        ...s,
        lastAttemptAt: attemptAt,
        lastSuccessAt: s.kind === 'curated' ? null : prevSource?.lastSuccessAt || null,
        freshness: prior.length ? 'stale' : 'failed',
        recordCount: prior.length,
        note: `Last attempt failed: ${e.message}`,
      }));
      console.warn(`[ingest] ${s.id}: FAILED (${e.message}); retained ${prior.length} prior records as stale`);
    }
  }

  // Enrich records that point at GitHub repos with real stars/forks/last-push.
  if (enrich) {
    try {
      const gh = await enrichGithub(records);
      console.log(`[ingest] github enrichment: ${gh.fetched}/${gh.repos} repos ok, ${gh.failed} failed`);
    } catch (e) {
      console.warn(`[ingest] github enrichment skipped: ${e.message}`);
    }
  }

  // Wiki is authoritative for overlapping app IDs. Preserve community/editorial
  // data and observed signals, but never retain superseded app links or copy.
  const unique = new Map();
  for (const record of records) {
    const previous = unique.get(record.id);
    if (previous?.provenance.sourceId === 'tari-wiki-apps' && record.provenance.sourceId !== 'tari-wiki-apps') continue;
    if (previous && record.id.startsWith('game-list-resource:')) {
      previous.relationships = [...new Map([...previous.relationships, ...record.relationships].map(link => [link.url, link])).values()];
      previous.tags = [...new Set([...previous.tags, ...record.tags])];
      continue;
    }
    const old = existing.records?.find(r => r.id === record.id);
    unique.set(record.id, {
      ...record,
      editorial: old?.editorial || record.editorial,
      ...(record.provenance.sourceId === 'tari-wiki-apps' ? {
        signals: previous?.signals || old?.signals || record.signals,
        creator: record.creator || previous?.creator || old?.creator || null,
      } : {}),
    });
  }
  for (const s of sources) s.recordCount = [...unique.values()].filter(r => r.provenance.sourceId === s.id).length;
  const snapshot = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    records: [...unique.values()],
    sources,
  };
  return snapshot;
}

export function writeSnapshot(snapshot, { seed = false } = {}) {
  mkdirSync(cacheDir, { recursive: true });
  const output = JSON.stringify(snapshot, null, 2);
  const temp = `${cacheCatalog}.${process.pid}.tmp`;
  writeFileSync(temp, output);
  renameSync(temp, cacheCatalog);
  if (seed) {
    mkdirSync(seedDir, { recursive: true });
    writeFileSync(`${seedCatalog}.${process.pid}.tmp`, output);
    renameSync(`${seedCatalog}.${process.pid}.tmp`, seedCatalog);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const writeSeed = args.includes('--seed');
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',').map((s) => s.trim()) : null;

  const snapshot = await ingest({ only });

  writeSnapshot(snapshot, { seed: writeSeed });
  console.log(`[ingest] wrote ${snapshot.records.length} records${writeSeed ? ' including committed seed' : ''}`);

  const summary = snapshot.sources.map((s) => `${s.id}=${s.recordCount}/${s.freshness}`).join('  ');
  console.log(`[ingest] sources: ${summary}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
