import {useRef, useState} from 'react';
import submissions from '../../../../../content/creator-submissions/launch-2026.json';
import {safeHref} from '../../../shared/safeLinks.mjs';
import './CreatorSubmissions.css';

const date = (value: string) => new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric', timeZone:'UTC'});

export default function CreatorSubmissions() {
  const [expanded, setExpanded] = useState(false);
  const section = useRef<HTMLElement>(null);
  function toggle() {
    const returnToHeading = expanded && section.current && section.current.getBoundingClientRect().top < 0;
    setExpanded(value => !value);
    if (returnToHeading) requestAnimationFrame(() => section.current?.scrollIntoView({block:'start'}));
  }
  const entries = expanded ? submissions.entries : submissions.entries.slice(0, 3);
  return <section ref={section} className="creator-submissions" id="creator-submissions" aria-labelledby="creator-submissions-title">
    <div className="creator-submissions-heading"><div>
      <h3 id="creator-submissions-title">Creator <em>submissions.</em></h3>
      <p>Articles, videos and explainers from the launch contest · Oct 29–Nov 12</p>
    </div><a href={submissions.threadUrl} target="_blank" rel="noreferrer">Contest thread</a></div>
    <div className="creator-submissions-list" id="creator-submissions-list">{entries.map(entry => <article key={entry.id}>
      <div className="creator-submission-byline"><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.creator}</a><time dateTime={entry.publishedAt}>{date(entry.publishedAt)}</time></div>
      <div><h4>{entry.title}</h4>{entry.works.length > 0 && <ul>{entry.works.map(work => <li key={work.url}><a href={safeHref(work.url)} target="_blank" rel="noreferrer">{work.title}</a><span>{work.format}</span></li>)}</ul>}{entry.note && <p>{entry.note}</p>}</div>
    </article>)}</div>
    <div className="creator-submissions-footer"><span>Checked {date(submissions.checkedAt)} · Judging stays with the Council.</span><button type="button" aria-expanded={expanded} aria-controls="creator-submissions-list" onClick={toggle}>{expanded ? 'Show less' : `Show all ${submissions.entries.length} creators`}</button></div>
  </section>;
}
