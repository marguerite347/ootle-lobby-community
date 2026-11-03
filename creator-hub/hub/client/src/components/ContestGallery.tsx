import {safeHref} from '../../../shared/safeLinks.mjs';
import {COMMUNITY_REPOSITORY} from './CommunityContent';
import ProjectCard from './ProjectCard';
import {useContestMetrics} from './ContestProjectMetrics';
import './CommunityContent.css';

type Entry={ecosystem?:'tari'|'tari-ootle';slug:string;title:string;summary:string;cardSummary?:string;cardStatus?:string;creator:string;sourceUrl:string;discussionLinks?:{url:string;platform:string}[];repoUrl:string;demoUrl?:string;publishedAt:string;updatedAt:string;technologies:{label:string;sourceUrl:string}[];recording?:{url:string;posterUrl?:string;capturedAt:string;sourceRevision:string;kind:string;credit:string}};
export type ReviewedContest={id:string;title:string;threadUrl:string;checkedAt:string;observedSubmissionPosts:number;entries:Entry[]};
const date=(value:string)=>new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
export function ContestGallery({contest,hasWorkbenchEntries=false,emptyMessage='No entries listed yet.'}:{contest:ReviewedContest;hasWorkbenchEntries?:boolean;emptyMessage?:string}){
  const prefix=contest.id.replace(/-2026$/, '');
  const metrics=useContestMetrics('/api/community-projects/metrics');
  const entries=[...contest.entries].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.slug.localeCompare(b.slug));
  return <>
    {!entries.length ? (hasWorkbenchEntries?null:<p>{emptyMessage}</p>) : <div className="grid">{entries.map(entry=><ProjectCard key={entry.slug} resource={{id:`${prefix}:${entry.slug}`,title:entry.title,ecosystem:entry.ecosystem||'tari-ootle',native:true,preview:entry.recording?{image:entry.recording.posterUrl||null,video:entry.recording.url,source:entry.recording.credit}:null}} sourceUrl={entry.sourceUrl} creator={entry.creator} summary={entry.summary} cardSummary={entry.cardSummary} cardStatus={entry.cardStatus} repoUrl={entry.repoUrl} metrics={metrics[`${prefix}:${entry.slug}`]} technologies={entry.technologies}
      dates={<div className="contest-project-dates"><a href={safeHref(entry.sourceUrl)} target="_blank" rel="noreferrer">Submitted <time dateTime={entry.publishedAt}>{date(entry.publishedAt)}</time></a>{/^https:\/\/github\.com\//.test(entry.repoUrl)&&<a href={safeHref(`${entry.repoUrl.split('/').slice(0,5).join('/')}/activity`)} target="_blank" rel="noreferrer">GitHub activity {metrics[`${prefix}:${entry.slug}`]?.github?.pushedAt?date(metrics[`${prefix}:${entry.slug}`].github!.pushedAt!):'Unavailable'}</a>}</div>}
      caption={entry.recording&&<a className="community-media-caption" href={safeHref(entry.recording.url)} target="_blank" rel="noreferrer">{entry.recording.kind.replaceAll('-',' ')} · Recorded {date(entry.recording.capturedAt)} · {entry.recording.credit}</a>}
      frontActions={<><a href={safeHref(entry.sourceUrl)} target="_blank" rel="noreferrer">Original post</a>{entry.discussionLinks?.map(link=><a key={link.url} href={safeHref(link.url)} target="_blank" rel="noreferrer">Discussion · {link.platform}</a>)}</>}
      actions={<><a href={safeHref(entry.sourceUrl)} target="_blank" rel="noreferrer">See the creator’s post</a><a href={safeHref(entry.repoUrl)} target="_blank" rel="noreferrer">Source code</a>{entry.demoUrl&&<a href={safeHref(entry.demoUrl)} target="_blank" rel="noreferrer">Open project</a>}<a href={safeHref(`${COMMUNITY_REPOSITORY}/edit/main/content/submissions/${contest.id}/${entry.slug}.json`)} target="_blank" rel="noreferrer">Suggest an edit</a></>}/>
    )}</div>}
    <p className="submission-check">Forum checked <time dateTime={contest.checkedAt}>{date(contest.checkedAt)} at {new Date(contest.checkedAt).toISOString().slice(11,16)} UTC</time>{contest.observedSubmissionPosts===0?' · No submission posts at that check.':` · ${contest.observedSubmissionPosts} submission posts at that check.`} <a href={safeHref(contest.threadUrl)} target="_blank" rel="noreferrer">Check the latest</a></p>
  </>;
}
