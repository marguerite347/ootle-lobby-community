import {safeHref} from '../../../shared/safeLinks.mjs';
import type {Resource} from '../api';
import type {ProjectMetrics} from './ContestProjectMetrics';
import './ContestProjectDates.css';

const dateFormat = new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'});
const timestamp = (date?: string | null) => date ? Date.parse(date) || 0 : 0;

export function projectDates(entry: Resource, metrics?: ProjectMetrics) {
  const publishedAt = metrics?.forum.publishedAt || entry.contest?.publishedAt;
  const updates = [
    {at: metrics?.github?.pushedAt, label: 'GitHub activity', url: metrics?.github?.activityUrl,
      description: 'Latest repository push on GitHub; may include other branches or projects in this repository.'},
    {at: metrics?.forum.updatedAt || entry.contest?.updatedAt, label: 'Updated', url: metrics?.forum.updateUrl || entry.contest?.sourceUrl,
      description: 'Latest edit to the forum submission or a linked creator update.'},
  ].filter(update => timestamp(update.at) > timestamp(publishedAt))
    .sort((first, second) => timestamp(second.at) - timestamp(first.at));
  const latest = updates[0];
  const isDifferentDay = publishedAt && timestamp(publishedAt) && latest?.at
    && new Date(latest.at).toISOString().slice(0, 10) !== new Date(publishedAt).toISOString().slice(0, 10);
  return {publishedAt, latest: isDifferentDay ? latest : null};
}

export function newestPublishedFirst(entries: Resource[], metrics: Record<string, ProjectMetrics>) {
  return [...entries].sort((first, second) =>
    timestamp(projectDates(second, metrics[second.id]).publishedAt) - timestamp(projectDates(first, metrics[first.id]).publishedAt)
    || first.title.localeCompare(second.title));
}

export default function ContestProjectDates({entry, metrics}: {entry: Resource; metrics?: ProjectMetrics}) {
  const {publishedAt, latest} = projectDates(entry, metrics);
  if (!timestamp(publishedAt)) return null;
  return <div className="contest-project-dates">
    <a href={safeHref(entry.contest?.sourceUrl)} target="_blank" rel="noreferrer" title={`Published to the September contest forum · ${publishedAt} (UTC)`}>
      <span>Published</span> <time dateTime={publishedAt!}>{dateFormat.format(new Date(publishedAt!))}</time>
    </a>
    {latest?.at && <a href={safeHref(latest.url)} target="_blank" rel="noreferrer" title={`${latest.description} ${latest.at} (UTC)`}>
      <span>{latest.label}</span> <time dateTime={latest.at}>{dateFormat.format(new Date(latest.at))}</time>
    </a>}
  </div>;
}
