import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi, type Message } from "./communityAppApi";
type Page = { messages: Message[]; parent: Message | null; hasMore: boolean };
type Cursor = { at: string; id: string };
export function useConversationMessages(
  accountId: string | undefined,
  channelId: string,
  parentId: string | undefined,
  query: string,
  active: boolean,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [parent, setParent] = useState<Message | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [connection, setConnection] = useState("Connecting…");
  const [error, setError] = useState("");
  const controls = useRef<{
    refresh: () => Promise<void>;
    older: (beforeCommit: (ids: string[]) => void) => Promise<void>;
  } | null>(null);
  useEffect(() => {
    if (!accountId || !active) return;
    const controller = new AbortController();
    let current = true,
      busy = false,
      olderBusy = false;
    let inFlight = Promise.resolve();
    let pages: Page[] = [],
      cursors: Cursor[] = [];
    setMessages([]);
    setParent(null);
    setHasMore(false);
    setError("");
    setLoadingOlder(false);
    setConnection("Connecting…");
    const read = (cursor?: Cursor) => {
      const params = new URLSearchParams({ q: query });
      if (parentId) params.set("parentId", parentId);
      else if (!query) params.set("rootsOnly", "1");
      if (cursor) {
        params.set("before", cursor.at);
        params.set("beforeId", cursor.id);
      }
      return chatApi<Page>(
        `/channels/${encodeURIComponent(channelId)}/messages?${params}`,
        undefined,
        controller.signal,
      );
    };
    const publish = () => {
      const unique = new Map(
        pages
          .flatMap((page) => page.messages)
          .map((message) => [message.id, message]),
      );
      setMessages(
        [...unique.values()].sort(
          (a, b) =>
            (a.cursor_at || a.created_at).localeCompare(
              b.cursor_at || b.created_at,
            ) || a.id.localeCompare(b.id),
        ),
      );
      setParent(pages[0]?.parent ?? null);
      setHasMore(pages.at(-1)?.hasMore ?? false);
    };
    const failure = (err: unknown) => {
      if (!current || (err as Error).name === "AbortError") return;
      setConnection(
        navigator.onLine ? "Reconnecting…" : "Offline · draft saved here",
      );
      setError((err as Error).message);
      if ([401, 403, 404].includes((err as { status?: number }).status || 0)) {
        setMessages([]);
        setParent(null);
        setHasMore(false);
      }
    };
    const refresh = async (force = false): Promise<void> => {
      if (busy) {
        if (force) {
          await inFlight;
          await refresh(true);
        }
        return;
      }
      if (olderBusy || document.hidden || !current) return;
      busy = true;
      inFlight = (async () => {
        try {
          // Refresh loaded pages as well: reactions/moderation must not go stale in history.
          const next = await Promise.all([read(), ...cursors.map(read)]);
          if (current) {
            pages = next;
            publish();
            setConnection("Connected");
            setError("");
          }
        } catch (err) {
          failure(err);
        } finally {
          busy = false;
        }
      })();
      await inFlight;
    };
    const older = async (beforeCommit: (ids: string[]) => void) => {
      await inFlight;
      if (olderBusy || !current || !pages.at(-1)?.hasMore) return;
      const oldest = pages.at(-1)?.messages[0];
      if (!oldest) return;
      const cursor = {
        at: oldest.cursor_at || oldest.created_at,
        id: oldest.id,
      };
      olderBusy = true;
      setLoadingOlder(true);
      try {
        const page = await read(cursor);
        if (current) {
          beforeCommit(page.messages.map((m) => m.id));
          cursors.push(cursor);
          pages.push(page);
          publish();
        }
      } catch (err) {
        failure(err);
      } finally {
        olderBusy = false;
        if (current) setLoadingOlder(false);
      }
    };
    controls.current = { refresh: () => refresh(true), older };
    const first = window.setTimeout(() => void refresh(), query ? 250 : 0);
    const timer = window.setInterval(() => void refresh(), 1500);
    const online = () => void refresh();
    const offline = () => setConnection("Offline · draft saved here");
    document.addEventListener("visibilitychange", online);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      current = false;
      controller.abort();
      controls.current = null;
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", online);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [accountId, channelId, parentId, query, active]);
  const refresh = useCallback(async () => {
    await controls.current?.refresh();
  }, []);
  const loadOlder = useCallback(
    async (beforeCommit: (ids: string[]) => void) => {
      await controls.current?.older(beforeCommit);
    },
    [],
  );
  return {
    messages,
    setMessages,
    parent,
    hasMore,
    loadingOlder,
    connection,
    error,
    refresh,
    loadOlder,
  };
}
