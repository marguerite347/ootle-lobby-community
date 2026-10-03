import {fetchCreatorIdeas} from '../components/CreatorIdeas';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, type Resource } from '../api';
import { readSetupPlan } from '../components/toolkitSetup';
import { ecoLabel } from '../ui';

export default function Studio() {
  const [params] = useSearchParams();
  const templateId = params.get('template');
  const ideaId = params.get('idea');
  const [ideaLoading, setIdeaLoading] = useState(!!ideaId);
  const [ideaError, setIdeaError] = useState('');
  const [template, setTemplate] = useState<Resource | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [busy, setBusy] = useState(false);
  const [error,setError] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(!!templateId);
  const [templateError, setTemplateError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    let active = true;
    setTemplate(null); setTemplateError(''); setLoadingTemplate(!!templateId);
    if (templateId) api.resource(templateId).then((r) => {
      if (active) { setTemplate(r); setTitle((current) => current || `My ${r.title}`); }
    }).catch(() => { if (active) setTemplateError('Could not load the selected starter. Return to the library and choose it again.'); })
      .finally(() => { if (active) setLoadingTemplate(false); });
    return () => { active = false; };
  }, [templateId]);


  useEffect(() => {
    let active = true;
    setIdeaLoading(!!ideaId); setIdeaError('');
    if (ideaId) fetchCreatorIdeas().then(result => {
      if (!active) return;
      const idea = result.ideas.find(item => item.id === ideaId);
      if (!idea) {setIdeaError('This suggestion has rotated out or needs review. Return to Create for current ideas.'); return;}
      setTitle(idea.title); setDescription(idea.brief);
    }).catch(() => {if(active) setIdeaError('Could not load this suggestion. Return to Create and try again.');})
      .finally(() => {if(active) setIdeaLoading(false);});
    return () => {active = false;};
  }, [ideaId]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (ideaLoading || ideaError || loadingTemplate || templateError || (templateId && !template)) return;
    setBusy(true); setError('');
    try {
      const { project } = await api.createProject({
        title,
        description,
        author: author || 'anonymous',
        templateId: template?.id || null,
        ecosystem: template?.ecosystem || null,
        components: [],
        setupPlan: readSetupPlan(),
      });
      nav(`/project/${project.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Save your starting point</h1>
          <div className="sub">Compose a project from a template, save versions in Git, and fork any saved revision. Saving stores project configuration — it does not compile or deploy a game or contract.</div>
        </div>
      </div>

      <div className="with-side mt16" style={{maxWidth:760,display:'block'}}>
        <form className="panel" onSubmit={createProject}>
          {error&&<p role="alert">{error}</p>}
          {ideaLoading && <p role="status">Loading challenge brief…</p>}
          {ideaError && <p role="alert">{ideaError}</p>}
          <Link to="/create">← Choose a starting point</Link><h3 className="mt16">Project details</h3>
          {loadingTemplate && <p role="status">Loading selected starter…</p>}
          {templateError && <p role="alert">{templateError}</p>}
          {template ? (
            <div className="notice mt16">
              Base template: <strong>{template.title}</strong> <span className="faint">({ecoLabel(template.ecosystem)})</span>
            </div>
          ) : (
            <div className="notice mt16">{templateId ? 'Selected starter is not available yet.' : 'No base template selected.'} Pick one from the <Link to="/explore?type=starter">catalog</Link> or start blank.</div>
          )}
          <label className="lbl">Project title</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My on-chain guessing game" required />
          <label className="lbl">Description</label>
          <textarea className="field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you making?" />
          <label className="lbl">Your name (attribution)</label>
          <input className="field" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="anonymous" />
          <div className="mt16"><button className="btn primary" disabled={!!ideaError || ideaLoading || busy || !title || loadingTemplate || !!templateError || (!!templateId && !template)}>Create project</button></div>
        </form>


      </div>
    </>
  );
}
