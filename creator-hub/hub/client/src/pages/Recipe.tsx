import {safeHref} from '../../../shared/safeLinks.mjs';
import BuildToolkit from '../components/BuildToolkit';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type Recipe as RecipeT, type ValidateResult } from '../api';
import { latestRequest } from '../latestRequest';
import { Spinner, ExternalLink } from '../ui';

export default function Recipe() {
  const { id } = useParams();
  const nav=useNavigate();
  const [title,setTitle]=useState('');
  const [author,setAuthor]=useState('');
  const [saving,setSaving]=useState(false);
  const [saveError,setSaveError]=useState('');
  async function saveProject(e:React.FormEvent){
    e.preventDefault(); if(!id||!result?.ok||saving)return;
    setSaving(true);setSaveError('');
    try{const out=await api.saveRecipe(id,{title,author,config});nav(`/project/${out.project.id}`);}
    catch(e:any){setSaveError(e.message);}finally{setSaving(false);}
  }
  const [r, setR] = useState<RecipeT | null>(null);
  const [err, setErr] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [result, setResult] = useState<ValidateResult | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const requestVersion = useRef(latestRequest());
  const [validationError, setValidationError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setR(null); setErr(false); setResult(null); setManifest(null);
    api.recipe(id).then((rec) => {
      if (!active) return;
      setR(rec);
      const init: Record<string, any> = {};
      for (const p of rec.parameters) init[p.key] = p.default;
      setConfig(init);
    }).catch(() => {if(active) setErr(true);});
    return () => {active=false; requestVersion.current.invalidate();};
  }, [id]);

  // Live validation (debounced).
  useEffect(() => {
    if (!r || !id) return;
    const isCurrent = requestVersion.current.begin();
    setResult(null); setValidationError('');
    const t = setTimeout(() => { api.validateRecipe(id, config).then(value => {
      if(isCurrent()) setResult(value);
    }).catch(() => {if(isCurrent()) setValidationError('Validation failed. Change a field to retry.');}); }, 200);
    return () => {clearTimeout(t); requestVersion.current.invalidate();};
  }, [config, r, id]);

  const errorsByField = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const e of result?.errors || []) { (m[e.field] ||= []).push(e.reason); }
    return m;
  }, [result]);

  if (err) return <div className="panel mt24">Recipe not found. <Link to="/create">Back</Link></div>;
  if (!r) return <Spinner />;

  const set = (key: string, value: any) => {requestVersion.current.invalidate(); setResult(null); setManifest(null); setValidationError(''); setConfig((c) => ({ ...c, [key]: value }));};
  const visibleParams = r.parameters.filter((p) => !p.advanced || showAdvanced);

  async function doExport() {
    if (!id) return;
    const isCurrent=requestVersion.current.snapshot();
    try { const exported=await api.exportRecipe(id, config); if(isCurrent()) setManifest(exported); }
    catch (e: any) { if(isCurrent()) setManifest({ error: e.message }); }
  }

  const preview = summarize(r, config);

  return (
    <>
      <div className="row mt24"><Link className="muted" to="/create">← Choose a starting point</Link></div>
      <BuildToolkit initialIdea={`${r.title} Tari Ootle ${r.description}`.slice(0,600)}/>
      <div className="detail-head">
        <div style={{ flex: 1 }}>
          <div className="pill-row" style={{ marginBottom: 10 }}>
            <span className="badge ext">{r.engine}</span>
            <span className="badge">{r.status}</span>
            <span className="badge">{r.verifiedTestnet ? 'testnet-verified' : 'not testnet-verified'}</span>
          </div>
          <h1>{r.title} <span className="faint" style={{ fontSize: 15 }}>v{r.version}</span></h1>
          <p className="muted mt8" style={{ maxWidth: 640 }}>{r.description}</p>
        </div>
      </div>

      <div className="notice" style={{ marginBottom: 16 }}>
        <b>Proposed composition</b> — not a confirmed or testnet-verified runnable recipe. This configures parameters and pins component versions only; it does not compile or deploy a game. Execution requires a reward adapter that is not yet implemented; wallet approval alone does not supply that adapter.
      </div>

      <div className="with-side">
        <section style={{ order: 2 }}>
          {/* Configure */}
          <div className="panel">
            {validationError && <p role="alert">{validationError}</p>}
            <h3>Configure</h3>
            <div className="mt8">
              {visibleParams.map((p) => (
                <div key={p.key} style={{ marginTop: 12 }}>
                  <label className="lbl" htmlFor={p.key}>{p.label}{p.advanced ? ' (advanced)' : ''}</label>
                  <input
                    id={p.key}
                    className="field"
                    type={p.type === 'integer' ? 'number' : 'text'}
                    value={config[p.key] ?? ''}
                    min={p.min}
                    max={p.max}
                    maxLength={p.maxLength}
                    onChange={(e) => set(p.key, p.type === 'integer' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                    aria-invalid={!!errorsByField[p.key]}
                  />
                  {errorsByField[p.key]?.map((msg, i) => <div key={i} style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{msg}</div>)}
                </div>
              ))}
              {r.parameters.some((p) => p.advanced) && (
                <button type="button" className="btn small" style={{ marginTop: 14 }} onClick={() => setShowAdvanced((s) => !s)}>
                  {showAdvanced ? 'Hide advanced' : 'Show advanced settings'}
                </button>
              )}
            </div>
            <div className="row mt16">
              <span className={`badge ${result?.ok ? 'native' : ''}`} style={result && !result.ok ? { color: 'var(--danger)' } : undefined}>
                {result ? (result.ok ? 'valid configuration' : `${result.errors.length} issue(s)`) : (validationError ? 'validation unavailable' : 'validating…')}
              </span>
              <button className="btn primary" onClick={doExport} disabled={!result?.ok}>Export build instructions</button>
            </div>
          </div>

          <form className="panel mt16" onSubmit={saveProject}>
            <h3>Keep building in your project</h3>
            <p className="muted mt8">Save these settings, pinned components and adapter requirements together. Your project holds its history and Riff lineage.</p>
            <label className="lbl" htmlFor="project-title">Project title</label><input id="project-title" className="field" required value={title} onChange={e=>setTitle(e.target.value)}/>
            <label className="lbl" htmlFor="project-author">Creator name</label><input id="project-author" className="field" value={author} onChange={e=>setAuthor(e.target.value)} placeholder="anonymous"/>
            {saveError&&<p role="alert">{saveError}</p>}
            <button className="btn primary mt16" disabled={saving||!result?.ok||!title.trim()}>{saving?'Saving…':'Save and open project'}</button>
          </form>

          {/* Mock preview */}
          <div className="panel mt16">
            <div className="spread"><h3>Preview</h3><span className="badge">mock preview</span></div>
            <p className="muted mt8" style={{ lineHeight: 1.6 }}>{preview}</p>
            <p className="faint mt8" style={{ fontSize: 12 }}>Mock preview only — not an executable local game or a testnet action. Distinct states: <b>mock preview</b> → executable local game → verified testnet.</p>
          </div>

          {manifest && (
            <div className="panel mt16">
              <h3>Export manifest</h3>
              <pre className="notice mt8" style={{ overflowX: 'auto', maxHeight: 320 }}>{JSON.stringify(manifest, null, 2)}</pre>
            </div>
          )}
        </section>

        <aside style={{ order: 1 }}>
          <div className="panel">
            <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Components (pinned)</h4>
            <div className="mt8" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {r.components.map((c) => (
                <div key={c.id}>
                  <Link to={`/resource/${encodeURIComponent(c.templateId)}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>{c.name}</Link>
                  <div className="faint" style={{ fontSize: 12 }}>{c.summary}</div>
                  <div className="faint" style={{ fontSize: 11 }}>rev {c.revision.slice(0, 8)} · <ExternalLink href={safeHref(c.source)}>source ↗</ExternalLink></div>
                </div>
              ))}
            </div>
            {r.connections.length > 0 && (
              <>
                <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 14 }}>Connections</h4>
                {r.connections.map((cn) => <div key={cn.id} className="faint" style={{ fontSize: 12, marginTop: 4 }}>{cn.from} → {cn.to}{cn.note ? ` (${cn.note})` : ''}</div>)}
              </>
            )}
          </div>

          <div className="panel mt16">
            <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Learn</h4>
            <div className="mt8" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {r.education.map((e) => (
                e.url ? <Link key={e.id} to={`/resource/${encodeURIComponent(e.id)}`} style={{ color: 'var(--accent)', fontSize: 13 }}>{e.title}</Link>
                  : <span key={e.id} className="faint" style={{ fontSize: 13 }}>{e.title}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function summarize(r: RecipeT, config: Record<string, any>) {
  const reward = config.rewardPerIncrement ?? 1;
  const sym = config.tokenSymbol ?? 'PTS';
  const start = config.startCount ?? 0;
  if (r.id === 'token-rewarded-counter') {
    return `Players increment an on-chain counter (starting at ${start}); a proposed adapter would distribute ${reward} ${sym} token(s) from a prefunded vault after each increment to the player's wallet. The PlayCanvas frontend renders the counter and reward feedback; the adapter must still be implemented and tested; the upstream token withdrawal is public and does not enforce earned rewards.`;
  }
  return r.description;
}
