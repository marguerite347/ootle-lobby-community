import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Event } from "nostr-tools/pure";
import {
  messageEnvelopes,
  openMessage,
  MAX_PRIVATE_BYTES,
} from "../../../shared/privateMessages.mjs";
import { chatApi, type Account } from "./communityAppApi";
import {
  loadPrivateDraft,
  privateKey,
  savePrivateDraft,
} from "./privateStorage";
import {
  muted,
  setMuted,
  type Contact,
  type usePrivateInbox,
} from "./usePrivateInbox";
import "./PrivateMessages.css";
import { privateCatchup } from "./privateCatchup";

type Target = { id: string; name: string };
type Inbox = ReturnType<typeof usePrivateInbox>;
type Props = {
  active: boolean;
  account: Account;
  inbox: Inbox;
  selected: string;
  target: Target | null;
  select: (id: string | null) => void;
  openNavigation: () => void;
};
export default function PrivateMessages({
  active,
  account,
  inbox,
  selected,
  target,
  select,
  openNavigation,
}: Props) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [, rerender] = useState(0);
  const contact = inbox.overview?.contacts.find((c) => c.id === selected);
  async function action(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await work();
      await inbox.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const enabled = !!inbox.overview?.pubkey;
  function controls(c: Contact, showOpen = true) {
    const canAccept =
      c.state === "pending"
        ? c.requester_id !== account.id
        : c.state === "declined" && c.action_by === account.id;
    const respond = (value: string) =>
      action(async () => {
        if (value === "accept") await inbox.enable();
        await chatApi("/private/contacts/" + c.id, { action: value });
        if (value === "accept") select(c.id);
      });
    return (
      <div className="pm-actions">
        {c.state === "accepted" && showOpen && (
          <button onClick={() => select(c.id)}>
            Open conversation
            {c.unread > 0 && !muted(account.id, c.id) ? ` · ${c.unread}` : ""}
          </button>
        )}
        {canAccept && (
          <>
            <button disabled={busy} onClick={() => respond("accept")}>
              {enabled ? "Accept" : "Enable & accept"}
            </button>
            {c.state === "pending" && (
              <button disabled={busy} onClick={() => respond("decline")}>
                Decline
              </button>
            )}
          </>
        )}
        {c.state !== "blocked" && (
          <button disabled={busy} onClick={() => respond("block")}>
            Block
          </button>
        )}
        {c.state === "blocked" && c.action_by === account.id && (
          <button disabled={busy} onClick={() => respond("unblock")}>
            Unblock
          </button>
        )}
      </div>
    );
  }
  return (
    <section
      className="cc-main pm-main"
      id="community-main"
      aria-label="Private messages"
    >
      <header className="cc-conversation-header pm-header">
        <button
          className="cc-icon cc-menu"
          aria-label="Open conversations"
          onClick={openNavigation}
        >
          ☰
        </button>
        {contact && (
          <button
            className="pm-back"
            aria-label="Back to private inbox"
            onClick={() => select("inbox")}
          >
            ‹
          </button>
        )}
        <div>
          <h2>{contact?.peer_name || "Private messages"}</h2>
          <p>
            {contact
              ? "Encrypted · one to one"
              : "Your conversations, by invitation"}
          </p>
        </div>
        <button className="pm-public" onClick={() => select(null)}>
          Public chat
        </button>
      </header>
      {(error || inbox.error) && (
        <p className="pm-error" role="alert">
          {error || inbox.error}
        </p>
      )}
      {!inbox.overview ? (
        <p className="pm-note" role="status">
          Connecting to your private inbox…
        </p>
      ) : contact ? (
        <>
          <details className="pm-details">
            <summary>Conversation settings</summary>
            <p>
              Guest identity · {contact.peer_id.slice(-8)}. Display names can
              change or match someone else’s.
            </p>
            {contact.peer_key && (
              <p>
                Messaging key{" "}
                <code>
                  {contact.peer_key.slice(0, 12)}…{contact.peer_key.slice(-12)}
                </code>
              </p>
            )}
            <button
              onClick={() => {
                setMuted(
                  account.id,
                  contact.id,
                  !muted(account.id, contact.id),
                );
                rerender((v) => v + 1);
              }}
            >
              {muted(account.id, contact.id)
                ? "Unmute in-app badges"
                : "Mute in-app badges"}
            </button>
            {contact.state === "accepted" && controls(contact, false)}
          </details>
          {active && contact.state === "accepted" && inbox.overview.pubkey ? (
            <PrivateThread
              key={account.id + ":" + contact.id}
              account={account}
              contact={contact}
              pubkey={inbox.overview.pubkey}
              refreshInbox={inbox.refresh}
            />
          ) : (
            <div className="pm-empty">
              <h3>
                {contact.state === "pending"
                  ? "A hello starts with consent"
                  : contact.state === "blocked"
                    ? "Conversation blocked"
                    : "Request declined"}
              </h3>
              <p>
                {contact.state === "pending"
                  ? contact.requester_id === account.id
                    ? "Your request is waiting for a response. You can message once they accept."
                    : "Accept to start a private conversation. No messages have been shared with you yet."
                  : "New messages cannot be sent in this conversation."}
              </p>
              {controls(contact)}
            </div>
          )}
        </>
      ) : (
        <div className="pm-inbox">
          <div className="pm-intro">
            <span className="cc-eyebrow">JUST BETWEEN YOU</span>
            <h3>A quieter place to talk.</h3>
            <p>
              Ask someone in public chat to connect. Once they accept, only your
              browsers can decrypt the messages.
            </p>
            {!enabled && (
              <>
                <p className="pm-note">
                  Enabling saves a messaging key in this browser. Keep this
                  browser’s data and guest session to keep access. There’s no
                  recovery or device sync yet.
                </p>
                <button
                  className="pm-primary"
                  disabled={busy}
                  onClick={() => action(inbox.enable)}
                >
                  Enable private messages
                </button>
              </>
            )}
            <details>
              <summary>How privacy works</summary>
              <p>
                Message text and drafts are encrypted. The service can see who
                exchanges messages and when. “Received” means the other browser
                decrypted and displayed the message, not that the person read
                it. The retention policy is 90 days; automated cleanup is still
                being verified. Browser extensions or compromised site code can
                still access messages in your browser.
              </p>
            </details>
          </div>
          {target && (
            <div className="pm-card">
              <h3>Connect with {target.name}</h3>
              <p>They’ll receive a contact request, without a message.</p>
              <button
                className="pm-primary"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    await inbox.enable();
                    const result = await chatApi<{ id: string }>(
                      "/private/requests",
                      { peerId: target.id },
                    );
                    select(result.id);
                  })
                }
              >
                {enabled ? "Send contact request" : "Enable & send request"}
              </button>
            </div>
          )}
          <h3 className="pm-list-title">Your contacts</h3>
          {!inbox.overview.contacts.length && (
            <p className="pm-note">
              No requests yet. Use “Private message” from someone’s message
              actions in a public channel.
            </p>
          )}
          {inbox.overview.contacts.map((c) => (
            <article className="pm-card" key={c.id}>
              <div className="pm-contact-line">
                <strong>{c.peer_name}</strong>
                <span className="pm-state">
                  {c.state === "pending"
                    ? c.requester_id === account.id
                      ? "Request sent"
                      : "Wants to connect"
                    : c.state}
                </span>
              </div>
              <small>Guest · {c.peer_id.slice(-8)}</small>
              {controls(c)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

type Row = {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_key: string;
  recipient_key: string;
  created_at: string;
  cursor_at: string;
  received_at: string | null;
  envelope: Event;
};
type Display = Row & { body: string | null };
type Outgoing = { id: string; senderWrap: Event; recipientWrap: Event };
type Draft = { text: string; pending?: Outgoing };
function PrivateThread({
  account,
  contact,
  pubkey,
  refreshInbox,
}: {
  account: Account;
  contact: Contact;
  pubkey: string;
  refreshInbox: () => Promise<unknown>;
}) {
  const [rows, setRows] = useState<Display[]>([]),
    [draft, setDraft] = useState<Draft>({ text: "" });
  const [error, setError] = useState(""),
    [connection, setConnection] = useState("Connecting…");
  const [ready, setReady] = useState(false),
    [sending, setSending] = useState(false),
    [hasMore, setHasMore] = useState(false),
    [loadingMore, setLoadingMore] = useState(false);
  const [unread, setUnread] = useState(0);
  const secret = useRef<Uint8Array | null>(null),
    alive = useRef(true),
    fetching = useRef(false);
  const list = useRef<HTMLDivElement>(null),
    composer = useRef<HTMLTextAreaElement>(null),
    nearBottom = useRef(true),
    initial = useRef(true);
  const historyAnchor = useRef<{ height: number; top: number } | null>(null),
    seen = useRef(new Set<string>()),
    acknowledged = useRef(new Set<string>());
  const fetchNow = useRef<() => Promise<void>>(async () => {}),
    currentDraft = useRef(draft);
  currentDraft.current = draft;
  const bytes = new TextEncoder().encode(draft.text).length;
  function display(row: Row): Display {
    try {
      return {
        ...row,
        body: openMessage(secret.current!, row.envelope, {
          sender: row.sender_key,
          recipient: row.recipient_key,
          conversation: contact.id,
          id: row.id,
        }),
      };
    } catch {
      return { ...row, body: null };
    }
  }
  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (fetching.current || !secret.current) return;
      fetching.current = true;
      try {
        const page = await chatApi<{ messages: Row[]; hasMore: boolean }>(
          "/private/contacts/" + contact.id + "/messages",
          undefined,
          controller.signal,
        );
        if (!alive.current) return;
        const catchup = await privateCatchup(page, seen.current, (cursor) => {
          const params = new URLSearchParams({
            before: cursor.cursor_at,
            beforeId: cursor.id,
          });
          return chatApi<{ messages: Row[]; hasMore: boolean }>(
            "/private/contacts/" + contact.id + "/messages?" + params,
            undefined,
            controller.signal,
          );
        });
        if (!alive.current) return;
        if (catchup.reset) {
          nearBottom.current = true;
          setHasMore(catchup.hasMore);
        }
        const decoded = catchup.messages.map(display);
        if (initial.current) setHasMore(page.hasMore);
        const incoming = decoded.filter(
          (row) => !seen.current.has(row.id) && row.sender_id !== account.id,
        ).length;
        decoded.forEach((row) => seen.current.add(row.id));
        if (!initial.current && !nearBottom.current && incoming)
          setUnread((v) => v + incoming);
        setRows((old) =>
          [
            ...new Map(
              [...(catchup.reset ? [] : old), ...decoded].map((row) => [
                row.id,
                row,
              ]),
            ).values(),
          ].sort(
            (a, b) =>
              a.created_at.localeCompare(b.created_at) ||
              a.id.localeCompare(b.id),
          ),
        );
        const pending = currentDraft.current.pending;
        if (pending && decoded.some((row) => row.id === pending.id)) {
          currentDraft.current = { text: "" };
          setDraft({ text: "" });
          await savePrivateDraft(account.id, contact.id, undefined);
        }
        initial.current = false;
        setConnection("Connected");
      } catch (e) {
        if (alive.current)
          setConnection("Reconnecting — messages stay in this browser");
      } finally {
        fetching.current = false;
      }
    }
    fetchNow.current = poll;
    async function start() {
      try {
        const key = await privateKey(account.id, pubkey);
        if (!alive.current) {
          key?.fill(0);
          return;
        }
        if (!key) throw new Error("Private messaging key unavailable.");
        secret.current = key;
        const saved = await loadPrivateDraft<Draft>(account.id, contact.id);
        if (!alive.current) return;
        if (saved) {
          setDraft(saved);
          currentDraft.current = saved;
        }
        setReady(true);
        const repeat = async () => {
          await poll();
          if (alive.current) timer = setTimeout(repeat, 2000);
        };
        void repeat();
      } catch (e) {
        if (alive.current) {
          setError((e as Error).message);
          setConnection("Private messages unavailable");
        }
      }
    }
    void start();
    return () => {
      alive.current = false;
      controller.abort();
      clearTimeout(timer);
      secret.current?.fill(0);
      secret.current = null;
    };
  }, [account.id, contact.id, pubkey]);
  useLayoutEffect(() => {
    if (!list.current) return;
    if (historyAnchor.current) {
      list.current.scrollTop =
        historyAnchor.current.top +
        list.current.scrollHeight -
        historyAnchor.current.height;
      historyAnchor.current = null;
    } else if (nearBottom.current)
      list.current.scrollTop = list.current.scrollHeight;
  }, [rows]);
  // Runs after React committed the decrypted text. No receipt is sent for bad ciphertext.
  useEffect(() => {
    for (const row of rows)
      if (
        row.body !== null &&
        row.recipient_id === account.id &&
        !row.received_at &&
        !acknowledged.current.has(row.id)
      ) {
        acknowledged.current.add(row.id);
        void chatApi("/private/contacts/" + contact.id + "/received", {
          id: row.id,
        })
          .then(() => {
            if (alive.current) void refreshInbox().catch(() => {});
          })
          .catch(() => acknowledged.current.delete(row.id));
      }
  }, [rows, account.id, contact.id]);
  async function earlier() {
    if (!rows[0] || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const params = new URLSearchParams({
        before: rows[0].cursor_at,
        beforeId: rows[0].id,
      });
      const page = await chatApi<{ messages: Row[]; hasMore: boolean }>(
        "/private/contacts/" + contact.id + "/messages?" + params,
      );
      if (!alive.current) return;
      if (list.current)
        historyAnchor.current = {
          height: list.current.scrollHeight,
          top: list.current.scrollTop,
        };
      nearBottom.current = false;
      const decoded = page.messages.map(display);
      decoded.forEach((row) => seen.current.add(row.id));
      setRows((old) => [
        ...new Map([...decoded, ...old].map((row) => [row.id, row])).values(),
      ]);
      setHasMore(page.hasMore);
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setLoadingMore(false);
    }
  }
  async function send() {
    if (
      !ready ||
      sending ||
      !secret.current ||
      !contact.peer_key ||
      !draft.text.trim() ||
      bytes > MAX_PRIVATE_BYTES
    )
      return;
    setSending(true);
    setError("");
    try {
      const id = draft.pending?.id || crypto.randomUUID();
      const outgoing = draft.pending || {
        id,
        ...messageEnvelopes(
          secret.current,
          contact.peer_key,
          contact.id,
          id,
          draft.text,
        ),
      };
      // New envelopes are created once. A failed request or reload reuses their logical ID.
      const state = { text: draft.text, pending: outgoing };
      currentDraft.current = state;
      setDraft(state);
      await savePrivateDraft(account.id, contact.id, state);
      await chatApi("/private/contacts/" + contact.id + "/messages", outgoing);
      if (!alive.current) return;
      currentDraft.current = { text: "" };
      setDraft({ text: "" });
      await savePrivateDraft(account.id, contact.id, undefined);
      nearBottom.current = true;
      setUnread(0);
      await fetchNow.current();
      composer.current?.focus();
    } catch (e) {
      if (alive.current)
        setError(
          (e as Error).message +
            " Your message is saved here. Retry uses the same message ID.",
        );
    } finally {
      if (alive.current) setSending(false);
    }
  }
  return (
    <>
      <div className="pm-status" role="status">
        {connection}
      </div>
      <div
        className="pm-messages"
        ref={list}
        role="region"
        aria-label={"Private conversation with " + contact.peer_name}
        tabIndex={0}
        onScroll={() => {
          const el = list.current!;
          nearBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 70;
          if (nearBottom.current) setUnread(0);
        }}
      >
        {hasMore && (
          <button
            className="pm-earlier"
            disabled={loadingMore}
            onClick={earlier}
          >
            {loadingMore ? "Loading…" : "Load earlier private messages"}
          </button>
        )}
        {!rows.length && ready && connection === "Connected" && (
          <div className="pm-empty">
            <h3>You’re connected.</h3>
            <p>Say hello to {contact.peer_name}.</p>
          </div>
        )}
        {rows.map((row) => (
          <article
            key={row.id}
            className={
              "pm-message" + (row.sender_id === account.id ? " is-mine" : "")
            }
          >
            <div className="pm-message-meta">
              <strong>
                {row.sender_id === account.id ? "You" : contact.peer_name}
              </strong>
              <time dateTime={row.created_at}>
                {new Date(row.created_at).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </div>
            <p>
              {row.body ??
                "This message could not be decrypted or authenticated."}
            </p>
            {row.sender_id === account.id && (
              <small title="Received means the recipient browser decrypted and displayed this message; it is not a read receipt.">
                {row.received_at ? "Received" : "Sent"}
              </small>
            )}
          </article>
        ))}
      </div>
      {unread > 0 && (
        <button
          className="pm-new"
          onClick={() => {
            nearBottom.current = true;
            list.current?.scrollTo({ top: list.current.scrollHeight });
            setUnread(0);
          }}
        >
          {unread} new {unread === 1 ? "message" : "messages"} ↓
        </button>
      )}
      <div className="pm-composer">
        {error && (
          <p className="pm-error" role="alert">
            {error}
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <label className="pm-sr-only" htmlFor="private-composer">
            Write a private message
          </label>
          <textarea
            id="private-composer"
            ref={composer}
            rows={2}
            placeholder="Write a private message…"
            value={draft.text}
            disabled={!ready || !!draft.pending}
            onChange={(event) => {
              const state = { text: event.target.value };
              setDraft(state);
              currentDraft.current = state;
              void savePrivateDraft(account.id, contact.id, state).catch(() =>
                setError(
                  "Your draft could not be saved in this browser. Keep this tab open.",
                ),
              );
              event.target.style.height = "auto";
              event.target.style.height =
                Math.min(event.target.scrollHeight, 160) + "px";
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing &&
                event.nativeEvent.keyCode !== 229
              ) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <button
            className="pm-primary"
            type="submit"
            disabled={
              !ready ||
              sending ||
              !draft.text.trim() ||
              bytes > MAX_PRIVATE_BYTES
            }
          >
            {sending
              ? "Sending…"
              : draft.pending
                ? "Retry send"
                : "Send private message"}
          </button>
        </form>
        <div className="pm-composer-note">
          <span>Encrypted · Shift + Enter for a new line</span>
          <span className={bytes > MAX_PRIVATE_BYTES ? "pm-error" : ""}>
            {bytes > 3200 ? `${bytes}/${MAX_PRIVATE_BYTES} bytes` : ""}
          </span>
        </div>
      </div>
    </>
  );
}
