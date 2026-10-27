/// <reference types="vite/client" />
import resources from '../../../shared/ecosystemResources.json';
import september from '../../../data/contests/september-2026.json';

type ProjectReference = {id?: string; resourceIds?: string[]; repoUrl?: string | null; sourceUrl?: string | null};

function sourceIdentity(value?: string | null, repository = false): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    let path = url.pathname.replace(/\/+$/, '').replace(/\.git$/, '');
    // GitHub owner/repository names are case-insensitive; preserve subproject paths.
    if (url.hostname === 'github.com') {
      const parts = path.split('/');
      path = parts.map((part, index) => index <= 2 ? part.toLowerCase() : part).join('/');
    }
    return `${url.origin}${path}${repository ? '' : url.hash}`;
  } catch {
    return null;
  }
}

export function builderResourcesOnly<T extends ProjectReference>(records: T[], showcased: ProjectReference[]): T[] {
  const ids = new Set(showcased.flatMap(project => [project.id, ...(project.resourceIds || [])]).filter(Boolean));
  const sources = new Set(showcased.flatMap(project => [sourceIdentity(project.repoUrl, true), sourceIdentity(project.sourceUrl)]).filter(Boolean));
  return records.filter(record => !ids.has(record.id) &&
    ![sourceIdentity(record.repoUrl, true), sourceIdentity(record.sourceUrl)].some(source => source && sources.has(source)));
}

// These are the same reviewed, deployment-bundled files used by the project galleries.
// Keep all catalog records for discovery/detail pages; only filter homepage placement.
const galleryFiles = import.meta.glob<ProjectReference>([
  '../../../../../content/submissions/*/*.json',
  '../../../../../content/community-projects/*.json',
], {eager: true, import: 'default'});
export const homepageResources = builderResourcesOnly(resources.records, [...september.entries, ...Object.values(galleryFiles)]);
