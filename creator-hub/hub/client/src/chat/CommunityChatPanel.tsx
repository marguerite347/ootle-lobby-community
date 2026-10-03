import {useSampleConversation} from './sampleConversation';
import {createSnapshotPoller} from './communitySnapshotPoller';
import { FormEvent, KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { communityCopy } from './copy';
import {
  type CommunityMessage,
  CommunityChatError,
  fetchCommunityMessages,
  postCommunityMessage,
  reportCommunityMessage,
} from './communityChatApi';
import {
  COMMUNITY_POLL_INTERVAL_MS,
  STORAGE_KEYS,
  ensureClientId,
  mergeCommunityMessages,
  readReportedIds,
  readStoredValue,
  writeReportedIds,
  writeStoredValue,
} from './chatSidebarState';

// Mirrors server/communityChat.mjs LIMITS; the server stays the authority.
const NAME_MAX_LENGTH = 32;
const BODY_MAX_LENGTH = 500;
const NEAR_BOTTOM_PX = 80;

type Props = {
  /** True while this room is on screen; polling stops otherwise. */
  isActive: boolean;
  roomId?: string;
  roomTitle?: string;
};

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function usePageVisible(): boolean {
  const [isVisible, setIsVisible] = useState(() => document.visibilityState !== 'hidden');
  useEffect(() => {
    const onChange = () => setIsVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return isVisible;
}

function useCommunityMessages(shouldPoll: boolean, roomId?: string) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [hasLoadError, setHasLoadError] = useState(false);
  const pollerRef = useRef<ReturnType<typeof createSnapshotPoller> | null>(null);
  if (!pollerRef.current) {
    // Full bounded snapshots include moderator restores before any old message cursor.
    // The backend's incremental endpoint does not expose those restore events.
    pollerRef.current = createSnapshotPoller(
      () => fetchCommunityMessages(undefined, roomId),
      (listing) => {
        setMessages(mergeCommunityMessages([], listing.messages, listing.removedIds, true));
        setHasLoadError(false);
      },
      () => setHasLoadError(true),
    );
  }
  const poll = useCallback(() => pollerRef.current!.refresh(), []);
  const applyMessages = useCallback((update: (current: CommunityMessage[]) => CommunityMessage[]) => {
    setMessages(update);
    void pollerRef.current!.afterLocalWrite();
  }, []);

  useEffect(() => {
    if (!shouldPoll) return;
    void poll();
    const timer = window.setInterval(() => void poll(), COMMUNITY_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [shouldPoll, poll]);

  return { messages, hasLoadError, applyMessages };
}

export default function CommunityChatPanel({ isActive, roomId, roomTitle }: Props) {
  const nameId = useId();
  const nameHelperId = useId();
  const bodyId = useId();
  const bodyHintId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const storage = browserStorage();
  const [clientId] = useState(() => ensureClientId(storage));
  const [reportedIds, setReportedIds] = useState(() => readReportedIds(storage));
  const [ownIds, setOwnIds] = useState<Set<string>>(() => new Set());
  const [displayName, setDisplayName] = useState(() => readStoredValue(storage, STORAGE_KEYS.displayName) || '');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  const isPageVisible = usePageVisible();
  const { messages, hasLoadError, applyMessages } = useCommunityMessages(isActive && isPageVisible, roomId);

  const samples = useSampleConversation(isActive && isPageVisible && !roomId);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    if (distanceFromBottom < list.clientHeight + NEAR_BOTTOM_PX) list.scrollTop = list.scrollHeight;
  }, [messages.length, samples.length]);

  function updateDisplayName(value: string) {
    setDisplayName(value);
    writeStoredValue(storage, STORAGE_KEYS.displayName, value);
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    if (isSending || !draft.trim() || !displayName.trim()) return;
    setIsSending(true);
    setComposerError(null);
    try {
      const saved = await postCommunityMessage({ name: displayName, body: draft, clientId }, roomId);
      setOwnIds((current) => new Set(current).add(saved.id));
      applyMessages((current) => mergeCommunityMessages(current, [saved], [], false));
      setDraft('');
    } catch (error) {
      if (!(error instanceof CommunityChatError)) {
        setComposerError(communityCopy.sendError);
        return;
      }
      // Never keep a key or seed phrase sitting in the draft box.
      if (error.code === 'secret') setDraft('');
      setComposerError(error.message);
    } finally {
      setIsSending(false);
    }
  }

  function onDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void sendMessage();
  }

  async function reportMessage(message: CommunityMessage) {
    setReportStatus(null);
    try {
      const result = await reportCommunityMessage(message.id, clientId, roomId);
      const nextReported = new Set(reportedIds).add(message.id);
      setReportedIds(nextReported);
      writeReportedIds(storage, nextReported);
      if (result.hidden) applyMessages((current) => mergeCommunityMessages(current, [], [message.id], false));
      setReportStatus(communityCopy.reportThanks);
    } catch (error) {
      setReportStatus(error instanceof CommunityChatError ? error.message : communityCopy.reportError);
    }
  }

  return (
    <div className="community-chat">
      <p className="community-chat-room">{roomTitle || communityCopy.roomName}</p>
      <details className="community-chat-rules"><summary>Chat rules</summary><p>{communityCopy.rulesNote}</p></details>

      <ol className="community-chat-messages" ref={listRef} role="log" aria-live="polite" aria-relevant="additions">
        {hasLoadError ? <li className="collective-chat-error">{communityCopy.loadError}</li> : null}
        {!roomId && <li className="chat-sample-label">Sample conversation <span>· fictional players</span></li>}
        {!roomId && samples.map(message => <li key={message.at} className="community-chat-msg chat-sample-message">
          <span className="community-chat-name" style={{color: message.color}}>{message.name}</span><span className="chat-colon">: </span><span className="community-chat-msg-body">{message.body}</span>
        </li>)}
        {messages.length > 0 && <li className="chat-sample-label">{roomId ? 'Room messages' : 'Community messages'}</li>}
        {roomId && !hasLoadError && messages.length === 0 && <li className="chat-sample-label">Say hello and share how you’d like to help.</li>}
        {messages.map((message) => {
          const isOwn = ownIds.has(message.id);
          const isReported = reportedIds.has(message.id);
          return (
            <li key={message.id} className="community-chat-msg" data-own={isOwn || undefined}>
              <div className="community-chat-msg-meta">
                <span className="community-chat-name">{message.name}</span>
                <time dateTime={message.at}>{formatTime(message.at)}</time>
                {isOwn ? null : (
                  <button
                    type="button"
                    className="community-chat-report"
                    onClick={() => void reportMessage(message)}
                    disabled={isReported}
                    aria-label={isReported ? communityCopy.reported : communityCopy.reportLabel(message.name)}
                  >
                    {isReported ? communityCopy.reported : communityCopy.report}
                  </button>
                )}
              </div>
              <p className="community-chat-msg-body">{message.body}</p>
            </li>
          );
        })}
      </ol>
      <p className="community-chat-status" role="status">
        {reportStatus}
      </p>

      <form className="collective-chat-composer community-chat-composer" onSubmit={(event) => void sendMessage(event)}>
        <label htmlFor={nameId}>{communityCopy.nameLabel}</label>
        <input
          id={nameId}
          value={displayName}
          onChange={(event) => updateDisplayName(event.target.value)}
          maxLength={NAME_MAX_LENGTH}
          placeholder={communityCopy.namePlaceholder}
          aria-describedby={nameHelperId}
          autoComplete="nickname"
          required
        />
        <p id={nameHelperId} className="collective-chat-helper">
          {communityCopy.nameHelper}
        </p>
        <label htmlFor={bodyId}>{communityCopy.bodyLabel}</label>
        <textarea
          id={bodyId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onDraftKeyDown}
          maxLength={BODY_MAX_LENGTH}
          placeholder={communityCopy.bodyPlaceholder}
          aria-describedby={bodyHintId}
          required
        />
        <div className="community-chat-composer-footer">
          <p id={bodyHintId} className="collective-chat-helper">
            {communityCopy.enterHint} <span>{communityCopy.characterCount(draft.length, BODY_MAX_LENGTH)}</span>
          </p>
          <button
            className="collective-chat-send"
            type="submit"
            disabled={isSending || !draft.trim() || !displayName.trim()}
          >
            {isSending ? communityCopy.sending : communityCopy.send}
          </button>
        </div>
        <p className="collective-chat-error" role="alert">
          {composerError}
        </p>
      </form>
    </div>
  );
}
