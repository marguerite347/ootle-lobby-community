import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, type OnboardingSummary, type OnboardingPath } from '../api';
import { ResourceCard, Spinner, ExternalLink } from '../ui';
import { GOAL_STARTER_SHELF_SIZE, saveProjectButtonLabel, starterProjectPath, threeDimensionalShelfLabel } from '../../../shared/starterShelf.mjs';

export default function Onboarding() {
  const { id } = useParams();
  if (id) return <PathView id={id} />;
  return <GoalList />;
}

function GoalList() {
  const [paths, setPaths] = useState<OnboardingSummary[] | null>(null);
  useEffect(() => { api.onboarding().then((d) => setPaths(d.paths)).catch(() => setPaths([])); }, []);
  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>What do you want to build?</h1>
          <div className="sub">Pick a goal and get a recommended starter, setup steps and resources — then save your starting point and continue in your project.</div>
        </div>
      </div>
      {!paths && <Spinner />}
      <div className="wizard-grid mt16">
        {paths?.map((p) => (
          <Link key={p.id} to={`/create/goal/${p.id}`} className="goal">
            <div className="pill-row" style={{ marginBottom: 8 }}>
              <span className={`badge dot ${p.external ? 'ext' : 'native'}`}>{p.external ? 'external ecosystem' : 'native Ootle'}</span>
            </div>
            <h3>{p.goal}</h3>
            <p>{p.blurb}</p>
            <p className="faint mt8">{p.audience}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

function PathView({ id }: { id: string }) {
  const [p, setP] = useState<OnboardingPath | null>(null);
  const [err, setErr] = useState(false);
  const nav = useNavigate();
  useEffect(() => { setP(null); api.onboardingPath(id).then(setP).catch(() => setErr(true)); }, [id]);

  if (err) return <div className="panel mt24">Path not found. <Link to="/create">Back</Link></div>;
  if (!p) return <Spinner />;

  const base = p.preferred || p.recommended[0] || null;

  return (
    <>
      <div className="row mt24"><Link className="muted" to="/create">← All goals</Link></div>
      <div className="detail-head">
        <div style={{ flex: 1 }}>
          <div className="pill-row" style={{ marginBottom: 10 }}>
            <span className={`badge dot ${p.external ? 'ext' : 'native'}`}>{p.ecosystemLabel}</span>
          </div>
          <h1>{p.goal}</h1>
          <p className="muted mt8" style={{ maxWidth: 640, lineHeight: 1.55 }}>{p.blurb}</p>
        </div>
        {base && (
          <StarterSaveButton title={base.title} templateId={base.id} onNavigate={nav} />
        )}
      </div>

      <div className="with-side mt16">
        <section style={{ order: 2 }}>
          <div className="panel">
            <h3>Setup steps</h3>
            <ol className="steps mt16">{p.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>

          {p.recommended.length > 0 && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <div className="section-head"><h2 style={{ fontSize: 20 }}>Recommended starters</h2></div>
              <div className="grid">{p.recommended.slice(0, GOAL_STARTER_SHELF_SIZE).map((r) => <ResourceCard key={r.id} r={r} dimensionLabel={threeDimensionalShelfLabel(r.starterDimension)} />)}</div>
            </div>
          )}

          {p.alsoExplore.length > 0 && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <div className="section-head"><h2 style={{ fontSize: 20 }}>Also explore</h2></div>
              <div className="grid">{p.alsoExplore.slice(0, 6).map((r) => <ResourceCard key={r.id} r={r} />)}</div>
            </div>
          )}
        </section>

        <aside style={{ order: 1 }}>
          {p.resources && p.resources.length > 0 && (
            <div className="panel">
              <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guides</h4>
              <div className="mt8" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.resources.map((r) => <ExternalLink key={r.url} href={r.url}><span className="btn small" style={{ width: '100%', textAlign: 'left' }}>{r.title} ↗</span></ExternalLink>)}
              </div>
            </div>
          )}
          <div className="panel mt16">
            <div className="notice">
              {p.external
                ? 'This is a general game/creative ecosystem. Tari/Ootle compatibility is a separate, evidence-based step — not implied here.'
                : 'Native Ootle path. Testnet apps and templates are not production-ready.'}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export function StarterSaveButton({ title, templateId, onNavigate }: { title: string; templateId: string; onNavigate: (path: string) => void }) {
  return (
    <button className="btn primary" type="button" onClick={() => onNavigate(starterProjectPath(templateId))}>
      {saveProjectButtonLabel(title)}
    </button>
  );
}
