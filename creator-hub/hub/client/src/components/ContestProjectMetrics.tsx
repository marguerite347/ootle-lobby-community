import {useEffect, useState} from 'react';
import './ContestProjectMetrics.css';

type Count = {count: number | null; url: string; checkedAt: string | null};
export type ProjectMetrics = {github: (Count & {pushedAt?: string | null; activityUrl?: string}) | null; forum: Count & {publishedAt?: string | null; updatedAt?: string | null; updateUrl?: string}};
type Metrics = Record<string, ProjectMetrics>;

export function useContestMetrics(endpoint = '/api/contests/september-2026/metrics') {
  const [metrics, setMetrics] = useState<Metrics>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, {signal: controller.signal})
      .then(response => {
        if (!response.ok) throw new Error('Metrics unavailable');
        return response.json();
      })
      .then(result => setMetrics(result.items))
      .catch(() => { /* An unavailable count stays unknown, never zero. */ });
    return () => controller.abort();
  }, [endpoint]);
  return metrics;
}

function CountBadge({metric, kind, unavailable}: {metric?: Count | null; kind: 'github' | 'forum'; unavailable: string}) {
  const count = metric?.count;
  const description = kind === 'github'
    ? `GitHub ${count === 1 ? 'star' : 'stars'}`
    : `${count === 1 ? 'comment' : 'comments'} in this project’s discussion on the Tari forum`;
  const label = count == null ? unavailable : `${count.toLocaleString()} ${description}`;
  const title = metric?.checkedAt ? `${label} · Checked ${new Date(metric.checkedAt).toLocaleString()}` : label;
  const icon = kind === 'github'
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.6l6.3-.9Z"/></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H4l1.3-4A8 8 0 1 1 20 11.5Z"/></svg>;
  const content = <>{icon}<span>{count == null ? '—' : count.toLocaleString()}</span></>;
  return metric?.url
    ? <a className="contest-count" href={metric.url} target="_blank" rel="noreferrer" aria-label={label} title={title}>{content}</a>
    : <span className="contest-count" aria-label={label} title={title}>{content}</span>;
}

export default function ContestProjectMetrics({value}: {value?: ProjectMetrics}) {
  return <div className="contest-counts">
    <CountBadge metric={value?.github} kind="github" unavailable={value?.github === null ? 'No GitHub repository for this project' : 'GitHub star count unavailable'}/>
    <CountBadge metric={value?.forum} kind="forum" unavailable="Tari forum comment count unavailable"/>
  </div>;
}
