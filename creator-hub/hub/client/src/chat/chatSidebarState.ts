// Pure helpers for the chat sidebar. Storage is passed in so tests need no DOM,
// and every access is guarded: private windows and blocked site data can throw.

import type { CommunityMessage } from './communityChatApi';

export const DOCKED_MEDIA_QUERY = '(min-width: 1100px)';
export const CHAT_GREETING_EVENT = 'ootle:chat-greeting';
export const COMMUNITY_POLL_INTERVAL_MS = 4000;
export const MAX_RENDERED_MESSAGES = 200;

export const STORAGE_KEYS = {
  dock: 'ootleLobby.chatSidebar.dock',
  displayName: 'ootleLobby.communityChat.displayName',
  clientId: 'ootleLobby.communityChat.clientId',
  reportedIds: 'ootleLobby.communityChat.reportedIds',
} as const;

export type DockPreference = 'open' | 'collapsed';
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function readStoredValue(storage: KeyValueStorage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStoredValue(storage: KeyValueStorage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage unavailable: the preference lasts for this page view only.
  }
}

export function readDockPreference(storage: KeyValueStorage | undefined): DockPreference {
  return readStoredValue(storage, STORAGE_KEYS.dock) === 'open' ? 'open' : 'collapsed';
}

export function readReportedIds(storage: KeyValueStorage | undefined): Set<string> {
  try {
    const parsed = JSON.parse(readStoredValue(storage, STORAGE_KEYS.reportedIds) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

export function writeReportedIds(storage: KeyValueStorage | undefined, reportedIds: Set<string>): void {
  const recentIds = [...reportedIds].slice(-MAX_RENDERED_MESSAGES);
  writeStoredValue(storage, STORAGE_KEYS.reportedIds, JSON.stringify(recentIds));
}

function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Anonymous per-browser id used for rate limits and report counting. Not an account. */
export function ensureClientId(storage: KeyValueStorage | undefined): string {
  const stored = readStoredValue(storage, STORAGE_KEYS.clientId);
  if (stored && /^[A-Za-z0-9_-]{8,128}$/.test(stored)) return stored;
  const created = createClientId();
  writeStoredValue(storage, STORAGE_KEYS.clientId, created);
  return created;
}

/**
 * Apply one poll result: drop removed ids, append new messages without duplicates,
 * or replace everything when the server says our cursor is gone.
 */
export function mergeCommunityMessages(
  existing: CommunityMessage[],
  incoming: CommunityMessage[],
  removedIds: string[],
  isReset: boolean,
): CommunityMessage[] {
  const removed = new Set(removedIds);
  const base = isReset ? [] : existing.filter((message) => !removed.has(message.id));
  const knownIds = new Set(base.map((message) => message.id));
  const additions = incoming.filter((message) => !removed.has(message.id) && !knownIds.has(message.id));
  return [...base, ...additions].slice(-MAX_RENDERED_MESSAGES);
}

/** Roving-focus index for a horizontal tab list (ArrowLeft/Right wrap, Home/End jump). */
export function nextTabIndex(key: string, currentIndex: number, tabCount: number): number | null {
  if (key === 'ArrowRight') return (currentIndex + 1) % tabCount;
  if (key === 'ArrowLeft') return (currentIndex - 1 + tabCount) % tabCount;
  if (key === 'Home') return 0;
  if (key === 'End') return tabCount - 1;
  return null;
}
