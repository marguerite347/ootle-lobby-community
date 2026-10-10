import {readFileSync} from 'node:fs';
import {makeResource} from './model.mjs';
export const contestRegistry = JSON.parse(readFileSync(new URL('../data/contests/september-2026.json', import.meta.url), 'utf8'));
const cardCopy = new Map(contestRegistry.entries.map(entry => {
  const project=JSON.parse(readFileSync(new URL(`../../../content/projects/${entry.id.replace('tari-ootle:app:','')}.json`,import.meta.url),'utf8'));
  return [entry.id,{cardSummary:project.cardSummary,cardStatus:project.cardStatus}];
}));
// A creator may submit multiple distinct projects to the same contest.
const creatorsById = new Map();
for (const entry of contestRegistry.entries) {
  const creator = creatorsById.get(entry.creatorId) || {
    id: entry.creatorId, name: entry.creator,
    bio: 'Public September 2026 contest attribution imported from the Tari forum. This is not a claimed Hub account or a Council endorsement.',
    showWork: true, showActivity: false, projects: [],
  };
  creator.projects = [...new Set([...creator.projects, `/resource/${encodeURIComponent(entry.id)}`, entry.sourceUrl, `https://community.tari.com/u/${entry.creator}`])];
  creatorsById.set(entry.creatorId, creator);
}
export const contestCreators = [...creatorsById.values()];
export function withContestEntries(records) {
  const merged = new Map(records.map(record => [record.id, record]));
  for (const entry of contestRegistry.entries) {
    const current = merged.get(entry.id);
    const resource = current || makeResource({
      id:entry.id, type:'app', ecosystem:'tari-ootle', title:entry.title,
      summary:entry.summary, sourceId:'september-contest-2026', sourceName:'September contest submissions',
      sourceUrl:entry.sourceUrl, sourceUpdatedAt:entry.updatedAt, fetchedAt:contestRegistry.fetchedAt, verification:'source-attested',
      readiness:'conceptual', network:entry.network || 'Ootle testnet (submission-reported)',
      setupHint:'Read the source repository setup and testnet requirements. This imported profile does not deploy or verify the application.',
    });
    merged.set(entry.id, {...resource, ...cardCopy.get(entry.id), repoUrl:entry.repoUrl, demoUrl:entry.demoUrl || resource.demoUrl,
      license:entry.license || resource.license, tags:[...new Set([...(resource.tags||[]),'september-contest-2026'])],
      creator:{name:entry.creator,url:`/creators/${entry.creatorId}`},
      contest:{...entry,checkedAt:contestRegistry.checkedAt,edition:'September 2026',rulesUrl:'https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323',status:'Imported submission; Council review not verified'},
    });
  }
  return [...merged.values()];
}
