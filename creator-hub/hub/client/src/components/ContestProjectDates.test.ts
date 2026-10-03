import {expect, it} from 'vitest';
import type {Resource} from '../api';
import {newestPublishedFirst, projectDates} from './ContestProjectDates';
import type {ProjectMetrics} from './ContestProjectMetrics';
const entry = (id: string, publishedAt?: string) => ({id, title: id, contest: {publishedAt}} as Resource);
const metrics = (publishedAt: string, updatedAt: string, pushedAt: string) => ({
  forum: {publishedAt, updatedAt, url: 'https://community.tari.com/t/324/2'}, github: {pushedAt},
} as ProjectMetrics);

it('sorts by submission publication, with unknown dates last and no mutation', () => {
  const entries = [entry('unknown'), entry('older', '2026-09-01'), entry('newer', '2026-09-30')];
  const source = {older: metrics('2026-09-01', '2026-09-01', '2026-10-03')};
  expect(newestPublishedFirst(entries, source).map(value => value.id)).toEqual(['newer', 'older', 'unknown']);
  expect(entries[0].id).toBe('unknown');
});

it('shows the latest actual source with its label, but not a same-day or earlier date', () => {
  const project = entry('one', '2026-09-20T04:00:00Z');
  expect(projectDates(project, metrics('2026-09-20T04:00:00Z', '2026-09-20T19:00:00Z', '2026-09-19')).latest).toBeNull();
  expect(projectDates(project, metrics('2026-09-20', '2026-09-21', '2026-09-22')).latest?.label).toBe('GitHub activity');
  expect(projectDates(project, metrics('2026-09-20', '2026-09-23', '2026-09-22')).latest?.label).toBe('Updated');
  expect(projectDates(entry('unknown'), metrics('invalid', '2026-09-23', '2026-09-22')).latest).toBeNull();
});
