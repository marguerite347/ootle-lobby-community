import {safeHref} from '../../shared/safeLinks.mjs';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Resource, Popularity } from './api';
import type {ReactNode} from 'react';
import { api, userId, userName, setUserName } from './api';

export function Spinner() {
  return <div className="spinner" aria-label="loading" />;
}

// Compact popularity indicator for thumbnails: tier colour + score + strongest
// native metric. Links to the explainer so the standard is easy to understand.
export function PopularityChip({ p, compact }: { p?: Popularity; compact?: boolean }) {
  if (!p) return null;
  const tier = p.score == null ? 'new' : p.tier;
  const title = p.score == null
    ? 'No popularity signal yet — new listing'
    : `Popularity ${p.score}/100 (${p.tierLabel}, ${p.confidence} confidence) from ${p.sources.join(', ')}. Click to learn how this is measured.`;
  return (
    <Link to="/popularity" className={`pop pop-${tier}`} title={title} onClick={(e) => e.stopPropagation()}>
      <span className="pop-flame">{p.score == null ? '✦' : '▲'}</span>
      <span className="pop-score">{p.score == null ? 'New' : p.score}</span>
      {!compact && p.native && <span className="pop-native">{p.native.metric}</span>}
    </Link>
  );
}

export function StarButton({ kind, id, initialStars, onChange }: { kind: 'resource' | 'project'; id: string; initialStars: number; onChange?: (n: number) => void }) {
  const [stars, setStars] = useState(initialStars);
  const [starred, setStarred] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  async function ensureState() {
    if (starred === null) {
      try { const s = await api.engagement(kind, id, userId()); setStarred(s.starred); setStars(s.stars); } catch { /* ignore */ }
    }
  }

  async function toggle() {
    setBusy(true);
    try {
      const r = await api.toggleStar(kind, id, userId());
      setStars(r.stars); setStarred(r.starred); onChange?.(r.stars);
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <button
      className={`starbtn ${starred ? 'on' : ''}`}
      disabled={busy}
      onMouseEnter={ensureState}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      title="Star this"
    >
      <span>{starred ? '★' : '☆'}</span>
      <span>{stars}</span>
    </button>
  );
}

export function EcosystemBadge({ r }: { r: Pick<Resource,'ecosystem'|'native'> }) {
  const label = ecoLabel(r.ecosystem);
  return <span className={`badge dot ${r.native ? 'native' : 'ext'}`}>{label}</span>;
}

export function ecoLabel(eco: string) {
  return ({
    'tari-ootle': 'Tari Ootle',
    tari: 'Tari L1',
    gdevelop: 'GDevelop',
    luanti: 'Luanti',
    creative: 'Creative',
    huggingface: 'Hugging Face',
  } as Record<string, string>)[eco] || eco;
}

export function readinessLabel(value: unknown) {
  return typeof value === 'string' && value ? value.replaceAll('-', ' ') : 'Not assessed';
}

export function ReadinessBadge({ r }: { r: Resource }) {
  return <span className="badge readiness">{readinessLabel(r.readiness)}</span>;
}

export function VerificationBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    'hub-verified': 'Hub verified',
    'source-attested': 'Source attested',
    unverified: 'Unverified',
  };
  return <span className="badge">{map[value] || value}</span>;
}

export function FreshnessBadge({ value }: { value: string }) {
  return <span className={`badge dot fresh-${value}`}>{value}</span>;
}

export function TariCompatBadge({ value }: { value: boolean | null }) {
  if (value === true) return <span className="badge native">Ootle app</span>;
  if (value === false) return <span className="badge">Not Ootle</span>;
  return <span className="badge" title="Tari/Ootle compatibility not established">Ootle compat: unknown</span>;
}

const ECO_GLYPH: Record<string, string> = { 'tari-ootle': '◈', gdevelop: '▶', luanti: '⛏', creative: '✧' };
function hueOf(id: string) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; }

// Lightweight media thumbnail for grid cards: real source image/poster, an actual
// muted looping clip while visible when one exists (e.g. a live app-webpage capture), or
// a styled animated placeholder. Never a fabricated screenshot.
export type CardMediaResource = Pick<Resource,'id'|'ecosystem'|'native'|'title'|'preview'> & {popularity?:Resource['popularity']};
export function ResourceCardMedia({ r, className, metrics }: { r: CardMediaResource; className?: string; metrics?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const container = useRef<HTMLDivElement | null>(null);
  const vref = useRef<HTMLVideoElement | null>(null);
  const image = !failed ? r.preview?.image : null;
  const video = r.preview?.video || null;
  const h = hueOf(r.id);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (visible && (!reduced.matches || hover)) {
        v.muted = true;
        v.play().catch(() => setPlaying(false));
      } else { v.pause(); setPlaying(false); }
    };
    update();
    reduced.addEventListener('change', update);
    return () => { reduced.removeEventListener('change', update); v.pause(); };
  }, [visible, hover, video]);

  return (
    <div ref={container} className={`media ${className || ''}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {image ? (
        <img className="media-img" src={image} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="media-ph media-shader" style={{ '--ph-hue': h } as React.CSSProperties}>
          <span className="media-ph-glyph" aria-hidden="true">{ECO_GLYPH[r.ecosystem] || '✧'}</span>
          <span className="media-ph-title">{r.title}</span>
        </div>
      )}
      {video && <video ref={vref} className={`media-video ${playing ? 'on' : ''}`} src={video} muted loop playsInline preload="metadata" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} />}
      <div className="media-badges"><EcosystemBadge r={r} /></div>
      <div className="media-pop">{metrics ?? (r.popularity ? <PopularityChip p={r.popularity} compact /> : null)}</div>
    </div>
  );
}

export function ResourceCard({ r, dimensionLabel }: { r: Resource; dimensionLabel?: string | null }) {
  return (
    <Link to={`/resource/${encodeURIComponent(r.id)}`} className="card card-link">
      <ResourceCardMedia r={r} />
      <div className="top">
        <span className="badge type">{r.type}</span>
        {dimensionLabel ? <span className="badge">{dimensionLabel}</span> : null}
        <ReadinessBadge r={r} />
      </div>
      <h3>{r.title}</h3>
      <p className="summary">{r.summary || r.category || 'No description imported yet — open to see source links.'}</p>
      <div className="foot">
        {r.creator?.name && <span>by {r.creator.name}</span>}
        <StarButton kind="resource" id={r.id} initialStars={r.engagement?.stars ?? 0} />
        {r.engagement?.comments ? <span title="comments">💬 {r.engagement.comments}</span> : null}
        <span style={{ marginLeft: 'auto' }}>View →</span>
      </div>
    </Link>
  );
}

export function ExternalLink({ href, children }: { href?: string; children: React.ReactNode }) {
  const safe=safeHref(href);
  return safe?<a href={safe} target="_blank" rel="noopener noreferrer">{children} <small>({safe.startsWith('https:')?new URL(safe).hostname:'Lobby'})</small></a>:<span>{children}</span>;
}

const DIM_LABELS: Record<string, string> = { reach: 'Reach', adoption: 'Adoption', momentum: 'Momentum', engagement: 'Engagement' };

export function PopularityPanel({ p }: { p?: Popularity }) {
  if (!p) return null;
  return (
    <div className="panel">
      <div className="spread">
        <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Popularity</h4>
        <PopularityChip p={p} />
      </div>
      {p.score == null ? (
        <p className="muted mt8" style={{ fontSize: 13 }}>New listing — no popularity signal yet. New work gets a discovery path without a fabricated score.</p>
      ) : (
        <>
          <div className="mt8">
            {['reach', 'adoption', 'momentum', 'engagement'].map((k) => (
              <div className="dimbar" key={k}>
                <span className="muted">{DIM_LABELS[k]}</span>
                <span className="track"><span className="fill" style={{ width: `${Math.round((p.dimensions[k] ?? 0) * 100)}%` }} /></span>
                <span className="val">{p.dimensions[k] != null ? Math.round(p.dimensions[k] * 100) : '—'}</span>
              </div>
            ))}
          </div>
          <p className="faint mt8" style={{ fontSize: 12 }}>
            {p.tierLabel} · {p.confidence} confidence · from {p.sources.join(', ')}. <Link to="/popularity" style={{ color: 'var(--accent)' }}>How is this measured?</Link>
          </p>
        </>
      )}
    </div>
  );
}

export function Comments({ kind, id }: { kind: 'resource' | 'project'; id: string }) {
  const [comments, setComments] = useState<{ id: string; author: string; body: string; at: string }[]>([]);
  const [name, setName] = useState(userName());
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.engagement(kind, id, userId()).then((s) => { setComments(s.comments); setLoaded(true); }).catch(() => setLoaded(true));
  }, [kind, id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      if (name.trim()) setUserName(name.trim());
      const c = await api.addComment(kind, id, name.trim() || 'anonymous', body.trim());
      setComments([...comments, c]);
      setBody('');
    } catch (err: any) { alert(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="panel mt16">
      <h3>Comments &amp; feedback {loaded ? `(${comments.length})` : ''}</h3>
      <div className="mt8">
        {comments.length === 0 && loaded && <p className="muted" style={{ fontSize: 14 }}>No comments yet. Be the first to leave feedback.</p>}
        {comments.map((c) => (
          <div className="comment" key={c.id}>
            <div className="who"><span className="name">{c.author}</span><span className="when">{new Date(c.at).toLocaleString()}</span></div>
            <div className="body">{c.body}</div>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="mt16">
        <div className="row">
          <input className="field" style={{ maxWidth: 200 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <textarea className="field mt8" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share feedback, a question, or how you used this…" />
        <div className="mt8"><button className="btn primary" disabled={busy || !body.trim()}>Post comment</button></div>
      </form>
    </div>
  );
}
