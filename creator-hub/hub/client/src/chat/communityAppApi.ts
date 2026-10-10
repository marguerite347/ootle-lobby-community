export type Account = {
  id: string;
  name: string;
  role: "member" | "moderator" | "owner";
};
export type Channel = {
  id: string;
  name: string;
  description: string;
  platform: string;
  connected: boolean;
  can_post: boolean;
  visibility: string;
  latest_at: string | null;
};
export type Message = {
  id: string;
  channel_id: string;
  account_id: string | null;
  author_name: string;
  body: string;
  parent_id: string | null;
  platform: string;
  created_at: string;
  reply_count: number;
  cursor_at?: string;
  reactions?: Array<{ emoji: string; count: number; mine: boolean }>;
  deliveries: Array<{
    id: string;
    channel_id: string;
    status: string;
    receipt_url: string | null;
    error: string | null;
  }>;
};
export type Capabilities = {
  configured: boolean;
  preview: boolean;
  signIn: boolean;
  invitations?: boolean;
  guests?: boolean;
  platforms: string[];
  externalConnected: boolean;
};
export type Report = {
  id: string;
  reason: string;
  message_id: string;
  body: string;
  author_name: string;
  hidden_at: string | null;
};
export async function chatApi<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch("/api/chat" + path, {
    credentials: "same-origin",
    signal,
    ...(body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Ootle-Chat": "1" },
          body: JSON.stringify(body),
        }),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.error || "Chat could not complete that request."), { status: response.status });
  return result;
}
export function draftKey(account: string, channel: string, thread?: string) {
  return "ootle.chat.draft." + [account, channel, thread || "main"].join(".");
}

let pendingGuestSession: Promise<{ account: Account }> | null = null;
export function ensureGuestSession() {
  if (!pendingGuestSession) {
    const join = () => chatApi<{ account: Account }>("/guest/session", {});
    // Share in-flight joins across mounts and serialize separate same-origin tabs.
    const request = typeof navigator !== "undefined" && navigator.locks
      ? navigator.locks.request("ootle-chat-guest-session", join)
      : join();
    pendingGuestSession = Promise.resolve(request).finally(() => { pendingGuestSession = null; });
  }
  return pendingGuestSession;
}
