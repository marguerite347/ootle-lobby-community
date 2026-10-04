import {useEffect, useState} from 'react';
import {api, type Resource} from '../api';
import ProjectCard from './ProjectCard';
import {COMMUNITY_REPOSITORY,projectEditUrl,useCommunityContent} from './CommunityContent';
import './CommunityContent.css';
import ContestProjectDates, {newestPublishedFirst} from './ContestProjectDates';
import {useContestMetrics} from './ContestProjectMetrics';

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
    <div className="section-head project-section-heading"><div><h2>{creatorId ? 'Contest portfolio' : 'September Submissions'}</h2><p>{creatorId ? 'Newest submissions first. Explore the builds and meet their creators on the Tari forum.' : 'General Submissions · Community builds on the Ootle.'}</p></div><div className="contest-community-links"><a className="more" href={SEPTEMBER_THREAD} target="_blank" rel="noreferrer">All entries on the forum</a><a href={`${COMMUNITY_REPOSITORY}/pulls`} target="_blank" rel="noreferrer">Community edits</a></div></div>
    {error ? <p role="alert">Contest projects could not load. Refresh to retry.</p> : <div className="grid">{sortedEntries.map(entry => <ProjectCard key={entry.id} resource={entry} sourceUrl={entry.contest?.sourceUrl || SEPTEMBER_THREAD} creator={entry.creator?.name || 'Community creator'} summary={entry.summary || ""} repoUrl={entry.repoUrl} metrics={metrics[entry.id]} technologies={community[entry.id]?.technologies}
      dates={<ContestProjectDates entry={entry} metrics={metrics[entry.id]}/>}
      actions={<><a href={entry.contest?.sourceUrl || SEPTEMBER_THREAD} target="_blank" rel="noreferrer">See the creator’s post</a><a className="suggest-project-edit" href={projectEditUrl(entry.id)} target="_blank" rel="noreferrer" aria-label={`Suggest an edit to ${entry.title}`}>Suggest an edit</a></>}/>
    )}</div>}
  </section>;
}
