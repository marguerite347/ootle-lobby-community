import {announceMilestone} from '../creatorMilestones';
import ProjectHistory from '../components/ProjectHistory';
import ProductionReview from '../components/ProductionReview';
import type {ProductionReview as Review} from '../../../shared/productionReview.mjs';
import {recordCreatorEvent} from '../creatorAnalytics';
import WorkflowEditor from '../WorkflowEditor';
import VersionCompare from '../components/VersionCompare';
import './Project.css';
import { seedWorkflow, type Workflow } from '../../../shared/workflow.mjs';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type ProjectDetail, type ProjectState, type Version, type Resource } from '../api';
import { Spinner, ecoLabel, PopularityChip, StarButton, PopularityPanel, Comments } from '../ui';
import { validRecipeSnapshot } from '../recipeSnapshot';
import {ReleaseNext} from '../releaseNext';
import {readTriviaRiff} from '../triviaRiff/model';
import TriviaRiffPreview from '../triviaRiff/TriviaRiffPreview';
import './TriviaRiff.css';
import ProjectGame, { savedGame } from '../components/ProjectGame';
import { enterConflict, resolveOverwrite, resolveDiscard } from '../conflict';

export default function Project() {
  const { id } = useParams();
  const [d, setD] = useState<ProjectDetail | null>(null);
  const [err, setErr] = useState(false);
  const [actionError, setActionError] = useState('');
  const [forkRevision,setForkRevision] = useState<string|null>(null);
  const [forkTitle,setForkTitle] = useState('');
  const [forkAuthor,setForkAuthor] = useState('');
  const [workflow,setWorkflow] = useState<Workflow>({version:1,nodes:[],edges:[]});
  const [productionReview,setProductionReview] = useState<Review|undefined>();
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [components, setComponents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Resource[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ head: string | null; state: ProjectState | null; versions: Version[] } | null>(null);
  const nav = useNavigate();

  const loadGeneration = useRef(0);
  const load = useCallback(() => {
    if (!id) return;
    const generation = ++loadGeneration.current;
    setErr(false);
    api.project(id).then((det) => {
      if(generation!==loadGeneration.current)return;
      setD(det);
      setProductionReview(det.state?.productionReview);
      setWorkflow(det.state?.workflow || seedWorkflow(det.state));
      setNotes(det.state?.notes || '');
      setComponents(det.state?.components || []);
    }).catch(() => {if(generation===loadGeneration.current)setErr(true)});
  }, [id]);

  useEffect(()=>{setD(null);load();return()=>{loadGeneration.current++}}, [load]);

  useEffect(()=>{if(id&&d?.project.id===id)void recordCreatorEvent('project_open',id)},[id,d?.project.id]);

  useEffect(() => {
    if (!search) { setResults([]); return; }
    const t = setTimeout(() => api.resources({ q: search }).then((r) => setResults(r.items.slice(0, 6))).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [search]);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(null), 2200); }

  function addComponent(r: Resource) {
    if (components.find((c) => c.id === r.id)) return;
    setComponents([...components, { id: r.id, title: r.title, ecosystem: r.ecosystem, type: r.type }]);
    setSearch(''); setResults([]);
  }
  function removeComponent(cid: string) { setComponents(components.filter((c) => c.id !== cid)); }

  async function doPublish(expectedHead: string | null | undefined) {
    if (!id) return;
    await api.publishProject(id, {
      state: { ...d?.state, templateId: d?.state?.templateId || null, components, notes, workflow, ...(productionReview ? {productionReview} : {}) },
      message: message || undefined,
      author: d?.project.author,
      expectedHead: expectedHead || undefined,
    });
    setMessage('');
    setConflict(null);
    announceMilestone('saved');
    load();
  }

  async function saveState() {
    if (!id) return;
    setBusy(true);
    try {
      await doPublish(d?.head);
    } catch (e: any) {
      // Optimistic-concurrency conflict: another editor saved first. Preserve THIS
      // editor's unsaved draft (do NOT call load()); fetch latest separately and let
      // them compare and choose overwrite/discard.
      if (/reload|save happened|409/i.test(e.message || '')) {
        try {
          const fresh = await api.project(id);
          enterConflict({ notes, components }, { head: fresh.head, notes: fresh.state?.notes || '', components: fresh.state?.components || [] });
          setConflict({ head: fresh.head, state: fresh.state, versions: fresh.versions });
          flash('Someone saved first — your draft is preserved');
        } catch { setActionError(e.message); }
      } else {
        setActionError(e.message);
      }
    } finally { setBusy(false); }
  }

  async function overwriteWithMine() {
    if (!conflict) return;
    setBusy(true);
    try {
      const r = resolveOverwrite({ notes, components }, { head: conflict.head, notes: '', components: [] });
      await doPublish(r.expectedHead); // keeps my notes/components, targets latest head
    } catch (e: any) { setActionError(e.message); } finally { setBusy(false); }
  }

  function discardMine() {
    if (!conflict) return;
    const r = resolveDiscard({ head: conflict.head, notes: conflict.state?.notes || '', components: conflict.state?.components || [] });
    setNotes(r.notes);
    setComponents(r.components);
    setConflict(null);
    load();
    flash('Discarded your changes — loaded latest');
  }

  function forkFrom(ref: string) {
    setForkRevision(ref); setForkTitle(`${d?.project.title} Riff`); setForkAuthor(''); setActionError('');
  }
  async function confirmFork(event:React.FormEvent) {
    event.preventDefault();
    if (!id || !forkRevision || busy) return;
    setBusy(true); setActionError('');
    try {
      const out = await api.forkProject(id, {fromRef:forkRevision,title:forkTitle,author:forkAuthor || 'anonymous'});
      setForkRevision(null); setD(null); setConflict(null);
      nav(`/project/${out.project.id}`);
    } catch (error) { setActionError((error as Error).message); }
    finally {setBusy(false);}
  }

  if (err) return <div className="panel mt24">Project not found. <Link to="/projects">Back to Projects</Link></div>;
  if (!d) return <Spinner />;

  const p = d.project;
  const triviaRiff = readTriviaRiff(d?.state?.triviaRiff);
  const game = savedGame((d.state as { game?: unknown } | null)?.game);

  return (
    <>
      <div className="row mt24"><Link className="muted" to="/projects">← Projects</Link></div>
      <div className="detail-head">
        <div style={{ flex: 1 }}>
          <div className="pill-row" style={{ marginBottom: 10 }}>
            {p.ecosystem && <span className={`badge dot ${p.ecosystem === 'tari-ootle' ? 'native' : 'ext'}`}>{ecoLabel(p.ecosystem)}</span>}
            {p.forkedFrom && <span className="badge">forked from {p.forkedFrom}</span>}
            <PopularityChip p={p.popularity} />
            {p.forks ? <span className="badge">{p.forks} fork{p.forks === 1 ? '' : 's'}</span> : null}
          </div>
          <h1>{p.title}</h1>
          <p className="muted mt8">{p.description || 'No description'} · by {p.author}</p>
          {p.forkedFrom && (
            <p className="faint mt8">Forked from <Link to={`/project/${p.forkedFrom}`} style={{ color: 'var(--accent)' }}>{p.forkedFrom}</Link> at {p.forkedAtRef?.slice(0, 8)}</p>
          )}
        </div>
        <div className="row">{productionReview&&<a className="btn primary" href="#production-review">Creative review ↓</a>}<Link className="btn" to={`/skills/learning-loop?project=${encodeURIComponent(p.id)}`}>Capture a lesson ↗</Link><StarButton kind="project" id={p.id} initialStars={p.engagement?.stars ?? 0} /></div>
      </div>

      {d.state?.guessingGameRiff && <Link className="btn primary mt16" to={`/create/guessing-game?project=${encodeURIComponent(p.id)}`}>Edit this guessing-game Riff ↗</Link>}
      {triviaRiff && <section className="mt16" aria-label="Saved Daily Ritual Riff"><div className="row" style={{justifyContent: 'space-between', marginBottom: 12}}><h2>Play this Riff.</h2><Link className="btn primary" to={`/create/trivia?project=${encodeURIComponent(p.id)}`}>Edit this trivia Riff ↗</Link></div><TriviaRiffPreview riff={triviaRiff}/></section>}
      {!triviaRiff && game && <ProjectGame game={game} />}
      <ReleaseNext project={p}/>
      {actionError&&<p role="alert" className="project-error">{actionError}</p>}
      {forkRevision&&<form className="panel fork-form" onSubmit={confirmFork}><span className="release-label">MAKE IT YOUR OWN</span><h2>Start your Riff</h2><p>Fork saved recipe {forkRevision.slice(0,8)} with its history and attribution. This creates a workspace, not a new playable build.</p><label className="lbl">Project name<input className="field" required maxLength={120} value={forkTitle} onChange={event=>setForkTitle(event.target.value)}/></label><label className="lbl">Your creator name<input className="field" maxLength={80} value={forkAuthor} onChange={event=>setForkAuthor(event.target.value)}/></label><div className="row mt16"><button className="btn primary" disabled={busy}>{busy?'Creating your Riff…':'Create my Riff'}</button><button type="button" className="btn" disabled={busy} onClick={()=>setForkRevision(null)}>Cancel</button></div></form>}
      {d.head && (
        <div id="fork-this-project" className="panel fork-form mt16">
          <span className="release-label">MAKE A COPY</span>
          <h2>Fork this project</h2>
          <p>Creates your workspace from this saved history. It is not a new published playable.</p>
          <div className="row mt16">
            <button type="button" className="btn primary" disabled={busy} onClick={() => forkFrom(d.head!)}>Fork this project</button>
          </div>
        </div>
      )}
      <div className="project-workspace with-side mt16">
        <section style={{ order: 2 }}>
          {conflict && (
            <div className="panel conflict-panel">
              <h3>⚠ Someone saved a newer version</h3>
              <p className="muted mt8">Your unsaved changes are kept below — nothing was lost. Compare and choose how to proceed.</p>
              <p className="muted">Workflow: latest has {conflict.state?.workflow?.nodes.length ?? 0} nodes; your draft has {workflow.nodes.length}. Saving yours replaces the latest diagram and production review too. Reload latest to inspect their complete review before replacing it.</p><div className="conflict-compare mt16">
                <div>
                  <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest saved</h4>
                  <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>{(conflict.state?.components?.length ?? 0)} component(s)</p>
                  <p className="muted" style={{ fontSize: 13, marginTop: 6, whiteSpace: 'pre-wrap' }}>{conflict.state?.notes || '(no notes)'}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your unsaved draft</h4>
                  <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>{components.length} component(s)</p>
                  <p className="muted" style={{ fontSize: 13, marginTop: 6, whiteSpace: 'pre-wrap' }}>{notes || '(no notes)'}</p>
                </div>
              </div>
              <div className="row mt16">
                <button className="btn primary" onClick={overwriteWithMine} disabled={busy}>Save mine over latest</button>
                <button className="btn" onClick={discardMine} disabled={busy}>Discard mine &amp; load latest</button>
                <button className="btn" onClick={() => setConflict(null)} disabled={busy}>Keep editing</button>
              </div>
            </div>
          )}
          {d.state?.recipe && !validRecipeSnapshot(d.state.recipe) && <p role="alert">This saved recipe configuration is unsupported or incomplete. Project history and notes remain available; fork a valid historical version to continue.</p>}
          {validRecipeSnapshot(d.state?.recipe) && <div className="panel mt16">
            <span className="badge">Recipe configuration · not deployed</span>
            <h3 className="mt8">{d.state.recipe.recipe.title} · v{d.state.recipe.recipe.version}</h3>
            <dl className="kv mt16">{Object.entries(d.state.recipe.parameters).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl>
            <h4 className="mt16">Next: implement and test the composition</h4>
            <p className="muted">{d.state.recipe.adapter?.status}</p>
            <ol className="steps">{d.state.recipe.adapter?.steps.map(step=><li key={step}>{step}</li>)}</ol>
            <ul>{d.state.recipe.adapter?.limitations.map(note=><li key={note}>{note}</li>)}</ul>
            <details className="mt16"><summary>Saved recipe manifest and source pins</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(d.state.recipe,null,2)}</pre></details>
          </div>}
          <div className="panel mt16"><h3>Choose or create assets</h3><Link className="btn" to={`/studio?project=${encodeURIComponent(p.id)}`}>Open in Studio ↗</Link><p className="muted mt8">Add asset packs, individual assets and creation workflows to this project. Save any edits below before opening the library.</p><Link className="btn mt16" to={`/create/assets?project=${encodeURIComponent(p.id)}`}>Open asset library</Link></div>
          <ProjectHistory key={p.id} id={p.id} title={p.title} head={d.head} versions={d.versions} onChanged={load} onDeleted={()=>nav('/projects')}/>
          <VersionCompare projectId={p.id} current={d.state} versions={d.versions}/>
          <ProductionReview value={productionReview} onChange={setProductionReview} projectId={p.id} onSave={saveState} busy={busy}/>
          <WorkflowEditor graph={workflow} onChange={setWorkflow} resources={{...d.state,components}} />
          <div className="panel">
            <h3>Project workspace</h3><p className="muted mt8">Keep supporting resources with your project. Adding a reference does not establish executable compatibility.</p>
            <p className="muted mt8">{d.state?.templateId ? <>Base template: <Link to={`/resource/${encodeURIComponent(d.state.templateId)}`} style={{ color: 'var(--accent)' }}>{d.state.templateId}</Link></> : 'No base template'}</p>

            <label className="lbl">Attach a supporting resource</label>
            <input className="field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a resource to reference… e.g. inventory, token, crafting" />
            {results.length > 0 && (
              <div className="panel mt8" style={{ padding: 8 }}>
                {results.map((r) => (
                  <button type="button" key={r.id} className="facet resource-attach" onClick={() => addComponent(r)}>
                    <span>{r.title} <span className="faint">· {ecoLabel(r.ecosystem)} · {r.type}</span></span>
                    <span className="n">add +</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pill-row mt16">
              {components.length === 0 && <span className="faint">No supporting resources attached yet.</span>}
              {components.map((c) => (
                <span key={c.id} className="tag" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  {c.title}
                  <button className="btn small" style={{ padding: '0 6px', borderColor: 'transparent', background: 'transparent', color: 'var(--danger)' }} onClick={() => removeComponent(c.id)}>×</button>
                </span>
              ))}
            </div>

            <label className="lbl">Notes</label>
            <textarea className="field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Design notes, decisions, what changed…" />

            <div className="row mt16">
              <input className="field" style={{ flex: 1 }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Version message (e.g. 'Added token economy')" />
              <button className="btn primary" onClick={saveState} disabled={busy || (d.state?.recipe != null && !validRecipeSnapshot(d.state.recipe))}>Save state</button>
            </div>
          </div>
        </section>

        <aside style={{ order: 1 }}>
          <PopularityPanel p={p.popularity} />
          <div className="panel mt16">
            <h4 style={{ fontSize: 13, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Version history</h4>
            <p className="faint mt8" style={{ fontSize: 12 }}>Every saved state is a git commit. Fork from any point.</p>
            <div className="timeline mt8">
              {d.versions.map((v) => (
                <div className="commit" key={v.hash}>
                  <span className="hash">{v.shortHash}</span>
                  <div>
                    <div className="subject">{v.subject}</div>
                    <div className="faint" style={{ fontSize: 12 }}>{v.author} · {new Date(v.date).toLocaleString()}</div>
                  </div>
                  <button className="btn small" style={{ marginLeft: 'auto' }} onClick={() => forkFrom(v.hash)}>Fork here</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="panel mt24"><h3>Share, get feedback, keep improving</h3><p className="muted mt8">Share this project URL with people who can access this hub. They can leave feedback below and create a Riff from a saved version. This does not publish your app to the internet.</p><div className="row mt16"><button className="btn" onClick={()=>navigator.clipboard.writeText(window.location.href).then(()=>flash('Project link copied')).catch(()=>flash('Copy the URL from your browser'))}>Copy project link</button><Link className="btn" to="/projects">Discover other projects</Link><Link className="btn" to="/learn">Find a walkthrough</Link></div></section>
      <Comments kind="project" id={p.id} />

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
