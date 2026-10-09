import {safeHref} from '../../../shared/safeLinks.mjs';
import {Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, type Source } from '../api';
import { Spinner, FreshnessBadge, ExternalLink } from '../ui';

export default function Sources() {
  const [monitoring,setMonitoring]=useState<{enabled:boolean;running:boolean;intervalMs:number;nextCheckAt:string|null}|null>(null);
  useEffect(()=>{fetch('/api/source-monitoring').then(r=>r.ok?r.json():Promise.reject()).then(setMonitoring).catch(()=>{});},[]);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  useEffect(() => { api.meta().then((m) => { setSources(m.sources); setGeneratedAt(m.generatedAt); }).catch(() => setSources([])); }, []);

  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Sources & freshness</h1>
          <div className="sub">Where every record comes from, how it is ingested, and when it was last read. Failed ingestion retains the last good record and marks it stale.</div>
        </div>
      </div>
      <p className="sub">Game-resource lists import categorized entries hourly; repository activity checks run every six hours. Neither establishes a verified integration. Envato is a manual licensed source. Automatic checks stop when this server stops.</p>
      <p role="status">{!monitoring?'Schedule status unavailable.':!monitoring.enabled?'GitHub monitoring is disabled in this server process.':monitoring.running?'GitHub source check is running.':`GitHub checks every ${monitoring.intervalMs/3600000} hours. Next check: ${monitoring.nextCheckAt?new Date(monitoring.nextCheckAt).toLocaleString():'pending'}.`}</p>
      {generatedAt && <div className="muted mt8">Snapshot generated {new Date(generatedAt).toLocaleString()}</div>}
      {!sources && <Spinner />}
      <div className="grid mt16">
        {sources?.map((s) => (
          <div className="card" key={s.id}>
            <div className="top">
              <span className={`badge dot ${s.native ? 'native' : 'ext'}`}>{s.native ? 'native Ootle' : 'external'}</span>
              {s.monitoring&&<span className="faint">Check:</span>}<FreshnessBadge value={s.freshness} />
              <span className="badge type">{s.kind}</span>
            </div>
            <h3 style={{ fontSize: 16 }}>{s.name}</h3>
            <p className="summary">{s.ingestion}</p>
            {s.note && <p className="faint" style={{ fontSize: 12 }}>{s.note}</p>}
            {s.monitoring&&<div className="source-watch-detail">
              <p>{s.monitoring.linkCount} README links observed · {s.monitoring.pushedAt?`Repo pushed ${new Date(s.monitoring.pushedAt).toLocaleDateString()}`:'Activity not checked'}</p>
              {s.monitoring.changes?<details><summary>{s.monitoring.changes.added.length} added / {s.monitoring.changes.removed.length} removed at last detected change ({new Date(s.monitoring.changes.checkedAt).toLocaleDateString()})</summary><p>{s.kind==='github-list'?'List entries are indexed automatically. This diff includes navigation links and other items the importer may exclude.':'Discovery candidates, not reviewed or imported resources.'}</p><ul>{s.monitoring.changes.added.slice(0,30).map(url=><li key={url}><ExternalLink href={safeHref(url)}>{url}</ExternalLink></li>)}</ul>{s.monitoring.changes.added.length>30&&<p>First 30 shown; full diff is in the sources API.</p>}</details>:<p>{s.monitoring.baselineAt?'Baseline recorded; no subsequent README change observed yet.':'No baseline yet.'}</p>}
            </div>}
            {s.kind==='github-list'&&<Link to={`/explore?tag=${encodeURIComponent(s.name)}`}>Browse this list’s imported resources →</Link>}
            {s.canonicalUrl.includes('Stanestane/')&&<Link to="/skills?q=game%20design">Browse game design skills →</Link>}
            <div className="foot">
              <span>{s.kind==='github-list'?`${s.recordCount} indexed resources`:s.monitoring?'Upstream monitor':s.kind==='manual'?'Manual review':`${s.recordCount} records`}</span>
              <span>· last ok {s.lastSuccessAt ? new Date(s.lastSuccessAt).toLocaleString() : '—'}</span>
              <ExternalLink href={safeHref(s.canonicalUrl)}><span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>source ↗</span></ExternalLink>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
