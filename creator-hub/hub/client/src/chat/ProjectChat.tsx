import {useEffect, useState, type FormEvent} from 'react';
import CommunityChatPanel from './CommunityChatPanel';
import {ensureClientId, readStoredValue, STORAGE_KEYS, writeStoredValue} from './chatSidebarState';
import './ProjectChat.css';

type ProjectRoom = {id: string; title: string; description: string; creator: string; createdAt: string};
const BASE = '/api/project-chat/rooms';

function storage() {
  try { return window.localStorage; } catch { return undefined; }
}

async function request<T>(url: string, body?: object): Promise<T> {
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET', cache: 'no-store',
    headers: {'Content-Type': 'application/json'},
    ...(body ? {body: JSON.stringify(body)} : {}),
  });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error || 'Could not load project rooms.'), {code: result.code});
  return result;
}

function CreateRoom({onCreated, onCancel}: {onCreated: (room: ProjectRoom) => void; onCancel: () => void}) {
  const [name, setName] = useState(() => readStoredValue(storage(), STORAGE_KEYS.displayName) || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const room = await request<ProjectRoom>(BASE, {name, title, description, clientId: ensureClientId(storage())});
      writeStoredValue(storage(), STORAGE_KEYS.displayName, name);
      onCreated(room);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not create your room. Try again.');
      if ((failure as {code?: string})?.code === 'secret') { setTitle(''); setDescription(''); }
    } finally { setBusy(false); }
  }
  return <form className="project-room-create" onSubmit={submit}>
    <h3>Find your collaborators.</h3>
    <p>Share what you’re building and the help you’re looking for. Your project gets a public chat room anyone here can join.</p>
    <label>Your display name<input required maxLength={32} autoComplete="nickname" value={name} onChange={event => setName(event.target.value)}/></label>
    <label>Project name<input required maxLength={60} value={title} onChange={event => setTitle(event.target.value)} placeholder="What are you making?"/></label>
    <label>About the project<textarea required maxLength={400} value={description} onChange={event => setDescription(event.target.value)} placeholder="Tell us about the idea and how people can help."/></label>
    <p className="project-room-hint">Text only. Your post and room are public.</p>
    {error && <p role="alert" className="collective-chat-error">{error}</p>}
    <div className="project-room-actions"><button type="button" onClick={onCancel}>Cancel</button><button className="project-room-primary" disabled={busy || !name.trim() || !title.trim() || !description.trim()}>{busy ? 'Creating…' : 'Post & create room'}</button></div>
  </form>;
}

export default function ProjectChat({isActive}: {isActive: boolean}) {
  const [rooms, setRooms] = useState<ProjectRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ProjectRoom | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isActive) return;
    let active = true;
    const load = () => request<{rooms: ProjectRoom[]}>(BASE).then(result => {
      if (active) { setRooms(result.rooms); setError(''); }
    }).catch(() => { if (active) setError('Project rooms couldn’t load. We’ll try again shortly.'); });
    void load();
    const timer = window.setInterval(load, 8000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isActive]);

  async function report(room: ProjectRoom) {
    try {
      const result = await request<{hidden: boolean}>(`${BASE}/${room.id}/report`, {clientId: ensureClientId(storage())});
      if (result.hidden) setRooms(current => current.filter(item => item.id !== room.id));
      setError('Thanks. Your report was recorded.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not report this room.'); }
  }

  return <div className="project-chat-shell">
    <div className="project-chat-navigation">
      {activeRoom ? <button onClick={() => { setActiveRoom(null); setCreating(false); }}>← Community</button> : <strong>Community</strong>}
      {!activeRoom && !creating && <button onClick={() => setCreating(true)}>+ Share a project</button>}
    </div>
    {creating && <CreateRoom onCancel={() => setCreating(false)} onCreated={room => {
      setRooms(current => [room, ...current]); setActiveRoom(room); setCreating(false);
    }}/>}
    {!creating && !activeRoom && <details className="project-room-directory">
      <summary>Projects looking for collaborators <span>{rooms.length}</span></summary>
      <div className="project-room-list">
        {!rooms.length && !error && <p>No project rooms yet. Share yours to get one started.</p>}
        {rooms.map(room => <article key={room.id} className="project-room-card">
          <h3>{room.title}</h3><p>{room.description}</p><small>Started by {room.creator}</small>
          <div className="project-room-actions"><button className="project-room-primary" onClick={() => setActiveRoom(room)}>Join room</button><button onClick={() => void report(room)} aria-label={`Report ${room.title}`}>Report</button></div>
        </article>)}
      </div>
    </details>}
    {!creating && activeRoom && <div className="project-room-about"><h3>{activeRoom.title}</h3><p>{activeRoom.description}</p><small>Started by {activeRoom.creator} · Open to everyone here</small></div>}
    {error && !activeRoom && <p className="project-room-status" role="status">{error}</p>}
    <div className="project-chat-conversation" hidden={creating}>
      <CommunityChatPanel key={activeRoom?.id || 'community'} isActive={isActive && !creating} roomId={activeRoom?.id} roomTitle={activeRoom ? 'Connect, share progress and help each other.' : undefined}/>
    </div>
  </div>;
}
