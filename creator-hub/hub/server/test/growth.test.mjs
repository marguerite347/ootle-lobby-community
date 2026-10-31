import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSeries, growthSummary } from '../growth.mjs';
const record = { value: 3, fetched_at: '2026-09-01T00:00:00Z', quality_state: 'current' };
test('old observations are stale despite a freshly generated summary', () => {
  assert.equal(buildSeries('', [record], { freshness_threshold_hours: 30 }, Date.parse('2026-09-04')).latest.quality, 'stale');
});
test('fetch time alone is not proof of current source data', () => {
  assert.equal(buildSeries('', [record], {}, Date.parse(record.fetched_at)).latest.quality, 'provisional');
});
test('failed observations remain failed and unknown', () => {
  const series = buildSeries('', [{...record, value: null, quality_state: 'failed'}]);
  assert.equal(series.latest.quality, 'failed');
  assert.equal(series.latest.value, null);
});
const bundle = {registry:{metrics:[{id:'tari.forum.active_users.weekly',name:'Weekly active accounts',unit:'accounts'}]}, targets:{targets:[{metric_id:'tari.forum.active_users.weekly',unit:'posters',target_value:100}]}, observations:{'tari.forum.active_users.weekly':[record]}};
test('summary loads a supplied registry and observations without private workspace files', () => {
  const summary = growthSummary(bundle);
  assert.equal(summary.metrics.length, 1);
  assert.equal(summary.metrics[0].series[0].latest.value, 3);
});

test('active accounts are not paced against a posters target', () => {
  const metric = growthSummary(bundle).metrics.find(entry => entry.id === 'tari.forum.active_users.weekly');
  assert.equal(metric.unit, 'accounts');
  for (const series of metric.series) {
    assert.equal(series.target, null);
    assert.equal(series.pacingPct, null);
  }
});

test('source failure retains value with original timestamp and separate attempt', () => {
  const failed = {...record, fetched_at: '2026-09-02T00:00:00Z', value: null, quality_state: 'failed', note: 'HTTP 503'};
  const series = buildSeries('', [record, failed]);
  assert.equal(series.latest.value, 3);
  assert.equal(series.latest.fetchedAt, record.fetched_at);
  assert.equal(series.latest.lastAttemptAt, failed.fetched_at);
  assert.equal(series.latest.quality, 'failed');
  assert.equal(series.latest.retained, true);
  assert.equal(series.deltaPct, null);
});
