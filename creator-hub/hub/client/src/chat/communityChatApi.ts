export type CommunityMessage = {
  id: string;
  at: string;
  name: string;
  body: string;
};

export type CommunityListing = {
  messages: CommunityMessage[];
  removedIds: string[];
  reset: boolean;
  limits: { nameMaxLength: number; bodyMaxLength: number };
};

export type ReportResult = { id: string; reported: boolean; hidden: boolean };

/** Server rejection kinds that change client behavior. */
export type RejectionCode = 'link' | 'secret' | 'blocked' | 'duplicate' | 'rate_limited';

export class CommunityChatError extends Error {
  status: number;
  code?: RejectionCode;
  constructor(message: string, status: number, code?: RejectionCode) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function basePath(roomId?: string) {
  return roomId ? `/api/project-chat/rooms/${encodeURIComponent(roomId)}` : '/api/community-chat';
}
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const { error: serverMessage, code } = data as { error?: string; code?: RejectionCode };
    throw new CommunityChatError(serverMessage || response.statusText || 'Request failed', response.status, code);
  }
  return data as T;
}

export async function fetchCommunityMessages(afterId?: string, roomId?: string): Promise<CommunityListing> {
  const query = afterId ? `?after=${encodeURIComponent(afterId)}` : '';
  const response = await fetch(`${basePath(roomId)}/messages${query}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  return parseResponse<CommunityListing>(response);
}

export async function postCommunityMessage(input: {
  name: string;
  body: string;
  clientId: string;
}, roomId?: string): Promise<CommunityMessage> {
  const response = await fetch(`${basePath(roomId)}/messages`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  return parseResponse<CommunityMessage>(response);
}

export async function reportCommunityMessage(messageId: string, clientId: string, roomId?: string): Promise<ReportResult> {
  const response = await fetch(`${basePath(roomId)}/messages/${encodeURIComponent(messageId)}/report`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ clientId }),
  });
  return parseResponse<ReportResult>(response);
}
