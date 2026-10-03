import {useEffect, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {strToU8, zipSync} from 'fflate';
import {configureRiff, EDITABLE_FILES, GUESSING_GUIDE, newGuessingRiff, SOURCE_REVISION, SOURCE_URL, SOURCE_LICENSE, sourceNotes, type GuessingRiff, type RiffSettings, type SourceFile} from '../guessingGame/riff';
import {guessingPreview} from '../guessingGame/preview';
import './GuessingGameEditor.css';


export default function GuessingGameEditor() {
  const [draft, setDraft] = useState<GuessingRiff>(newGuessingRiff);
  const [downloadedDraft, setDownloadedDraft] = useState(() => JSON.stringify(newGuessingRiff()));
  const [tab, setTab] = useState<'design' | 'code'>('design');
  const [file, setFile] = useState<SourceFile>('src/lib.rs');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [previewRun, setPreviewRun] = useState(0);
  const previewFrame = useRef<HTMLIFrameElement | null>(null);
  const [previewHeight, setPreviewHeight] = useState(624);
  const serialized = JSON.stringify(draft);
  const dirty = serialized !== downloadedDraft;
  const preview = useMemo(() => guessingPreview(draft.settings), [draft.settings]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = '';};
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    const resizePreview = (event: MessageEvent) => {
      if (event.source !== previewFrame.current?.contentWindow || event.data?.type !== 'guessing-preview-size') return;
      const height = event.data.height;
      if (Number.isFinite(height) && height >= 160 && height <= 3000) setPreviewHeight(Math.ceil(height));
    };
    window.addEventListener('message', resizePreview);
    return () => window.removeEventListener('message', resizePreview);
  }, []);

  function changeSettings(change: Partial<RiffSettings>) {
    try {setDraft(configureRiff(draft, {...draft.settings, ...change})); setError(''); setStatus('');}
    catch (reason) {setError((reason as Error).message);}
  }

  function download() {
    const files = {...draft.files, 'index.html': preview, 'riff.json': JSON.stringify(draft, null, 2), 'README.md': sourceNotes(draft), 'UPSTREAM_LICENSE.txt': SOURCE_LICENSE};
    const archive = zipSync(Object.fromEntries(Object.entries(files).map(([path, content]) => [path, strToU8(content)])));
    const url = URL.createObjectURL(new Blob([Uint8Array.from(archive).buffer], {type: 'application/zip'}));
    const link = document.createElement('a'); link.href = url; link.download = 'ootle-guessing-game-riff.zip'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadedDraft(serialized); setStatus('Source downloaded.');
  }

  return <div className="guessing-editor">
    <header className="guessing-editor-header">
      <div><Link to="/#daily-spark">← Daily Ritual</Link><h1>A little twist. <em>Your game.</em></h1><p>Customize a guessing game. Try it, then download the source.</p><Link to="/create/trivia">Riff the Daily Ritual instead →</Link></div>
      <div className="guessing-editor-actions"><button className="season-button" onClick={download}>Download source ↓</button></div>
    </header>
    <div className="guessing-save-status" role="status">{status || 'Not saved online. Download the source to keep your changes.'}</div>
    {error && <p className="guessing-error" role="alert">{error} Your edits are still here.</p>}
    <div className="guessing-workspace">
      <section className="guessing-controls" aria-label="Game editor">
        <div className="guessing-tabs" role="tablist" aria-label="Editor mode"><button role="tab" id="design-tab" aria-selected={tab === 'design'} aria-controls="design-panel" onClick={() => setTab('design')}>Design</button><button role="tab" id="code-tab" aria-selected={tab === 'code'} aria-controls="code-panel" onClick={() => setTab('code')}>Ootle code</button></div>
        {tab === 'design' ? <div role="tabpanel" id="design-panel" aria-labelledby="design-tab">
          <fieldset>
            <label>Game title<input maxLength={80} value={draft.settings.title} onChange={event => changeSettings({title: event.target.value})}/></label>
            <label>Round invitation<textarea rows={3} maxLength={240} value={draft.settings.prompt} onChange={event => changeSettings({prompt: event.target.value})}/></label>
            <label>Prize name<input maxLength={80} value={draft.settings.prizeName} onChange={event => changeSettings({prizeName: event.target.value})}/></label>
            <label>Players per round<select value={draft.settings.maxPlayers} onChange={event => changeSettings({maxPlayers: Number(event.target.value)})}>{Array.from({length:10}, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? 'player' : 'players'}</option>)}</select></label>
            <label className="guessing-color">Accent color<input type="color" value={draft.settings.accent} onChange={event => changeSettings({accent: event.target.value})}/></label>
          </fieldset>

        </div> : <div role="tabpanel" id="code-panel" aria-labelledby="code-tab">
          <label className="guessing-file">Template file<select value={file} onChange={event => setFile(event.target.value as SourceFile)}>{EDITABLE_FILES.map(path => <option key={path}>{path}</option>)}</select></label>
          <textarea className="guessing-source" aria-label={`Source code: ${file}`} spellCheck={false} maxLength={100000} value={draft.files[file]} onChange={event => {setDraft({...draft, files: {...draft.files, [file]: event.target.value}}); setStatus('');}}/>
          <p className="guessing-note">Rust edits are included in your download. Compile and test them before deploying.</p>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">Official source · {SOURCE_REVISION.slice(0, 8)} ↗</a>
        </div>}
      </section>
      <section className="guessing-preview" aria-label="Playable game preview">
        <div className="guessing-preview-header"><div><h2>Play a round.</h2></div><button className="btn" onClick={() => setPreviewRun(run => run + 1)}>Restart ↻</button></div>
        <iframe ref={previewFrame} key={previewRun} style={{height: previewHeight}} srcDoc={preview} title="Guessing-game visual preview" sandbox="allow-scripts"/>
        <p className="guessing-note">Browser preview · no wallet or real rewards. <a href={GUESSING_GUIDE} target="_blank" rel="noreferrer">Build and deploy with the Ootle guide ↗</a></p>
      </section>
    </div>
  </div>;
}
