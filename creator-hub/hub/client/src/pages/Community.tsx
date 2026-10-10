import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  chatApi,
  draftKey,
  type Account,
  type Channel,
  type Message,
  type Capabilities,
  type Report,
} from "../chat/communityAppApi";
import "./Community.css";

function Glyph({ name }: { name: string }) {
  const paths: Record<string, string> = {
    chat: "M4 5h16v11H9l-5 4V5Z",
    search: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 6 6",
    arrow: "m5 12 14 0m-6-6 6 6-6 6",
    back: "m15 5-7 7 7 7",
    close: "m6 6 12 12M6 18 18 6",
    menu: "M4 6h16M4 12h16M4 18h16",
    link: "m9 15 6-6M7 14l-2 2a3 3 0 0 0 4 4l4-4m-2-8 4-4a3 3 0 0 1 4 4l-2 2",
    shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6",
    reply: "m8 5-5 5 5 5M3 10h10c5 0 7 3 7 8",
    plus: "M12 4v16M4 12h16",
    send: "m3 3 18 9-18 9 4-9-4-9Zm4 9h14",
    bell: "M6 17h12l-2-3V9a4 4 0 0 0-8 0v5l-2 3Zm4 3h4",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.chat} />
    </svg>
  );
}
function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span
      className={"cc-avatar" + (small ? " is-small" : "")}
      data-color={name.charCodeAt(0) % 4}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
function time(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
function readStored(key: string) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
function storeValue(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* A blocked storage area must not prevent chat. */
  }
}
function Body({ body }: { body: string }) {
  return (
    <p className="cc-message-body">
      {body.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export default function Community({
  embedded = false,
  isActive = true,
  onChannelChange,
}: {
  embedded?: boolean;
  isActive?: boolean;
  onChannelChange?: (id: string) => void;
} = {}) {
  const Conversation = embedded ? "section" : "main";
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null),
    [account, setAccount] = useState<Account | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]),
    [channelId, setChannelId] = useState(() => {
      const requested = new URLSearchParams(window.location.search).get(
        "channel",
      );
      return !embedded && requested && /^[A-Za-z0-9_-]{1,100}$/.test(requested)
        ? requested
        : "lobby";
    }),
    [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState(""),
    [channelQuery, setChannelQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [thread, setThread] = useState<Message | null>(null);
  const [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [sending, setSending] = useState(false),
    [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false),
    [panel, setPanel] = useState<"connections" | "moderation" | null>(null),
    [crosspost, setCrosspost] = useState(false);
  const [reporting, setReporting] = useState<Message | null>(null),
    [reason, setReason] = useState(""),
    [reports, setReports] = useState<Report[]>([]);
  const [lastRead, setLastRead] = useState<Record<string, string>>({});
  const [messageMenu, setMessageMenu] = useState<string | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null),
    listRef = useRef<HTMLDivElement>(null),
    sendId = useRef<string | null>(null),
    context = useRef("");
  const dialogRef = useRef<HTMLElement>(null);
  const channel = channels.find((c) => c.id === channelId);
  const canModerate =
    account?.role === "owner" || account?.role === "moderator";
  const draftStorage = account
    ? draftKey(account.id, channelId, thread?.id)
    : "";
  useEffect(() => {
    onChannelChange?.(channelId);
  }, [channelId, onChannelChange]);
  useEffect(() => {
    if (!isActive || !capabilities?.configured) return;
    let cancelled = false;
    const refreshSession = () =>
      void chatApi<{ account: Account | null }>("/session").then(
        ({ account: latest }) => {
          if (!cancelled)
            setAccount((current) =>
              current?.id === latest?.id && current?.role === latest?.role
                ? current
                : latest,
            );
        },
        () => {
          /* Existing request errors remain visible in the chat. */
        },
      );
    refreshSession();
    window.addEventListener("focus", refreshSession);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshSession);
    };
  }, [isActive, capabilities?.configured]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const caps = await chatApi<Capabilities>("/capabilities");
        if (cancelled) return;
        setCapabilities(caps);
        if (caps.configured) {
          const session = await chatApi<{ account: Account | null }>(
            "/session",
          );
          if (!cancelled) setAccount(session.account);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    chatApi<{ channels: Channel[] }>("/channels").then(
      (data) => {
        if (!cancelled) setChannels(data.channels);
      },
      (e) => {
        if (!cancelled) setError(e.message);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [account]);
  useEffect(() => {
    context.current = draftStorage;
    setDraft(draftStorage ? readStored(draftStorage) : "");
    sendId.current = null;
  }, [draftStorage]);
  useEffect(() => {
    const syncDraft = (event: StorageEvent) => {
      if (event.key === draftStorage) {
        setDraft(event.newValue || "");
        sendId.current = null;
      }
    };
    window.addEventListener("storage", syncDraft);
    return () => window.removeEventListener("storage", syncDraft);
  }, [draftStorage]);
  useEffect(() => {
    if (!account || !isActive) return;
    const controller = new AbortController();
    let active = true;
    const refresh = async () => {
      if (document.hidden) return;
      try {
        const data = await chatApi<{ messages: Message[] }>(
          "/channels/" +
            encodeURIComponent(channelId) +
            "/messages?q=" +
            encodeURIComponent(query),
          undefined,
          controller.signal,
        );
        if (active) {
          setMessages(data.messages);
          setError("");
        }
      } catch (e) {
        if (active && (e as Error).name !== "AbortError")
          setError((e as Error).message);
      }
    };
    setMessages([]);
    const first = window.setTimeout(() => void refresh(), query ? 250 : 0);
    const timer = window.setInterval(() => void refresh(), 5000);
    const visible = () => void refresh();
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [account, channelId, query, isActive]);
  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1].created_at;
    setLastRead((current) => ({ ...current, [channelId]: latest }));
  }, [messages, channelId]);
  useEffect(() => {
    const list = listRef.current;
    if (list && list.scrollHeight - list.scrollTop - list.clientHeight < 350)
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages.length]);
  useEffect(() => {
    if (panel !== "moderation") return;
    chatApi<{ reports: Report[] }>("/moderation").then(
      (data) => setReports(data.reports),
      (e) => setError(e.message),
    );
  }, [panel]);
  useEffect(() => {
    if (embedded) return;
    const previousTitle = document.title;
    document.title = "Ootle Chat · Community";
    return () => {
      document.title = previousTitle;
    };
  }, [embedded]);
  const dialogOpen = !!(panel || crosspost || reporting);
  useEffect(() => {
    if (!dialogOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input,textarea,[tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [dialogOpen]);
  function updateDraft(value: string) {
    setDraft(value);
    storeValue(draftStorage, value);
    sendId.current = null;
  }
  function chooseChannel(id: string) {
    setMessageMenu(null);
    setChannelId(id);
    setThread(null);
    setQuery("");
    setStatus("");
    setError("");
    setMobileNav(false);
  }
  async function previewLogin() {
    try {
      const result = await chatApi<{ account: Account }>(
        "/preview/session",
        {},
      );
      setAccount(result.account);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function refreshMessages() {
    const data = await chatApi<{ messages: Message[] }>(
      "/channels/" + channelId + "/messages",
    );
    setMessages(data.messages);
  }
  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (sending || !draft.trim() || !account) return;
    setSending(true);
    setError("");
    const currentContext = context.current;
    const submitted = draft;
    const clientId = sendId.current || (sendId.current = crypto.randomUUID());
    try {
      const result = await chatApi<{ message: Message }>("/messages", {
        channelId,
        body: submitted,
        parentId: thread?.id,
        clientId,
      });
      storeValue(currentContext, "");
      if (context.current === currentContext) {
        setDraft("");
        sendId.current = null;
        setMessages((current) =>
          current.some((m) => m.id === result.message.id)
            ? current
            : [
                ...current,
                { ...result.message, reply_count: 0, deliveries: [] },
              ],
        );
        setStatus("Message sent");
        draftRef.current?.focus();
        void refreshMessages();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }
  async function moderate(messageId: string, action: "hide" | "restore") {
    try {
      await chatApi("/messages/" + messageId + "/moderate", { action });
      await refreshMessages();
      if (panel === "moderation")
        setReports(
          (await chatApi<{ reports: Report[] }>("/moderation")).reports,
        );
      setStatus(action === "hide" ? "Message hidden" : "Message restored");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function report(event: FormEvent) {
    event.preventDefault();
    if (!reporting) return;
    try {
      await chatApi("/messages/" + reporting.id + "/report", { reason });
      setReporting(null);
      setReason("");
      setStatus("Report sent to the moderators");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const visibleMessages = thread
    ? messages.filter((m) => m.id === thread.id || m.parent_id === thread.id)
    : messages.filter((m) => query || !m.parent_id);
  const nativeChannels = channels.filter(
    (c) =>
      c.platform === "ootle" && c.name.includes(channelQuery.toLowerCase()),
  );
  const externalChannels = channels.filter((c) => c.platform !== "ootle");
  const connectionNames = capabilities?.platforms || [
    "telegram",
    "discord",
    "slack",
  ];
  return (
    <div className={"community-host" + (embedded ? " is-embedded" : "")}>
      <div
        className="community-app"
        onKeyDown={(event) => {
          if (
            event.key !== "Escape" ||
            !(dialogOpen || mobileNav || thread || messageMenu)
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          setCrosspost(false);
          setReporting(null);
          setPanel(null);
          setMobileNav(false);
          setMessageMenu(null);
          setThread(null);
        }}
      >
        <aside className="cc-rail" aria-label="Community navigation">
          <Link to="/" className="cc-logo" aria-label="Ootle Lobby">
            <img src="/ootle-jam-mark.svg" alt="" />
          </Link>
          <button
            className="cc-rail-item is-active"
            aria-label="Conversations"
            onClick={() => setPanel(null)}
          >
            <Glyph name="chat" />
          </button>
          <button
            className="cc-rail-item"
            aria-label="Connected apps"
            onClick={() => setPanel("connections")}
          >
            <Glyph name="link" />
          </button>
          {canModerate && (
            <button
              className="cc-rail-item"
              aria-label="Moderation reports"
              onClick={() => setPanel("moderation")}
            >
              <Glyph name="shield" />
            </button>
          )}
          <span className="cc-rail-bottom">
            {account ? (
              <Avatar name={account.name} small />
            ) : (
              <span className="cc-orbit-dot" />
            )}
          </span>
        </aside>
        <aside
          className={"cc-sidebar" + (mobileNav ? " is-mobile-open" : "")}
          aria-label="Conversations"
        >
          <header>
            <div>
              <span className="cc-eyebrow">THE COMMUNITY</span>
              <h1>
                ootle <span>chat</span>
                <i />
              </h1>
            </div>
            <button
              className="cc-icon cc-mobile-close"
              aria-label="Close conversations"
              onClick={() => setMobileNav(false)}
            >
              <Glyph name="close" />
            </button>
          </header>
          <label className="cc-search">
            <Glyph name="search" />
            <input
              value={channelQuery}
              onChange={(e) => setChannelQuery(e.target.value)}
              placeholder="Find a conversation"
              aria-label="Find a conversation"
            />
          </label>
          <div className="cc-channel-section">
            <span className="cc-section-label">YOUR SPACE</span>
            <nav>
              {(account
                ? nativeChannels
                : [{ id: "lobby", name: "the-lobby", latest_at: null }]
              ).map((item) => (
                <button
                  key={item.id}
                  className={
                    "cc-channel" + (channelId === item.id ? " is-active" : "")
                  }
                  onClick={() => chooseChannel(item.id)}
                >
                  <span className="cc-hash">#</span>
                  <span>{item.name}</span>
                  {item.latest_at &&
                    (!lastRead[item.id] ||
                      lastRead[item.id] < item.latest_at) &&
                    channelId !== item.id && <i className="cc-unread" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="cc-channel-section">
            <div className="cc-section-line">
              <span className="cc-section-label">CONNECTED CHANNELS</span>
              <button
                className="cc-icon"
                aria-label="Manage connected channels"
                onClick={() => setPanel("connections")}
              >
                <Glyph name="plus" />
              </button>
            </div>
            {externalChannels.map((item) => (
              <button
                className={
                  "cc-channel" + (channelId === item.id ? " is-active" : "")
                }
                key={item.id}
                onClick={() => chooseChannel(item.id)}
              >
                <span className="cc-platform-letter">
                  {item.platform[0].toUpperCase()}
                </span>
                <span>{item.name}</span>
              </button>
            ))}
            {!externalChannels.length && (
              <div className="cc-connect-hint">
                <span className="cc-connect-symbol">
                  <Glyph name="link" />
                </span>
                <p>Bring your people together.</p>
                <span>Your connected channels will live here.</span>
                <button onClick={() => setPanel("connections")}>
                  Explore connections <Glyph name="arrow" />
                </button>
              </div>
            )}
          </div>
          {canModerate && (
            <button
              className="cc-review-reports"
              onClick={() => {
                setMobileNav(false);
                setPanel("moderation");
              }}
            >
              <Glyph name="shield" /> Review reports
            </button>
          )}
          <div className="cc-sidebar-footer">
            {account ? (
              <>
                <Avatar name={account.name} small />
                <div>
                  <strong>{account.name}</strong>
                  <span>
                    {capabilities?.preview ? "Preview account" : account.role}
                  </span>
                </div>
                <button
                  className="cc-text-button"
                  onClick={async () => {
                    try {
                      await chatApi("/logout", {});
                      setAccount(null);
                      setMessages([]);
                      setChannels([]);
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <span>A little closer. A lot more possible.</span>
            )}
          </div>
        </aside>
        <Conversation
          className="cc-main"
          id="community-main"
          aria-label="Community chat"
        >
          <header className="cc-conversation-header">
            <button
              className="cc-icon cc-menu"
              aria-label="Open conversations"
              onClick={() => setMobileNav(true)}
            >
              <Glyph name="menu" />
            </button>
            {thread ? (
              <button
                className="cc-icon"
                aria-label="Back to conversation"
                onClick={() => setThread(null)}
              >
                <Glyph name="back" />
              </button>
            ) : (
              <span className="cc-header-hash">#</span>
            )}
            <div>
              <h2>{thread ? "Thread" : channel?.name || "the-lobby"}</h2>
              <p>
                {thread
                  ? "A conversation within the conversation"
                  : channel?.description ||
                    "Meet the people building what comes next."}
              </p>
            </div>
            <button
              className="cc-icon cc-header-connect"
              aria-label="Show connections"
              onClick={() => setPanel("connections")}
            >
              <Glyph name="link" />
            </button>
          </header>
          {capabilities?.preview && (
            <div className="cc-preview-banner">
              <i />
              Local preview{" "}
              <span>Sample conversations · messages stay on this computer</span>
            </div>
          )}
          {error && (
            <div className="cc-error" role="alert">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}
          {!account ? (
            <div className="cc-welcome">
              <div className="cc-welcome-art">
                <span>#</span>
                <i />
                <b>hello, world.</b>
              </div>
              <span className="cc-eyebrow">
                SAME PEOPLE. MORE POSSIBILITIES.
              </span>
              <h2>
                Your community,
                <br />
                <em>in conversation.</em>
              </h2>
              <p>
                A home for questions, half-formed ideas, first builds, and the
                people who make them happen.
              </p>
              {loading ? (
                <p role="status">Opening chat…</p>
              ) : capabilities?.preview ? (
                <button
                  className="cc-primary"
                  onClick={() => void previewLogin()}
                >
                  Enter the local preview <Glyph name="arrow" />
                </button>
              ) : capabilities?.signIn ? (
                <a
                  className="cc-primary"
                  href={
                    embedded
                      ? "/api/chat/auth/start?returnTo=lobby"
                      : "/api/chat/auth/start"
                  }
                >
                  Continue with GitHub <Glyph name="arrow" />
                </a>
              ) : (
                <div className="cc-setup-note">
                  Chat is being connected. You can still{" "}
                  <a
                    href="https://discord.com/invite/dj34vQSe6d"
                    target="_blank"
                    rel="noreferrer"
                  >
                    join the community on Discord ↗
                  </a>
                  .
                </div>
              )}
              <div className="cc-welcome-foot">
                <span>Conversations</span>
                <i />
                <span>Community</span>
                <i />
                <span>Connected channels</span>
              </div>
            </div>
          ) : (
            <>
              <div className="cc-message-tools">
                <span>{thread ? "REPLIES" : "CONVERSATION"}</span>
                <label>
                  <Glyph name="search" />
                  <input
                    aria-label="Search this conversation"
                    placeholder="Search messages"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div
                className="cc-messages"
                ref={listRef}
                role="log"
                aria-label={
                  thread ? "Thread messages" : "Conversation messages"
                }
                aria-live="polite"
              >
                {!query && !thread && (
                  <div className="cc-channel-intro">
                    <span>#</span>
                    <h3>This is #{channel?.name || "the-lobby"}.</h3>
                    <p>{channel?.description} Start something good.</p>
                  </div>
                )}
                {visibleMessages.length > 0 && (
                  <div className="cc-date-divider">
                    <span>
                      {new Date(
                        visibleMessages[0].created_at,
                      ).toLocaleDateString([], {
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {!visibleMessages.length && (
                  <p className="cc-empty">
                    {query
                      ? "No messages match this search."
                      : "A fresh conversation. Say the first hello."}
                  </p>
                )}
                {visibleMessages.map((message) => (
                  <article className="cc-message" key={message.id}>
                    <Avatar name={message.author_name} />
                    <div className="cc-message-content">
                      <div className="cc-message-meta">
                        <strong>{message.author_name}</strong>
                        {message.account_id === account.id && (
                          <span className="cc-you">you</span>
                        )}
                        {message.platform !== "ootle" && (
                          <span className="cc-source">
                            via {message.platform}
                          </span>
                        )}
                        <time dateTime={message.created_at}>
                          {time(message.created_at)}
                        </time>
                        <button
                          className="cc-message-more"
                          aria-label={
                            "Message actions for " + message.author_name
                          }
                          aria-expanded={messageMenu === message.id}
                          onClick={() =>
                            setMessageMenu(
                              messageMenu === message.id ? null : message.id,
                            )
                          }
                        >
                          <span aria-hidden="true">···</span>
                        </button>
                      </div>
                      <Body body={message.body} />
                      {message.reply_count > 0 && !thread && (
                        <button
                          className="cc-replies"
                          onClick={() => {
                            setThread(message);
                            setQuery("");
                          }}
                        >
                          <Glyph name="reply" />
                          {message.reply_count}{" "}
                          {message.reply_count === 1 ? "reply" : "replies"}
                          <span>View thread</span>
                        </button>
                      )}
                      {message.deliveries?.map((delivery) => (
                        <span className="cc-delivery" key={delivery.id}>
                          {channels.find((c) => c.id === delivery.channel_id)
                            ?.name || "Destination"}{" "}
                          · {delivery.status}
                        </span>
                      ))}
                    </div>
                    <div
                      className="cc-message-actions"
                      data-open={messageMenu === message.id}
                      role="group"
                      aria-label="Message actions"
                    >
                      <button
                        aria-label={"Reply to " + message.author_name}
                        title="Reply"
                        onClick={() => {
                          setMessageMenu(null);
                          setThread(
                            message.parent_id
                              ? messages.find(
                                  (m) => m.id === message.parent_id,
                                ) || message
                              : message,
                          );
                          setQuery("");
                          draftRef.current?.focus();
                        }}
                      >
                        <Glyph name="reply" />
                      </button>
                      <button
                        aria-label={
                          "Report message from " + message.author_name
                        }
                        title="Report"
                        onClick={() => {
                          setMessageMenu(null);
                          setReporting(message);
                          setReason("");
                        }}
                      >
                        <Glyph name="shield" />
                      </button>
                      {canModerate && (
                        <button
                          title="Hide message"
                          aria-label={
                            "Hide message from " + message.author_name
                          }
                          onClick={() => {
                            setMessageMenu(null);
                            void moderate(message.id, "hide");
                          }}
                        >
                          <Glyph name="close" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <div className="cc-composer-area">
                {thread && (
                  <div className="cc-reply-context">
                    <Glyph name="reply" />
                    <span>
                      Replying to <strong>{thread.author_name}</strong>
                    </span>
                    <button
                      onClick={() => setThread(null)}
                      aria-label="Cancel reply"
                    >
                      ×
                    </button>
                  </div>
                )}
                <form className="cc-composer" onSubmit={send}>
                  <textarea
                    ref={draftRef}
                    aria-label={thread ? "Write a reply" : "Write a message"}
                    placeholder={
                      thread
                        ? "Keep the conversation going…"
                        : "Message #" + (channel?.name || "the-lobby")
                    }
                    maxLength={4000}
                    value={draft}
                    disabled={
                      sending ||
                      !channel?.can_post ||
                      channel.platform !== "ootle"
                    }
                    onChange={(e) => updateDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                  />
                  <div className="cc-composer-bottom">
                    <button
                      className="cc-destinations"
                      type="button"
                      onClick={() => setCrosspost(true)}
                    >
                      <Glyph name="link" />
                      <span>Post to…</span>
                    </button>
                    <span className="cc-composer-tip">
                      Shift + Enter for a new line
                    </span>
                    <button
                      className="cc-send"
                      type="submit"
                      disabled={
                        sending ||
                        !draft.trim() ||
                        !channel?.can_post ||
                        channel.platform !== "ootle"
                      }
                      aria-label={sending ? "Sending message" : "Send message"}
                    >
                      <Glyph name="send" />
                    </button>
                  </div>
                </form>
                <div className="cc-composer-foot">
                  <span>
                    {draft
                      ? "Draft on this device"
                      : "Make room for a good conversation."}
                  </span>
                  <span role="status">{status}</span>
                </div>
              </div>
            </>
          )}
        </Conversation>
        <aside className="cc-about">
          <span className="cc-eyebrow">A SHARED SPACE</span>
          <div className="cc-about-mark">
            o<span>o</span>
          </div>
          <h2>
            Good things
            <br />
            start with <em>hello.</em>
          </h2>
          <p>
            Builders, curious minds, and your next collaborator. All a
            conversation away.
          </p>
          <hr />
          <div className="cc-section-line">
            <span className="cc-section-label">YOUR CONNECTIONS</span>
            <Glyph name="link" />
          </div>
          {connectionNames.map((name) => (
            <div className="cc-connection-row" key={name}>
              <span className={"cc-platform-logo is-" + name}>
                {name[0].toUpperCase()}
              </span>
              <span>{name}</span>
              <small>Not connected</small>
            </div>
          ))}
          <button
            className="cc-outline"
            onClick={() => setPanel("connections")}
          >
            Manage connections <Glyph name="arrow" />
          </button>
          <div className="cc-about-note">
            <Glyph name="shield" />
            <p>You choose the channels. You choose where a message goes.</p>
          </div>
          <Link to="/" className="cc-back-lobby">
            ← Back to the Lobby
          </Link>
        </aside>
        {(panel || crosspost || reporting) && (
          <div
            className="cc-overlay"
            onClick={() => {
              setPanel(null);
              setCrosspost(false);
              setReporting(null);
            }}
          >
            <section
              ref={dialogRef}
              className="cc-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={
                reporting
                  ? "Report message"
                  : crosspost
                    ? "Choose post destinations"
                    : panel === "moderation"
                      ? "Moderation reports"
                      : "Connected apps"
              }
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="cc-dialog-close cc-icon"
                aria-label="Close dialog"
                onClick={() => {
                  setPanel(null);
                  setCrosspost(false);
                  setReporting(null);
                }}
              >
                <Glyph name="close" />
              </button>
              {reporting ? (
                <form onSubmit={report}>
                  <span className="cc-eyebrow">COMMUNITY CARE</span>
                  <h2>Report a message</h2>
                  <blockquote>{reporting.body}</blockquote>
                  <label className="cc-report-reason">
                    What should a moderator know?
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={500}
                      required
                      autoFocus
                    />
                  </label>
                  <button className="cc-primary" type="submit">
                    Send report <Glyph name="arrow" />
                  </button>
                </form>
              ) : panel === "moderation" ? (
                <>
                  <span className="cc-eyebrow">COMMUNITY CARE</span>
                  <h2>Moderation reports</h2>
                  {!reports.length ? (
                    <p>No reports need your attention.</p>
                  ) : (
                    reports.map((item) => (
                      <article className="cc-report-item" key={item.id}>
                        <strong>{item.author_name}</strong>
                        <blockquote>{item.body}</blockquote>
                        <p>{item.reason}</p>
                        <button
                          className="cc-outline"
                          onClick={() =>
                            void moderate(
                              item.message_id,
                              item.hidden_at ? "restore" : "hide",
                            )
                          }
                        >
                          {item.hidden_at ? "Restore message" : "Hide message"}
                        </button>
                      </article>
                    ))
                  )}
                </>
              ) : (
                <>
                  <span className="cc-eyebrow">ONE COMMUNITY, MANY PLACES</span>
                  <h2>
                    {crosspost
                      ? "Choose where it goes."
                      : "Bring the channels together."}
                  </h2>
                  <p>
                    {crosspost
                      ? "Every cross-post will show its destination and delivery result. Your message stays in this conversation unless you choose another destination."
                      : "See conversations together while keeping their source and channel permissions. Posting and reading are connected separately."}
                  </p>
                  {crosspost && (
                    <div className="cc-native-destination">
                      <span># {channel?.name || "the-lobby"}</span>
                      <strong>Selected</strong>
                    </div>
                  )}
                  {connectionNames.map((name) => (
                    <div className="cc-connection-card" key={name}>
                      <span className={"cc-platform-logo is-" + name}>
                        {name[0].toUpperCase()}
                      </span>
                      <div>
                        <strong>{name}</strong>
                        <p>No channels connected</p>
                      </div>
                      <span className="cc-connection-state">Setup needed</span>
                    </div>
                  ))}
                  <div className="cc-connection-explainer">
                    <Glyph name="shield" />
                    <p>
                      Channel owners authorize access before messages can be
                      imported or posted. No external channels are connected in
                      this version.
                    </p>
                  </div>
                  <button
                    className="cc-primary"
                    onClick={() => {
                      setPanel(null);
                      setCrosspost(false);
                    }}
                  >
                    Back to the conversation <Glyph name="arrow" />
                  </button>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
