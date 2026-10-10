import { useCallback, useEffect, useRef, useState } from "react";
import {
  finalizeEvent,
  getPublicKey,
  type EventTemplate,
} from "nostr-tools/pure";
import { chatApi } from "./communityAppApi";
import { privateKey } from "./privateStorage";
export type Contact = {
  id: string;
  peer_id: string;
  peer_name: string;
  peer_key: string | null;
  requester_id: string;
  action_by: string;
  state: "pending" | "accepted" | "declined" | "blocked";
  unread: number;
  latest_at: string | null;
};
export type PrivateOverview = { pubkey: string | null; contacts: Contact[] };
export function usePrivateInbox(account: string | undefined, enabled: boolean) {
  const [state, setState] = useState<{
    account: string;
    data: PrivateOverview;
  } | null>(null);
  const identity = useRef(account);
  identity.current = account;
  const overview = state && state.account === account ? state.data : null;
  const [error, setError] = useState("");
  useEffect(() => {
    setState(null);
    setError("");
    if (!account || !enabled) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const data = await chatApi<PrivateOverview>(
          "/private/overview",
          undefined,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setState({ account: account!, data });
          setError("");
        }
      } catch (e) {
        if (!controller.signal.aborted) setError((e as Error).message);
      }
      if (!controller.signal.aborted) timer = setTimeout(poll, 3000);
    }
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [account, enabled]);
  const refresh = useCallback(async () => {
    const data = await chatApi<PrivateOverview>("/private/overview");
    if (account && identity.current === account) setState({ account, data });
    return data;
  }, [account]);
  async function enable() {
    if (!account) throw new Error("Join chat first.");
    const perform = async () => {
      const current = await chatApi<PrivateOverview>("/private/overview");
      const secret = await privateKey(account, current.pubkey, true);
      if (!secret) throw new Error("Private messaging key unavailable.");
      try {
        if (!current.pubkey) {
          const challenge = await chatApi<Omit<EventTemplate, "created_at">>(
            "/private/challenge",
            { pubkey: getPublicKey(secret) },
          );
          await chatApi("/private/identity", {
            event: finalizeEvent(
              { ...challenge, created_at: Math.floor(Date.now() / 1000) },
              secret,
            ),
          });
        }
        await refresh();
      } finally {
        secret.fill(0);
      }
    };
    return navigator.locks
      ? navigator.locks.request("ootle-private-bind:" + account, perform)
      : perform();
  }
  return { overview, error, refresh, enable };
}
export function muted(account: string, id: string) {
  try {
    return (
      localStorage.getItem("ootle.private.mute:" + account + ":" + id) === "1"
    );
  } catch {
    return false;
  }
}
export function setMuted(account: string, id: string, value: boolean) {
  try {
    localStorage.setItem(
      "ootle.private.mute:" + account + ":" + id,
      value ? "1" : "0",
    );
  } catch {
    /* Optional preference. */
  }
}
