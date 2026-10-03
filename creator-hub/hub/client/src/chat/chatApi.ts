import { ROOM_ID } from './copy';

export type MessageKind = 'working' | 'blocker' | 'delivered';
export type AuthorKind = 'Human' | 'Agent' | 'Moderator' | 'System';
export type ClientState = 'queued' | 'sent' | 'failed';

export type CollectiveMessage = {
  id: string;
  at: string;
  author: string;
  authorKind: AuthorKind;
  roleName?: string;
  label?: string;
  body: string;
  kind: MessageKind;
  artifactUrl?: string;
  clientState: ClientState;
};

export type RoomPayload = {
  roomId: string;
  messages: CollectiveMessage[];
};

export type PostMessageInput = {
  author: string;
  authorKind: AuthorKind;
  roleName?: string;
  body: string;
  kind: MessageKind;
  artifactUrl?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || res.statusText || 'Request failed');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return data as T;
}

export async function fetchRoom(roomId: string = ROOM_ID): Promise<RoomPayload> {
  const res = await fetch(`/api/collective-chat/rooms/${encodeURIComponent(roomId)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  return parseJson<RoomPayload>(res);
}

export async function postMessage(
  input: PostMessageInput,
  roomId: string = ROOM_ID,
): Promise<CollectiveMessage> {
  const res = await fetch(`/api/collective-chat/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<CollectiveMessage>(res);
}

export async function patchClientState(
  messageId: string,
  clientState: ClientState,
  roomId: string = ROOM_ID,
): Promise<CollectiveMessage> {
  const res = await fetch(
    `/api/collective-chat/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(messageId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ clientState }),
    },
  );
  return parseJson<CollectiveMessage>(res);
}
