import { useEffect, useRef, useState } from "react";
import { chatApi } from "./communityAppApi";
import { createTypingActivity, typingLabel } from "./typingActivity";

type Typist = { id: string; name: string };
export function useTyping(accountId: string | undefined, channelId: string, parentId: string | undefined, enabled: boolean) {
  const [peers, setPeers] = useState<{ context: string; people: Typist[] }>({ context: "", people: [] });
  const activity = useRef<ReturnType<typeof createTypingActivity> | null>(null);
  const context = JSON.stringify([accountId, channelId, parentId]);
  useEffect(() => {
    if (!accountId || !enabled) return;
    const clientId = crypto.randomUUID();
    const publisher = createTypingActivity((active) => chatApi("/typing", { channelId, parentId, clientId, active }));
    activity.current = publisher;
    const abort = new AbortController();
    let pending = false, live = true, lastSuccess = 0;
    const clear = () => setPeers({ context, people: [] });
    const refresh = async () => {
      if (document.hidden || Date.now() - lastSuccess > 8000) clear();
      if (document.hidden || pending) return;
      pending = true;
      try {
        const result = await chatApi<{ typing: Typist[] }>(
          `/channels/${encodeURIComponent(channelId)}/typing` + (parentId ? `?parentId=${encodeURIComponent(parentId)}` : ""),
          undefined, abort.signal,
        );
        if (live) { lastSuccess = Date.now(); setPeers({ context, people: result.typing }); }
      } catch { if (live) clear(); }
      finally { pending = false; }
    };
    const visibility = () => { if (document.hidden) publisher.stop(); void refresh(); };
    const leave = () => publisher.stop();
    void refresh();
    const timer = setInterval(() => void refresh(), 1200);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", leave);
    return () => {
      live = false;
      abort.abort();
      publisher.stop();
      activity.current = null;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", leave);
    };
  }, [accountId, channelId, parentId, enabled, context]);
  return {
    label: enabled && peers.context === context ? typingLabel(peers.people.map((p) => p.name)) : "",
    edit: (value: string) => activity.current?.edit(!!value.trim()),
    stop: () => activity.current?.stop(),
  };
}
