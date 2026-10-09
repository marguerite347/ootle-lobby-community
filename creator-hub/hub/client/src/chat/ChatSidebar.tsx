// Right-docked Community chat with creator-posted project rooms.
// ≥1100px: docked beside the page (collapsed by default, remembers an explicit open preference).
// Narrower: closed by default, opened as a full-height sheet from a "Chat" button.

import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { copy, sidebarCopy } from './copy';
import {
  CHAT_GREETING_EVENT,
  DOCKED_MEDIA_QUERY,
  STORAGE_KEYS,
  type DockPreference,
  readDockPreference,
  writeStoredValue,
} from './chatSidebarState';
import './chat.css';

const POPOUT_WINDOW_NAME = 'hub-collective-chat';
const POPOUT_QUERY_KEY = 'collectiveChat';
const POPOUT_FEATURES = 'popup=yes,width=420,height=760,menubar=no,toolbar=no,location=no,status=no';
const DOCK_ATTRIBUTE = 'data-chat-dock';
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FocusTarget = 'panel' | 'toggle' | null;

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function isChatPopOutWindow(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(POPOUT_QUERY_KEY) === 'popout';
}

function useDockedViewport(): boolean {
  const [isDocked, setIsDocked] = useState(() => window.matchMedia(DOCKED_MEDIA_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(DOCKED_MEDIA_QUERY);
    const onChange = () => setIsDocked(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isDocked;
}

/** Keep Tab inside the modal sheet so keyboard focus cannot wander behind it. */
function trapTabKey(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => element.offsetParent !== null,
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openPopOutWindow() {
  const url = `${window.location.origin}/?${POPOUT_QUERY_KEY}=popout`;
  return window.open(url, POPOUT_WINDOW_NAME, POPOUT_FEATURES) !== null;
}

export default function ChatSidebar() {
  const isPopOut = isChatPopOutWindow();
  const isDockedViewport = useDockedViewport();
  const [dockPreference, setDockPreference] = useState<DockPreference>(() => readDockPreference(browserStorage()));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [greetingAttention, setGreetingAttention] = useState(false);
  const pendingFocus = useRef<FocusTarget>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sidebarId = useId();
  const titleId = useId();

  const isSheetMode = !isPopOut && !isDockedViewport;
  const isOpen = isPopOut || (isDockedViewport ? dockPreference === 'open' : isSheetOpen);

  useEffect(() => {
    if (isOpen) {setGreetingAttention(false); return;}
    let timer: number | undefined;
    const greet = () => {
      setGreetingAttention(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setGreetingAttention(false), 8000);
    };
    window.addEventListener(CHAT_GREETING_EVENT, greet);
    return () => {window.removeEventListener(CHAT_GREETING_EVENT, greet); window.clearTimeout(timer);};
  }, [isOpen]);

  const openSidebar = useCallback(() => {
    pendingFocus.current = 'panel';
    if (isDockedViewport) {
      setDockPreference('open');
      writeStoredValue(browserStorage(), STORAGE_KEYS.dock, 'open');
    } else {
      setIsSheetOpen(true);
    }
  }, [isDockedViewport]);

  const closeSidebar = useCallback(
    ({ shouldRemember = true } = {}) => {
      pendingFocus.current = 'toggle';
      if (isDockedViewport) {
        setDockPreference('collapsed');
        if (shouldRemember) writeStoredValue(browserStorage(), STORAGE_KEYS.dock, 'collapsed');
      } else {
        setIsSheetOpen(false);
      }
    },
    [isDockedViewport],
  );

  // Reserve page space for the dock so it never covers content or the header.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isPopOut) root.setAttribute(DOCK_ATTRIBUTE, 'popout');
    else if (isDockedViewport) root.setAttribute(DOCK_ATTRIBUTE, dockPreference);
    else if (isSheetOpen) root.setAttribute(DOCK_ATTRIBUTE, 'sheet');
    else root.removeAttribute(DOCK_ATTRIBUTE);
    return () => root.removeAttribute(DOCK_ATTRIBUTE);
  }, [isPopOut, isDockedViewport, dockPreference, isSheetOpen]);

  useEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === 'panel') headingRef.current?.focus();
    if (target === 'toggle') toggleRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isSheetMode || !isSheetOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      closeSidebar();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSheetMode, isSheetOpen, closeSidebar]);

  function popOut() {
    if (openPopOutWindow()) closeSidebar({ shouldRemember: false });
  }

  const mode = isPopOut ? 'popout' : isSheetMode ? 'sheet' : 'docked';

  return (
    <div className="collective-chat-root chat-sidebar-root" data-mode={mode}>
      {!isPopOut && !isOpen ? (
        <button
          ref={toggleRef}
          type="button"
          className={`${isDockedViewport ? 'chat-sidebar-edge' : 'collective-chat-launcher'}${greetingAttention ? ' is-greeting-glow' : ''}`}
          aria-expanded={false}
          aria-controls={sidebarId}
          aria-label={copy.launcherOpen}
          onClick={openSidebar}
        >
          <span className="chat-sidebar-toggle-label">{copy.launcherLabel}</span>
        </button>
      ) : null}

      <aside
        id={sidebarId}
        className="chat-sidebar"
        data-mode={mode}
        hidden={!isOpen}
        aria-labelledby={titleId}
        role={isSheetMode ? 'dialog' : 'complementary'}
        aria-modal={isSheetMode ? true : undefined}
        onKeyDown={isSheetMode ? trapTabKey : undefined}
      >
        <div className="chat-sidebar-header">
          <h2 id={titleId} ref={headingRef} tabIndex={-1}>{copy.panelTitle}</h2>
          <div className="collective-chat-header-actions">
            {isPopOut ? null : (
              <button
                type="button"
                className="collective-chat-icon-btn"
                onClick={popOut}
                aria-label={sidebarCopy.popOutLabel}
              >
                {copy.popOut}
              </button>
            )}
            {isPopOut ? null : (
              <button
                type="button"
                className="collective-chat-icon-btn"
                onClick={() => closeSidebar()}
                aria-label={isSheetMode ? copy.launcherClose : sidebarCopy.collapse}
                aria-expanded={true}
                aria-controls={sidebarId}
              >
                <span aria-hidden="true">{isSheetMode ? '✕' : '⟩'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="chat-sidebar-panel">
          <div className="panel"><h3>Chat is read-only</h3><p>Community posting is paused while durable accounts and moderation are connected.</p><a href="https://discord.com/invite/dj34vQSe6d" target="_blank" rel="noopener noreferrer">Join the Tari community on Discord ↗</a></div>
        </div>
      </aside>
    </div>
  );
}
