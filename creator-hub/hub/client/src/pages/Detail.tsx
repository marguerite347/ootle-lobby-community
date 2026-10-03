import ContestSubmission from '../components/ContestSubmission';
import {recordCreatorEvent} from '../creatorAnalytics';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, type Resource } from '../api';
import { readinessLabel, Spinner, EcosystemBadge, ReadinessBadge, VerificationBadge, FreshnessBadge, TariCompatBadge, ExternalLink, PopularityPanel, StarButton, Comments } from '../ui';
import { MediaThumb } from '../media';
import './Detail.css';

export default function Detail() {
  const { id } = useParams();
  const [r, setR] = useState<Resource | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    let active = true;
    setR(null);
    setErr(null);
    api.resource(id).then(value => { if (active) {setR(value);void recordCreatorEvent('resource_open',value.id)} }).catch((e) => { if (active) setErr(e.message); });
    return () => { active = false; };
  }, [id]);

  if (err) return <div className="panel mt24">Resource not found. <Link to="/explore">Back to Explore</Link></div>;
  if (!r) return <Spinner />;

  const links: [string, string | null][] = [
    ['Website / demo', r.demoUrl || r.sourceUrl],
    ['Source repo', r.repoUrl],
    ['Docs / guide', r.docsUrl],
    ['Directory / source', r.provenance.upstreamUrl || null],
  ];

  return (
    <article className="resource-detail">
      <div className="resource-breadcrumb"><Link className="muted" to="/explore">← Discover</Link></div>
      <header className="resource-header">
      <div className="resource-preview"><MediaThumb r={r} /></div>
      <div className="resource-intro">
        <div>
          <div className="pill-row resource-badges">
            <EcosystemBadge r={r} />
            <span className="badge type">{r.type}</span>
            <ReadinessBadge r={r} />
            <VerificationBadge value={r.verification} />
            {r.ecosystem === 'tari-ootle' ? <TariCompatBadge value={r.tariCompatible} /> : <span className="badge">External resource</span>}
          </div>
          <h1>{r.title}</h1>
          <p className="resource-summary">{r.summary || 'Explore the source for more about this resource.'}</p>
          {r.sharedBy && <p className="resource-byline">Shared by <Link to={r.sharedBy.url || '/learn'}>{r.sharedBy.name}</Link></p>}
          {r.creator?.name && <p className="resource-byline">Created by {r.creator.url ? <ExternalLink href={r.creator.url}>{r.creator.name} ↗</ExternalLink> : r.creator.name}</p>}
          <div className="resource-actions">
            {r.type === 'starter' && <button className="btn primary" onClick={() => nav(`/create/project?template=${encodeURIComponent(r.id)}`)}>Use as a starting point →</button>}
            {links.filter(([, href], i, all) => href && all.findIndex(([, url]) => url === href) === i).map(([label, href]) => <ExternalLink key={label} href={href!}><span className="btn">{label} ↗</span></ExternalLink>)}
          </div>
        </div>
        <div className="row"><StarButton kind="resource" id={r.id} initialStars={r.engagement?.stars ?? 0} /></div>
      </div>

      </header>
      <div className="resource-body">
        <section className="resource-main"><ContestSubmission resource={r}/>
          <div className="panel">
            <h3>Explore this resource</h3>

            {r.setupHint && (
              <>
                <h4 style={{ marginTop: 18, fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How to start</h4>
                <pre className="notice" style={{ overflowX: 'auto', margin: '8px 0 0' }}>{r.setupHint}</pre>
              </>
            )}

            {r.prerequisites.length > 0 && (
              <>
                <h4 style={{ marginTop: 18, fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prerequisites</h4>
                <div className="pill-row mt8">{r.prerequisites.map((p) => <span key={p} className="tag">{p}</span>)}</div>
              </>
            )}

            {r.tags.length > 0 && (
              <>
                <h4 style={{ marginTop: 18, fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</h4>
                <div className="pill-row mt8">{r.tags.map((t) => <Link key={t} className="tag" to={`/explore?q=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
              </>
            )}


          </div>

          {r.type === 'starter' && (
            <div className="panel mt16">
              <div className="spread">
                <div>
                  <h3>Start a project from this</h3>
                  <p className="muted mt8">Create a composable project seeded with this template. Save versions in Git and fork any saved revision (project configuration only — not a compiled or deployed game).</p>
                </div>
                <button className="btn primary" onClick={() => nav(`/create/project?template=${encodeURIComponent(r.id)}`)}>Use as base →</button>
              </div>
            </div>
          )}
          {r.related && r.related.length > 0 && <RelatedPanel r={r} />}
          <Comments key={r.id} kind="resource" id={r.id} />
        </section>

        <aside className="resource-sidebar" aria-label="Resource details">

          <div className="panel mt16">
            <h3>At a glance</h3>
            <dl className="kv mt8">
              <dt>Ecosystem</dt><dd>{r.ecosystem}{r.native ? ' (native)' : ''}</dd>
              <dt>Network</dt><dd>{r.network || '—'}</dd>
              <dt>Readiness</dt><dd style={{ textTransform: 'capitalize' }}>{readinessLabel(r.readiness)}</dd>
              <dt>License</dt><dd>{r.license || 'Not specified. Check with the creator before reuse.'}</dd>
              <dt>Creator</dt><dd>{r.creator?.url ? <ExternalLink href={r.creator.url}>{r.creator.name} ↗</ExternalLink> : (r.creator?.name || '—')}</dd>
            </dl>
          </div>

          <div className="resource-signals"><PopularityPanel p={r.popularity} /></div>
          <details className="panel resource-source">
            <summary>Sources & freshness</summary>
            <div className="provenance mt8">
              <div>Source: {r.provenance.sourceName}</div>
              {r.attribution && <div>{r.attribution}</div>}
              <div className="row" style={{ marginTop: 6 }}><FreshnessBadge value={r.provenance.freshness} /></div>
              {r.provenance.sourceUpdatedAt && <div>Source updated: {new Date(r.provenance.sourceUpdatedAt).toLocaleDateString()}</div>}
              {r.provenance.fetchedAt && <div>Fetched: {new Date(r.provenance.fetchedAt).toLocaleString()}</div>}
            </div>
          </details>
        </aside>
      </div>

    </article>
  );
}

const GROUP_ORDER = ['understand', 'build', 'troubleshoot', 'related'];
const GROUP_LABELS: Record<string, string> = { understand: 'Understand', build: 'Build & combine', troubleshoot: 'Troubleshoot', related: 'Related' };

function RelatedPanel({ r }: { r: Resource }) {
  const items = r.related || [];
  const groups = GROUP_ORDER.filter((g) => items.some((i) => i.group === g));
  const isLearn = r.type === 'learn';
  return (
    <div className="panel mt16">
      <h3>{isLearn ? 'Where this applies' : 'Learn this'}</h3>
      <p className="muted mt8" style={{ fontSize: 13 }}>
        {isLearn ? 'Templates and recipes this resource explains or walks through.' : 'Guides and walkthroughs for building with this template.'}
      </p>
      {groups.map((g) => (
        <div key={g} style={{ marginTop: 14 }}>
          <h4 style={{ fontSize: 12, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{GROUP_LABELS[g]}</h4>
          <div className="mt8" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.filter((i) => i.group === g).map((i, idx) => (
              <div key={idx} className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                <Link to={`/resource/${encodeURIComponent(i.resource.id)}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
                  {i.label}: {i.resource.title}
                </Link>
                <span className="row" style={{ gap: 6 }}>
                  <span className={`badge ${i.status === 'verified' ? 'native' : ''}`} style={i.status === 'needs-review' ? { color: 'var(--warn)', borderColor: '#4a3a1e', background: '#2a2113' } : undefined}>{i.status}</span>
                  {i.evidence && <a className="faint" href={i.evidence} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>evidence ↗</a>}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
