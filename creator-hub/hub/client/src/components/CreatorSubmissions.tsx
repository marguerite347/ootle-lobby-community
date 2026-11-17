import {useRef, useState} from 'react';
import submissions from '../../../../../content/creator-submissions/launch-2026.json';
import {safeHref} from '../../../shared/safeLinks.mjs';
import resources from '../../../shared/ecosystemResources.json';
import {ResourceCardMedia} from '../ui';
import {recordingLabel} from './ProjectCard';
import {Link} from 'react-router-dom';
import './CreatorSubmissions.css';

const date = (value: string) => new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric', timeZone:'UTC'});

export default function CreatorSubmissions({feed = submissions, id = 'creator-submissions', title = 'Creator submissions.', description = 'Articles, videos and explainers from the launch contest · Oct 29–Nov 12', judging = 'Judging stays with the Council.'}: {feed?: typeof submissions; id?: string; title?: string; description?: string; judging?: string} = {}) {
  const [expanded, setExpanded] = useState(false);
  const section = useRef<HTMLElement>(null);
  function toggle() {
    const returnToHeading = expanded && section.current && section.current.getBoundingClientRect().top < 0;
    setExpanded(value => !value);
    if (returnToHeading) requestAnimationFrame(() => section.current?.scrollIntoView({block:'start'}));
  }
  const newest = [...feed.entries].sort((a,b) => Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
  const entries = expanded ? newest : newest.slice(0, 3);
  return <section ref={section} className="creator-submissions" id={id} aria-labelledby={`${id}-title`}>
    <div className="creator-submissions-heading"><div>
      <h3 id={`${id}-title`}>{title === 'Creator submissions.' ? <>Creator <em>submissions.</em></> : title}</h3>
      <p>{description}</p>
    </div><a href={feed.threadUrl} target="_blank" rel="noreferrer">Contest thread</a></div>
    <div className="creator-submissions-list" id={`${id}-list`}>{entries.map(entry => <article key={entry.id}>
      <div className="creator-submission-byline"><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.creator}</a><time dateTime={entry.publishedAt}>{date(entry.publishedAt)}</time></div>
      <div><h4>{entry.title}</h4>{entry.works.length > 0 && <ul>{entry.works.map(work => <li key={work.url}><a href={safeHref(work.url)} target="_blank" rel="noreferrer">{work.title}</a><span>{work.format}</span></li>)}</ul>}{entry.note && <p>{entry.note}</p>}
      <a href={entry.sourceUrl} target="_blank" rel="noreferrer">Original post</a>
      {'discussionLinks' in entry && entry.discussionLinks?.map(link => <span key={link.url}> · <a href={safeHref(link.url)} target="_blank" rel="noreferrer">{link.label}</a></span>)}
      {entry.resourceIds.map(id => resources.records.find(record => record.id === id)).filter(record => !!record).map(record => <div key={record!.id} className="creator-resource" aria-label={record!.title}>
        <ResourceCardMedia r={{...record!,native:record!.ecosystem === 'tari-ootle'}}/>
        <div><h5><Link to={`/resource/${encodeURIComponent(record!.id)}`}>{record!.title}</Link></h5>
          <p>{record!.cardSummary}</p><strong>{record!.cardStatus}</strong>{record!.preview && <> · <span>{recordingLabel(record!.preview.source)}</span></>}
          <details><summary aria-label={`Details about ${record!.title}`}>Details</summary><p>{record!.summary}</p>{record!.preview && <p>{record!.preview.source}</p>}<Link to={`/resource/${encodeURIComponent(record!.id)}`}>Full resource &amp; provenance</Link></details>
        </div>
      </div>)}
      </div>
    </article>)}</div>
    <div className="creator-submissions-footer"><span>Checked {date(feed.checkedAt)} · {judging}</span><button type="button" aria-expanded={expanded} aria-controls={`${id}-list`} onClick={toggle}>{expanded ? 'Show less' : `Show all ${feed.entries.length} creators`}</button></div>
  </section>;
}
