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
      if (!/^(Source\/docs walkthrough|Docs walkthrough|Concept overview|App demo|Announcement walkthrough)\b/.test(entry.preview.source)) throw new Error('Reference media must disclose capture scope');
    }
    for (const post of entry.discussionLinks || []) {
      const url=new URL(post.url);
      if(url.protocol!=='https:' || url.username || url.password) throw new Error('Public discussion permalink required');
    }
    if (entry.demoUrl) requireLinkHost(entry.demoUrl, 'demo');
    if (entry.verification !== 'source-attested' || entry.readiness !== 'conceptual') throw new Error('Reference listings cannot imply runtime acceptance');
    const checked = Number.isFinite(Date.parse(entry.lastCheckedAt));
    const attempted = Number.isFinite(Date.parse(entry.lastAttemptAt));
    if (!entry.upstreamRevision || (!checked && !(entry.lastCheckedAt === null && attempted))) throw new Error('Missing ecosystem source evidence');
    const resource = makeResource({...entry, summary: `${entry.summary}\n\n${entry.status}.`,
      sourceId: 'reviewed-ecosystem', sourceName: 'Reviewed Tari ecosystem sources',
      upstreamId: entry.repoUrl || entry.sourceUrl, fetchedAt: entry.lastAttemptAt || entry.lastCheckedAt,
      freshness: checked ? 'current' : 'provisional',
      lastVerifiedAt: entry.lastCheckedAt, setupHint: 'Open the source or guide for setup steps and compatibility requirements.',
      prerequisites: entry.platform ? [entry.platform] : [], topic: entry.type === 'learn' ? 'understand' : null,
      format: entry.type === 'learn' ? 'reference' : null, level: entry.group === 'Advanced' ? 'advanced' : 'intermediate'});
    // Canonical source identity also catches an older connector record with another ID.
    for (const [id, current] of result) if (id !== entry.id && (current.sourceUrl === entry.sourceUrl || (entry.repoUrl && current.repoUrl === entry.repoUrl))) result.delete(id);
    result.set(entry.id, resource);
  }
  return [...result.values()];
}
