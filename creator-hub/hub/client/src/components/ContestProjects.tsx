import {useEffect, useState} from 'react';
import {api, type Resource} from '../api';
import {MediaThumb} from '../media';
import ProjectTechnology from './ProjectTechnology';
import {COMMUNITY_REPOSITORY,projectEditUrl,useCommunityContent} from './CommunityContent';
import './CommunityContent.css';
import ContestProjectDates, {newestPublishedFirst} from './ContestProjectDates';
import ContestProjectMetrics, {useContestMetrics} from './ContestProjectMetrics';

const SEPTEMBER_THREAD = 'https://community.tari.com/t/september-contest-thread/324';

export default function ContestProjects({creatorId}: {creatorId?: string}) {
  const [entries, setEntries] = useState<Resource[]>([]);
  const [error, setError] = useState(false);
  const metrics = useContestMetrics();
  const community = useCommunityContent();
  useEffect(() => {
    let active = true;
    api.resources({q: 'september-contest-2026'}).then(result => {
      if (active) setEntries(result.items.filter(entry => !creatorId || entry.creator?.url === `/creators/${creatorId}`));
    }).catch(() => {if (active) setError(true);});
    return () => {active = false;};
  }, [creatorId]);
  const sortedEntries = newestPublishedFirst(entries.map(entry => community[entry.id] ? {...entry,title:community[entry.id].title,summary:community[entry.id].summary} : entry), metrics);
  return <section className="section">
    <div className="section-head"><div><h2>{creatorId ? 'Contest portfolio' : 'September Submissions'}</h2><p>{creatorId ? 'Newest submissions first. Explore the builds and meet their creators on the Tari forum.' : 'General Submissions · Community builds on the Ootle.'}</p></div><div className="contest-community-links"><a className="more" href={SEPTEMBER_THREAD} target="_blank" rel="noreferrer">All entries on the forum</a><a href={`${COMMUNITY_REPOSITORY}/pulls`} target="_blank" rel="noreferrer">Community edits</a></div></div>
    {error ? <p role="alert">Contest projects could not load. Refresh to retry.</p> : <div className="grid">{sortedEntries.map(entry => <article className="card contest-project-card" key={entry.id}>
      <div className="contest-project-cover"><MediaThumb r={entry} metrics={<ContestProjectMetrics value={metrics[entry.id]}/>}/><ProjectTechnology resourceId={entry.id} labels={community[entry.id]?.technologies}/></div>
      <h3 className="mt16"><a href={entry.contest?.sourceUrl || SEPTEMBER_THREAD} target="_blank" rel="noreferrer">{entry.title}</a></h3>
      <ContestProjectDates entry={entry} metrics={metrics[entry.id]}/>
      <p>{entry.summary}</p><p className="faint">By {entry.creator?.name}</p>
      <div className="contest-project-actions"><a href={entry.contest?.sourceUrl || SEPTEMBER_THREAD} target="_blank" rel="noreferrer">See the creator’s post</a>
        <a className="suggest-project-edit" href={projectEditUrl(entry.id)} target="_blank" rel="noreferrer" aria-label={`Suggest an edit to ${entry.title}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14Z"/></svg>Suggest an edit</a></div>
    </article>)}</div>}
  </section>;
}
