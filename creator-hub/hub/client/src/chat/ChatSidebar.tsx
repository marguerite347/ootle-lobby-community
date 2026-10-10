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
  lazy,
  Suspense,
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

const POPOUT_QUERY_KEY = 'collectiveChat';
const Community = lazy(() => import('../pages/Community'));
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
  if ((event.target as HTMLElement).closest('.cc-dialog')) return;
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

export default function ChatSidebar() {
  const isPopOut = isChatPopOutWindow();
  const isDockedViewport = useDockedViewport();
  const returnToSidebar = new URLSearchParams(window.location.search).get('chat') === 'open';
  const [dockPreference, setDockPreference] = useState<DockPreference>(() => returnToSidebar ? 'open' : readDockPreference(browserStorage()));
  const [isSheetOpen, setIsSheetOpen] = useState(returnToSidebar);
  const [greetingAttention, setGreetingAttention] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('lobby');
  const pendingFocus = useRef<FocusTarget>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sidebarId = useId();
  const titleId = useId();

  const isSheetMode = !isPopOut && !isDockedViewport;
  const isOpen = isPopOut || (isDockedViewport ? dockPreference === 'open' : isSheetOpen);
  const [hasOpened, setHasOpened] = useState(isOpen);
  useEffect(() => { if (isOpen) setHasOpened(true); }, [isOpen]);

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
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.stopPropagation();
      closeSidebar();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSheetMode, isSheetOpen, closeSidebar]);

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
              <a
                className="collective-chat-icon-btn"
                href={`/chat?channel=${encodeURIComponent(selectedChannel)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sidebarCopy.popOutLabel}
              >
                {copy.popOut}
              </a>
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
          {hasOpened && <Suspense fallback={<p role="status">Opening chat…</p>}>
            <Community embedded isActive={isOpen} onChannelChange={setSelectedChannel} />
          </Suspense>}
        </div>
      </aside>
    </div>
  );
}
