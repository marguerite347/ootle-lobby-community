// Growth metrics summary for the DW-016 dashboard page.
// Reads registry.json, targets.json and the versioned observation store
// (metrics/observations/*.jsonl) and returns a reviewable payload.
// Read-only and dependency-free; no caching (local, low volume).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import { createCloudReader } from './growthCloud.mjs';

const METRICS_ROOT = fileURLToPath(new URL('../../../metrics/', import.meta.url));
const OBSERVATIONS_DIR = path.join(METRICS_ROOT, 'observations');

const fail = (status, message) => Object.assign(new Error(message), { status });

function loadJson(fileName) {
  try {
    return JSON.parse(readFileSync(path.join(METRICS_ROOT, fileName), 'utf8'));
  } catch {
    return null;
  }
}

export function observationsFor(metricId) {
  const file = path.join(OBSERVATIONS_DIR, `${metricId}.jsonl`);
  try {
    const lines = readFileSync(file, 'utf8').split('\n').filter((line) => line.trim());
    return lines.map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function compactValue(value) {
  if (Array.isArray(value)) {
    if (value.length <= 6) return value.join(',');
    return `${value.slice(0, 5).join(',')},…(+${value.length - 5})`;
  }
  const text = String(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

function dimensionLabel(record) {
  const dimensions = record.dimensions || {};
  return Object.entries(dimensions)
    .map(([key, value]) => `${key}=${compactValue(value)}`)
    .join(', ');
}

export function buildSeries(label, records, metric = {}, now = Date.now()) {
  records = [...records].sort((a, b) => String(a.fetched_at).localeCompare(String(b.fetched_at)));
  const attempt = records.at(-1);
  const lastGood = records.findLast(record => typeof record.value === 'number' && ['current', 'provisional', 'stale'].includes(record.quality_state));
  const failed = attempt && ['failed', 'unavailable'].includes(attempt.quality_state);
  const latest = failed && lastGood ? lastGood : attempt;
  const previous = records.length >= 2 ? records[records.length - 2] : null;
  let quality = failed ? attempt.quality_state : latest?.quality_state;
  if (latest && ["current", "provisional"].includes(quality)) {
    const observedAt = Date.parse(latest.source_updated_at || latest.fetched_at);
    if (Number.isFinite(observedAt) && metric.freshness_threshold_hours && now - observedAt > metric.freshness_threshold_hours * 3600000) quality = "stale";
    else if (!latest.source_updated_at && quality === "current") quality = "provisional";
  }
  const deltaPct =
    !failed && previous && latest && previous.value !== null && latest.value !== null && previous.value !== 0
      ? ((latest.value - previous.value) / previous.value) * 100
      : null;
  const spark = records
    .map((record) => record.value)
    .filter((value) => typeof value === 'number')
    .slice(-12);
  return {
    label: label || '',
    latest:
      latest
        ? {
            value: latest.value ?? null,
            period: latest.period_start && latest.period_end ? `${latest.period_start}..${latest.period_end}` : null,
            quality,
            fetchedAt: latest.fetched_at,
            sourceUpdatedAt: latest.source_updated_at ?? null,
            lastAttemptAt: attempt.fetched_at,
            error: failed ? attempt.note : null,
            retained: Boolean(failed && lastGood),
          }
        : null,
    deltaPct: deltaPct === null ? null : Math.round(deltaPct * 10) / 10,
    spark,
  };
}

export function growthSummary(bundle = null) {
  const registry = bundle?.registry ?? loadJson('registry.json');
  const targetsFile = bundle?.targets ?? loadJson('targets.json');
  if (!registry) throw fail(500, 'metrics registry unavailable');
  const targetsByMetric = new Map(
    (targetsFile?.targets || []).map((entry) => [entry.metric_id, entry]),
  );
  const builtAt = new Date().toISOString();

  const metrics = [];
  for (const metric of registry.metrics) {
    const records = (bundle ? bundle.observations[metric.id] ?? [] : observationsFor(metric.id)).sort((a, b) => String(a.fetched_at).localeCompare(String(b.fetched_at)));
    const bySeries = new Map();
    for (const record of records) {
      const label = JSON.stringify(Object.entries(record.dimensions || {}).sort(([a], [b]) => a.localeCompare(b)));
      if (!bySeries.has(label)) bySeries.set(label, []);
      bySeries.get(label).push(record);
    }
    if (bySeries.size > 1 && bySeries.get('[]')?.every(record => ['failed', 'unavailable'].includes(record.quality_state))) bySeries.delete('[]');
    const series = [...bySeries.entries()].map(([label, seriesRecords]) => {
      const failure = records.filter(record => ["failed", "unavailable"].includes(record.quality_state) && !Object.keys(record.dimensions || {}).length).at(-1);
      const latest = seriesRecords.at(-1);
      const effective = failure && latest && failure.fetched_at >= latest.fetched_at && !seriesRecords.includes(failure) ? [...seriesRecords, failure] : seriesRecords;
      const entry = buildSeries(dimensionLabel(seriesRecords[0]), effective, metric);
      const proposedTarget = targetsByMetric.get(metric.id);
      const target = proposedTarget?.unit === metric.unit ? proposedTarget.target_value : null;
      entry.target = target ?? null;
      entry.pacingPct =
        target && entry.latest && typeof entry.latest.value === 'number' ? Math.round((entry.latest.value / target) * 100) : null;
      return entry;
    });
    if (!series.length) {
      series.push({ label: '', latest: null, deltaPct: null, spark: [], target: targetsByMetric.get(metric.id)?.unit === metric.unit ? targetsByMetric.get(metric.id).target_value : null, pacingPct: null });
    }
    metrics.push({
      id: metric.id,
      name: metric.name,
      category: metric.category,
      unit: metric.unit,
      status: metric.status,
      definitionVersion: metric.definition_version,
      trackedBy: metric.tracked_by,
      series,
    });
  }

  return { generatedAt: builtAt, collection: bundle?.collection ?? loadJson('latest-run.json'), metrics };
}

export function createGrowthRouter() {
  const router = express.Router();
  const readCloud = createCloudReader();
  router.get('/summary', async (req, res, next) => {
    try {
      const { bundle, delivery } = await readCloud();
      res.set('Cache-Control', 'no-store').json({ ...growthSummary(bundle), delivery });
    } catch (error) { next(error); }
  });
  return router;
}