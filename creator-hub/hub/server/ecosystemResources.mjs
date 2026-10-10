import {readFileSync} from 'node:fs';
import {makeResource} from './model.mjs';
import {requireLinkHost} from '../shared/safeLinks.mjs';

// Reviewed source references join the existing catalog, never the runtime cache.
export const ecosystemResources = JSON.parse(readFileSync(new URL('../shared/ecosystemResources.json', import.meta.url), 'utf8'));
export function withEcosystemResources(records, additions = ecosystemResources.records) {
  const result = new Map(records.map(record => [record.id, record]));
  const ids = new Set();
  for (const entry of additions) {
    if (ids.has(entry.id) || !/^tari(?:-ootle)?:(component|integration|learn):[a-z0-9-]+$/.test(entry.id)) throw new Error('Invalid ecosystem resource identity');
    ids.add(entry.id);
    requireLinkHost(entry.sourceUrl);
    if (entry.repoUrl) requireLinkHost(entry.repoUrl, 'repository');
    if (entry.preview) {
      requireLinkHost(entry.preview.video, 'recording');
      requireLinkHost(entry.preview.image, 'recording');
      if (!entry.preview.source.startsWith('Source/docs walkthrough')) throw new Error('Reference media must disclose source-only capture');
    }
    for (const post of entry.discussionLinks || []) {
      const url=new URL(post.url);
      if(url.protocol!=='https:' || url.username || url.password) throw new Error('Public discussion permalink required');
    }
    if (entry.demoUrl !== null || entry.verification !== 'source-attested' || entry.readiness !== 'conceptual') throw new Error('Reference listings cannot imply runtime acceptance');
    if (!entry.upstreamRevision || !Number.isFinite(Date.parse(entry.lastCheckedAt))) throw new Error('Missing ecosystem source evidence');
    const resource = makeResource({...entry, summary: `${entry.summary}\n\n${entry.status}.`,
      sourceId: 'reviewed-ecosystem', sourceName: 'Reviewed Tari ecosystem sources',
      upstreamId: entry.repoUrl || entry.sourceUrl, fetchedAt: entry.lastCheckedAt,
      lastVerifiedAt: entry.lastCheckedAt, setupHint: 'Read the source and compatibility requirements. Listing review does not verify runtime behavior.',
      prerequisites: entry.platform ? [entry.platform] : [], topic: entry.type === 'learn' ? 'understand' : null,
      format: entry.type === 'learn' ? 'reference' : null, level: entry.group === 'Advanced' ? 'advanced' : 'intermediate'});
    // Canonical source identity also catches an older connector record with another ID.
    for (const [id, current] of result) if (id !== entry.id && (current.sourceUrl === entry.sourceUrl || (entry.repoUrl && current.repoUrl === entry.repoUrl))) result.delete(id);
    result.set(entry.id, resource);
  }
  return [...result.values()];
}
