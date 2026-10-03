import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { api, type PopularityStandard } from '../api';
import { Spinner } from '../ui';

export default function Popularity() {
  const [s, setS] = useState<PopularityStandard | null>(null);
  useEffect(() => { api.popularityStandard().then(setS).catch(() => setS(null)); }, []);

  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>How popularity is measured</h1>
          <div className="sub">One transparent standard across every source — no fabricated numbers, and incomparable metrics are never summed on their raw scales.</div>
        </div>
      </div>

      <div className="panel mt16">
        <p className="muted" style={{ lineHeight: 1.6 }}>
          Each listing shows a <strong>popularity signal</strong> — a 0–100 score, a tier and the single strongest native
          metric (like ★ stars, ⤓ downloads, forum reads or hub stars). It is built from real signals collected from each
          source, normalized <em>within its own metric</em>, then combined with disclosed weights. Listings with no signal
          are shown as <strong>New</strong> rather than given an invented score, so new work still gets a discovery path.
        </p>
      </div>

      {!s && <Spinner />}
      {s && (
        <>
          <div className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head"><h2 style={{ fontSize: 20 }}>The four dimensions (standard v{s.version})</h2></div>
            <div className="grid two">
              {Object.entries(s.dimensions).map(([id, d]) => (
                <div className="card" key={id}>
                  <div className="top"><span className="badge">weight {Math.round(d.weight * 100)}%</span></div>
                  <h3>{d.label}</h3>
                  <p className="summary" style={{ WebkitLineClamp: 4 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head"><h2 style={{ fontSize: 20 }}>Method</h2></div>
            <div className="panel">
              <ol className="steps">
                <li>Collect real signals per source (GitHub stars/forks/last-push, ContentDB downloads/score, forum reads, and Ootle Lobby stars/comments/forks). Each keeps its provenance.</li>
                <li>Normalize each signal within its own metric on a log curve against a disclosed reference value, giving a 0–1 subscore. A star and a download are never added together on raw scales.</li>
                <li>Take the strongest available signal in each dimension (Reach, Adoption, Momentum, Engagement).</li>
                <li>Combine the available dimensions using the disclosed weights above, rescaled by how much data exists, to get a 0–100 score.</li>
                <li>Report a confidence level from how many dimensions had data, and map the score to a tier.</li>
              </ol>
            </div>
          </div>

          <div className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head"><h2 style={{ fontSize: 20 }}>Tiers &amp; disclosed references</h2></div>
            <div className="with-side" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="panel">
                <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tiers</h4>
                <dl className="kv mt8">
                  {s.tiers.map((t) => (<Fragment key={t.id}><dt>{t.label}</dt><dd>score ≥ {t.min}</dd></Fragment>))}
                </dl>
                <p className="faint mt8" style={{ fontSize: 12 }}>Momentum half-life: {s.momentumHalfLifeDays} days.</p>
              </div>
              <div className="panel">
                <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reference values (raw ≈ 1.0)</h4>
                <dl className="kv mt8">
                  {Object.entries(s.references).map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v.toLocaleString()}</dd></Fragment>))}
                </dl>
              </div>
            </div>
          </div>

          <div className="panel mt24">
            <p className="faint" style={{ fontSize: 13, lineHeight: 1.6 }}>
              Guardrails: downloads and stars are not counts of unique builders; external-engine popularity does not imply
              Tari/Ootle compatibility; trends require dated evidence. Reuse of a template is best evidenced by real
              consuming projects, tracked separately from this signal. See <Link to="/explore" style={{ color: 'var(--accent)' }}>Explore</Link> to sort by popularity.
            </p>
          </div>
        </>
      )}
    </>
  );
}
