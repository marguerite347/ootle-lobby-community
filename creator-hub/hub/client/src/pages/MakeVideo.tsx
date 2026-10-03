import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type VideoTemplate, type VideoField, type VideoExport, type ValidateResult } from '../api';
import { latestRequest } from '../latestRequest';
import { applyVideoDraft } from '../videoDraft';
import { Spinner } from '../ui';

// Picker: choose one of the three reusable templates.
export function VideoPicker() {
  const [templates, setTemplates] = useState<VideoTemplate[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.videoTemplates().then((d) => active && setTemplates(d.templates)).catch(() => active && setError('Could not load video templates. Refresh to retry.'));
    return () => { active = false; };
  }, []);
  return (
    <section className="section">
      <p className="faint">CREATE → CAPTURE &amp; PROMOTE</p>
      <h1 style={{ fontSize: 34, marginTop: 12 }}>Make a video</h1>
      <p className="lede">Pick a reusable template, draft the copy (optionally from a brief), and export branded prototype build instructions. Rendering runs in the video-templates package; the hub configures and never posts for you.</p>
      {error && <p role="alert">{error}</p>}
      {!templates && <Spinner />}
      <div className="grid mt16">
        {templates?.map((t) => (
          <Link key={t.id} to={`/create/video/${t.id}`} className="card card-link">
            <span className="badge">remotion</span>
            <h3 className="mt8">{t.title}</h3>
            <p className="summary">{t.description}</p>
            <span className="more">Configure →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const emptyForField = (f: VideoField) => (f.kind === 'list' ? [''] : f.default ?? '');

// Configurator for one template.
export default function MakeVideo() {
  const { id } = useParams();
  const [tpl, setTpl] = useState<VideoTemplate | null>(null);
  const [err, setErr] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [result, setResult] = useState<ValidateResult | null>(null);
  const [validationError, setValidationError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manifest, setManifest] = useState<VideoExport | { error: string } | null>(null);
  const [brief, setBrief] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [draftMsg, setDraftMsg] = useState('');
  const gate = useRef(latestRequest());
  const draftGate = useRef(latestRequest());

  useEffect(() => {
    if (!id) return;
    let active = true;
    setTpl(null); setErr(false); setResult(null); setManifest(null);
    setBrief(''); setDraftMsg(''); setDrafting(false); setShowAdvanced(false);
    draftGate.current.invalidate();
    api.videoTemplate(id).then((t) => {
      if (!active) return;
      setTpl(t);
      const init: Record<string, any> = {};
      for (const f of t.fields) init[f.key] = emptyForField(f);
      setConfig(init);
    }).catch(() => { if (active) setErr(true); });
    return () => { active = false; gate.current.invalidate(); draftGate.current.invalidate(); };
  }, [id]);

  // Debounced live validation, guarded against stale/out-of-order responses.
  useEffect(() => {
    if (!tpl || !id) return;
    const isCurrent = gate.current.begin();
    setResult(null); setValidationError('');
    const t = setTimeout(() => {
      api.validateVideo(id, config)
        .then((v) => { if (isCurrent()) setResult(v); })
        .catch(() => { if (isCurrent()) setValidationError('Validation failed. Change a field to retry.'); });
    }, 250);
    return () => { clearTimeout(t); gate.current.invalidate(); };
  }, [config, tpl, id]);

  const errorsByField = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const e of result?.errors || []) (m[e.field] ||= []).push(e.reason);
    return m;
  }, [result]);

  if (err) return <div className="panel mt24">Template not found. <Link to="/create/video">Back</Link></div>;
  if (!tpl) return <Spinner />;

  const invalidateDraft = () => { draftGate.current.invalidate(); setDrafting(false); setDraftMsg(''); };
  const editBrief = (value: string) => { invalidateDraft(); setBrief(value); };
  const set = (key: string, value: any) => { invalidateDraft(); gate.current.invalidate(); setResult(null); setManifest(null); setValidationError(''); setConfig((c) => ({ ...c, [key]: value })); };
  const setListItem = (key: string, i: number, value: string) => set(key, (config[key] as string[]).map((v, j) => (j === i ? value : v)));
  const addListItem = (key: string, max?: number) => { const arr = (config[key] as string[]) || []; if (!max || arr.length < max) set(key, [...arr, '']); };
  const removeListItem = (key: string, i: number) => set(key, (config[key] as string[]).filter((_, j) => j !== i));

  const visible = tpl.fields.filter((f) => !f.advanced || showAdvanced);

  async function doExport() {
    if (!id) return;
    const isCurrent = gate.current.snapshot();
    try { const m = await api.exportVideo(id, config); if (isCurrent()) setManifest(m); }
    catch (e: any) { if (isCurrent()) setManifest({ error: e.message }); }
  }

  async function doDraft() {
    if (!id || !tpl || !brief.trim()) return;
    const isCurrent = draftGate.current.begin();
    setDrafting(true); setDraftMsg('');
    try {
      const d = await api.draftVideo(id, brief);
      if (!isCurrent()) return;
      setConfig((c) => applyVideoDraft(c, d.draft, tpl.fields));
      gate.current.invalidate(); setResult(null); setManifest(null);
      setDraftMsg(d.validation.ok ? `Drafted with ${d.model}. Review and edit before exporting.` : `Drafted with ${d.model}, but some fields need fixing.`);
    } catch (e: any) {
      if (isCurrent()) setDraftMsg(`Draft unavailable: ${e.message}`);
    } finally { if (isCurrent()) setDrafting(false); }
  }

  return (
    <>
      <div className="row mt24"><Link className="muted" to="/create/video">← Templates</Link></div>
      <div className="detail-head">
        <div style={{ flex: 1 }}>
          <div className="pill-row" style={{ marginBottom: 10 }}><span className="badge ext">remotion</span><span className="badge">{tpl.id}</span></div>
          <h1>{tpl.title}</h1>
          <p className="muted mt8" style={{ maxWidth: 640 }}>{tpl.description}</p>
        </div>
      </div>

      <div className="notice" style={{ marginBottom: 16 }}>
        <b>Configure only</b> — this produces branded prototype build instructions (validated props + a render command). Rendering happens in the <code>creator-hub/video-templates</code> package. A render never implies permission to post; concept/AI visuals stay labeled, not shown as gameplay.
      </div>

      <div className="with-side">
        <section style={{ order: 2 }}>
          {/* Draft from a brief (optional, OpenMontage-style) */}
          <div className="panel">
            <h3>Draft from a brief <span className="faint" style={{ fontSize: 12 }}>optional</span></h3>
            <p className="muted mt8" style={{ fontSize: 13 }}>Describe the clip; an assistant drafts the copy fields for you to edit. Uses the configured model; you review everything before export.</p>
            {tpl.examples && tpl.examples.length > 0 && (
              <div className="row mt8" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="faint" style={{ fontSize: 12 }}>Try an example:</span>
                {tpl.examples.map((ex) => (
                  <button key={ex.label} type="button" className="btn small" onClick={() => editBrief(ex.brief)}>{ex.label}</button>
                ))}
              </div>
            )}
            <textarea className="field mt8" rows={3} value={brief} placeholder="e.g. Introduce my Ootle application, explain one verified feature, and invite viewers to try the demo." onChange={(e) => editBrief(e.target.value)} />
            <div className="row mt8">
              <button className="btn" onClick={doDraft} disabled={drafting || !brief.trim()}>{drafting ? 'Drafting…' : 'Draft copy'}</button>
              {draftMsg && <span className="faint" style={{ fontSize: 12 }} role="status">{draftMsg}</span>}
            </div>
          </div>

          {/* Configure */}
          <div className="panel mt16">
            {validationError && <p role="alert">{validationError}</p>}
            <h3>Configure</h3>
            <div className="mt8">
              {visible.map((f) => (
                <div key={f.key} style={{ marginTop: 14 }}>
                  <label className="lbl" htmlFor={f.key}>{f.label}{f.advanced ? ' (advanced)' : ''}{f.required ? ' *' : ''}</label>
                  {f.kind === 'list' ? (
                    <div>
                      {((config[f.key] as string[]) || []).map((v, i) => (
                        <div key={i} className="row" style={{ gap: 8, marginTop: 6 }}>
                          <input className="field" value={v} maxLength={f.itemMaxLength} onChange={(e) => setListItem(f.key, i, e.target.value)} />
                          <button type="button" className="btn small" onClick={() => removeListItem(f.key, i)} aria-label={`Remove ${f.label} ${i + 1}`}>✕</button>
                        </div>
                      ))}
                      <button type="button" className="btn small" style={{ marginTop: 8 }} disabled={!!f.maxItems && ((config[f.key] as string[]) || []).length >= f.maxItems} onClick={() => addListItem(f.key, f.maxItems)}>+ Add</button>
                    </div>
                  ) : f.kind === 'select' ? (
                    <select id={f.key} className="field" value={config[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      id={f.key}
                      className="field"
                      type={f.kind === 'integer' ? 'number' : f.kind === 'color' ? 'text' : f.kind === 'url' ? 'url' : 'text'}
                      value={config[f.key] ?? ''}
                      min={f.min}
                      max={f.max}
                      maxLength={f.maxLength}
                      placeholder={f.kind === 'color' ? '#C9EB00' : f.kind === 'url' ? 'https://…' : ''}
                      onChange={(e) => set(f.key, f.kind === 'integer' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                      aria-invalid={!!errorsByField[f.key]}
                    />
                  )}
                  {f.help && <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>{f.help}</div>}
                  {errorsByField[f.key]?.map((msg, i) => <div key={i} style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{msg}</div>)}
                </div>
              ))}
            </div>
            <div className="row mt16">
              {tpl.fields.some((f) => f.advanced) && (
                <button type="button" className="btn small" onClick={() => setShowAdvanced((s) => !s)}>{showAdvanced ? 'Hide advanced' : 'Show advanced'}</button>
              )}
              <span className={`badge ${result?.ok ? 'native' : ''}`} style={result && !result.ok ? { color: 'var(--danger)' } : undefined}>
                {result ? (result.ok ? 'valid configuration' : `${result.errors.length} issue(s)`) : (validationError ? 'validation unavailable' : 'validating…')}
              </span>
              <button className="btn primary" onClick={doExport} disabled={!result?.ok}>Export build instructions</button>
            </div>
          </div>

          {manifest && 'error' in manifest && <div className="panel mt16" role="alert"><b>Export failed:</b> {manifest.error}</div>}
          {manifest && !('error' in manifest) && (
            <div className="panel mt16">
              <div className="spread"><h3>Build instructions</h3><span className="badge">props + render command</span></div>
              <p className="muted mt8" style={{ fontSize: 13 }}>{manifest.render.note}</p>
              <p className="lbl mt8">Render command</p>
              <pre className="notice" style={{ overflowX: 'auto' }}>{manifest.render.command}</pre>
              <p className="lbl mt8">props/{manifest.template.toLowerCase()}.json</p>
              <pre className="notice" style={{ overflowX: 'auto', maxHeight: 320 }}>{JSON.stringify(manifest.props, null, 2)}</pre>
              <p className="faint mt8" style={{ fontSize: 12 }}>{manifest.disclosure}</p>
            </div>
          )}
        </section>

        <aside style={{ order: 1 }}>
          <div className="panel">
            <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How it renders</h4>
            <ol className="mt8" style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
              <li>Configure &amp; export here.</li>
              <li>Save the props JSON in <code>creator-hub/video-templates</code>.</li>
              <li>Run the render command to produce an MP4 + manifest.</li>
              <li>Optionally generate a background via ComfyUI; the brand is applied on top.</li>
            </ol>
            <p className="faint mt8" style={{ fontSize: 12 }}>Every render writes a manifest keeping project / template / campaign / clip IDs and the tracked link.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
