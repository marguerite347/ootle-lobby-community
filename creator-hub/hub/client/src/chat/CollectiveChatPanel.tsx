import {safeHref} from '../../../shared/safeLinks.mjs';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  AUTHOR_KIND_OPTIONS,
  KIND_OPTIONS,
  ROOM_ID,
  copy,
} from './copy';
import {
  type AuthorKind,
  type CollectiveMessage,
  type MessageKind,
  fetchRoom,
  postMessage,
} from './chatApi';

type Props = {
  /** True while the Project room tab is on screen; polling stops otherwise. */
  isActive: boolean;
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function displayLabel(m: CollectiveMessage): string {
  if (m.label) return m.label;
  if (m.authorKind === 'Agent' && m.roleName) return `Agent · ${m.roleName}`;
  return m.authorKind;
}

export default function CollectiveChatPanel({ isActive }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<CollectiveMessage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [author, setAuthor] = useState('Human');
  const [authorKind, setAuthorKind] = useState<AuthorKind>('Human');
  const [roleName, setRoleName] = useState('');
  const [kind, setKind] = useState<MessageKind>('working');
  const [body, setBody] = useState('');
  const [artifactUrl, setArtifactUrl] = useState('');

  const load = useCallback(async () => {
    try {
      const room = await fetchRoom(ROOM_ID);
      setMessages(room.messages);
      setLoadError(null);
    } catch {
      setLoadError(copy.loadError);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;
    void load();
    const timer = window.setInterval(() => void load(), 12000);
    return () => window.clearInterval(timer);
  }, [isActive, load]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    setSendError(null);
    const optimistic: CollectiveMessage = {
      id: `local-${Date.now()}`,
      at: new Date().toISOString(),
      author: author.trim() || 'anonymous',
      authorKind,
      roleName: authorKind === 'Agent' ? roleName.trim() || undefined : undefined,
      body: text,
      kind,
      artifactUrl: artifactUrl.trim() || undefined,
      clientState: 'queued',
      label:
        authorKind === 'Agent' && roleName.trim()
          ? `Agent · ${roleName.trim()}`
          : authorKind,
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const saved = await postMessage({
        author: author.trim() || 'anonymous',
        authorKind,
        roleName: authorKind === 'Agent' ? roleName.trim() || undefined : undefined,
        body: text,
        kind,
        artifactUrl: artifactUrl.trim() || undefined,
      });
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
      setBody('');
      setArtifactUrl('');
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...m, clientState: 'failed' } : m)),
      );
      setSendError(copy.sendError);
    } finally {
      setBusy(false);
    }
  }

  async function retryFailed(message: CollectiveMessage) {
    if (busy) return;
    setBusy(true);
    setSendError(null);
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, clientState: 'queued' } : m)),
    );
    try {
      const saved = await postMessage({
        author: message.author,
        authorKind: message.authorKind,
        roleName: message.roleName,
        body: message.body,
        kind: message.kind,
        artifactUrl: message.artifactUrl,
      });
      setMessages((prev) => prev.map((m) => (m.id === message.id ? saved : m)));
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, clientState: 'failed' } : m)),
      );
      setSendError(copy.sendError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="collective-chat-project">
      <p className="community-chat-room">{copy.roomName}</p>
      <p className="collective-chat-bridge">{copy.bridgeAbsent}</p>

      <div className="collective-chat-messages" ref={listRef} aria-live="polite">
        {loadError ? <p className="collective-chat-error">{loadError}</p> : null}
        {!loadError && messages.length === 0 ? (
          <p className="collective-chat-empty">{copy.emptyRoom}</p>
        ) : null}
        {messages.map((m) => (
          <article
            key={m.id}
            className="collective-chat-msg"
            data-state={m.clientState}
            data-kind={m.kind}
          >
            <div className="collective-chat-msg-meta">
              <span className="collective-chat-chip">{displayLabel(m)}</span>
              <span className="collective-chat-chip" data-kind={m.kind}>
                {m.kind}
              </span>
              <span>{m.author}</span>
              <time dateTime={m.at}>{formatTime(m.at)}</time>
              <span aria-label={`transport ${m.clientState}`}>{m.clientState}</span>
            </div>
            <p className="collective-chat-msg-body">{m.body}</p>
            {m.artifactUrl ? (
              <a
                className="collective-chat-msg-artifact"
                href={safeHref(m.artifactUrl.startsWith('http') ? m.artifactUrl : undefined)}
                target={m.artifactUrl.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {m.artifactUrl}
              </a>
            ) : null}
            {m.clientState === 'failed' ? (
              <button
                type="button"
                className="collective-chat-icon-btn"
                onClick={() => void retryFailed(m)}
              >
                {copy.retry}
              </button>
            ) : null}
          </article>
        ))}
      </div>

      <form className="collective-chat-composer" onSubmit={(e) => void onSubmit(e)}>
        <p className="collective-chat-helper">{copy.composerHelper}</p>
        <div className="collective-chat-composer-row">
          <label>
            Author
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={80}
              placeholder={copy.authorPlaceholder}
              required
            />
          </label>
          <label>
            Identity
            <select
              value={authorKind}
              onChange={(e) => setAuthorKind(e.target.value as AuthorKind)}
            >
              {AUTHOR_KIND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {authorKind === 'Agent' ? (
            <label>
              Role name
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                maxLength={80}
                placeholder="e.g. QA"
              />
            </label>
          ) : null}
          <label>
            Kind
            <select value={kind} onChange={(e) => setKind(e.target.value as MessageKind)}>
              {KIND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Update
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            placeholder={copy.bodyPlaceholder}
            required
          />
        </label>
        <label>
          Artifact
          <input
            value={artifactUrl}
            onChange={(e) => setArtifactUrl(e.target.value)}
            maxLength={2000}
            placeholder={copy.artifactPlaceholder}
          />
        </label>
        {sendError ? <p className="collective-chat-error">{sendError}</p> : null}
        <button className="collective-chat-send" type="submit" disabled={busy || !body.trim()}>
          {copy.send}
        </button>
      </form>
    </div>
  );
}
