import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '../ui';
import './Growth.css';

type Series = {
  label: string;
  latest: { value: number | null; period: string | null; quality: string; fetchedAt: string; sourceUpdatedAt?: string; lastAttemptAt?: string; retained?: boolean; error?: string } | null;
  deltaPct: number | null;
  target: number | null;
  pacingPct: number | null;
  spark: number[];
};

type Metric = {
  id: string;
  name: string;
  category: string;
  unit: string;
  status: string;
  trackedBy: string;
  definitionVersion: string;
  series: Series[];
};

type Summary = { generatedAt: string; metrics: Metric[];
  collection?: { completedAt: string; sources: Record<string, { state: string; error?: string }> };
  delivery?: { mode: string; error?: string };
};

const QUALITY_LABEL: Record<string, string> = {
  current: 'current',
  provisional: 'provisional',
  stale: 'stale',
  unavailable: 'unavailable',
  failed: 'failed',
  'no data': 'no data',
};

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString();
}

function formatDelta(deltaPct: number | null): string {
  if (deltaPct === null) return '—';
  return `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`;
}

function formatPacing(pacingPct: number | null): string {
  if (pacingPct === null) return '—';
  return `${pacingPct}%`;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="spark-empty">—</span>;
  const width = 96;
  const height = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 2 - ((value - min) / range) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-label="trend">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function QualityBadge({ quality }: { quality: string }) {
  const className = `badge quality quality-${quality.replace(' ', '-')}`;
  return <span className={className}>{QUALITY_LABEL[quality] ?? quality}</span>;
}

function toplineCard(metrics: Metric[], metricId: string, seriesLabel: string, title: string, unit: string) {
  const metric = metrics.find((entry) => entry.id === metricId);
  const series = (seriesLabel ? metric?.series.find((entry) => entry.label === seriesLabel) : undefined)
    ?? metric?.series.reduce<Series | undefined>((latest, entry) =>
      !latest || (entry.latest?.fetchedAt ?? '') > (latest.latest?.fetchedAt ?? '') ? entry : latest, undefined);
  const value = series?.latest?.value ?? null;
  const target = series?.target ?? null;
  const pacing = series?.pacingPct ?? null;
  return (
    <div className="card topline" key={metricId}>
      <div className="topline-label">{title}</div>
      <div className="topline-value">{formatNumber(value)} <span className="topline-unit">{value !== null ? unit : ''}</span></div>
      <div className="topline-meta">
        {target !== null && <span>Target {formatNumber(target)}</span>}
        {pacing !== null && target !== null && <span className={pacing >= 100 ? 'pacing-hit' : ''}>{formatPacing(pacing)} of target</span>}
        <QualityBadge quality={series?.latest?.quality ?? 'no data'} />
        {value === null && <span className="faint">no data</span>}
      </div>
    </div>
  );
}

export default function Growth() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => fetch('/api/growth/summary')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then((data) => { if (active) { setSummary(data); setError(null); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'unavailable'); });
    refresh();
    const timer = window.setInterval(refresh, 5 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const toplines = useMemo(() => {
    if (!summary) return [];
    return [
      toplineCard(summary.metrics, 'tari.nodes.total', 'confirmation_state=total', 'Nodes (observed)', 'nodes'),
      toplineCard(summary.metrics, 'tari.universe.release_downloads.total', '', 'Universe releases', 'downloads'),
      toplineCard(summary.metrics, 'tari.github.merged_pulls.weekly', '', 'Merged PRs · completed week', 'PRs'),
      toplineCard(summary.metrics, 'tari.forum.active_users.weekly', '', 'Forum weekly actives', 'accounts'),
    ];
  }, [summary]);

  const planned = useMemo(() => summary?.metrics.filter((metric) => metric.status === 'planned') ?? [], [summary]);
  const collecting = useMemo(() => summary?.metrics.filter((metric) => metric.status !== 'planned') ?? [], [summary]);

  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Growth dashboard</h1>
          <div className="sub">
            Source-backed growth metrics for the Ootle ecosystem. Collected from public endpoints; every
            observation is stored with its source and quality state — missing data is unknown, never zero.
          </div>
        </div>
      </div>

      {error && <p className="sub">Dashboard unavailable: {error}. The metrics collector may not have run yet.</p>}
      {!summary && !error && <Spinner />}

      {summary && (
        <>
          <p className="sub">{summary.delivery?.mode === 'cloud' ? 'Cloud feed' : 'Local repository snapshot'} · Refresh schedule: 5 AM and 5 PM America/New_York (runs may be delayed).
            {summary.collection && ` Last collection completed: ${new Date(summary.collection.completedAt).toLocaleString()}.`}
            {summary.delivery?.error && ` Cloud delivery failed: ${summary.delivery.error}. Showing retained data.`}
          </p>
          {summary.collection && Object.entries(summary.collection.sources).filter(([, result]) => result.state === 'failed').map(([source, result]) => <p className="sub" key={source}>{source}: {result.error}</p>)}
          <div className="topline-grid">{toplines}</div>

          {collecting.map((metric) => (
            <div className="card growth-metric" key={metric.id}>
              <div className="growth-metric-head">
                <h3>{metric.name}</h3>
                <div className="growth-metric-tags">
                  <span className="faint">{metric.category}</span>
                  <span className="faint">·</span>
                  <span className="faint">{metric.unit}</span>
                  {metric.trackedBy && <span className="badge type">{metric.trackedBy}</span>}
                </div>
              </div>
              <table className="growth-table">
                <thead>
                  <tr>
                    <th>Series</th>
                    <th>Latest</th>
                    <th>Period</th>
                    <th>vs prev</th>
                    <th>Target</th>
                    <th>Pacing</th>
                    <th>Quality</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {metric.series.map((series) => (
                    <tr key={metric.id + series.label}>
                      <td className="series-label">{series.label || '—'}</td>
                      <td className="series-value">{formatNumber(series.latest?.value ?? null)}
                        {series.latest?.retained && <div className="faint">Last good value</div>}
                        {series.latest?.fetchedAt && <div className="faint">Collected {new Date(series.latest.fetchedAt).toLocaleString()}</div>}
                        {series.latest?.sourceUpdatedAt && <div className="faint">Source updated {new Date(series.latest.sourceUpdatedAt).toLocaleString()}</div>}
                      </td>
                      <td className="faint">{series.latest?.period ?? '—'}</td>
                      <td>{formatDelta(series.deltaPct)}</td>
                      <td>{formatNumber(series.target)}</td>
                      <td className={series.pacingPct !== null && series.pacingPct >= 100 ? 'pacing-hit' : ''}>
                        {formatPacing(series.pacingPct)}
                      </td>
                      <td><QualityBadge quality={series.latest?.quality ?? 'no data'} /></td>
                      <td><Sparkline values={series.spark} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="growth-foot faint">
                <span>{metric.definitionVersion ? `definition v${metric.definitionVersion}` : ''}</span>
                <span>{metric.id}</span>
                <span>{summary.generatedAt ? `summary ${new Date(summary.generatedAt).toLocaleString()}` : ''}</span>
              </div>
            </div>
          ))}

          {planned.length > 0 && (
            <div className="card growth-planned">
              <h3>Planned metrics — not collectable yet</h3>
              <ul>
                {planned.map((metric) => (
                  <li key={metric.id}>
                    <strong>{metric.name}</strong> <span className="faint">({metric.id})</span> — no verified public endpoint for this
                    source yet; the pipeline records it as unavailable rather than zero.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}