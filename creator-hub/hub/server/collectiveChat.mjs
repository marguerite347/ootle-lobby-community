// Collective chat Slice 1: one shared project room with persisted work updates.
// Mirrors engagement.mjs atomic JSON persistence under runtimeDir.

import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { runtimeDir } from './paths.mjs';

const ROOMS_DIR = path.join(runtimeDir, 'collective-chat', 'rooms');
const KINDS = new Set(['working', 'blocker', 'delivered']);
const AUTHOR_KINDS = new Set(['Human', 'Agent', 'Moderator', 'System']);
const CLIENT_STATES = new Set(['queued', 'sent', 'failed']);
const DEFAULT_ROOM = 'lobby-collective';
const ROOM_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

function bad(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  throw e;
}

function roomPath(roomId) {
  const id = String(roomId || '').trim();
  if (!ROOM_ID_RE.test(id)) bad('invalid room id');
  return path.join(ROOMS_DIR, `${id}.json`);
}

function loadRoom(roomId) {
  const file = roomPath(roomId);
  if (!existsSync(file)) return { roomId, messages: [] };
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (!data || !Array.isArray(data.messages)) return { roomId, messages: [] };
    return { roomId, messages: data.messages };
  } catch {
    return { roomId, messages: [] };
  }
}

function persistRoom(room) {
  mkdirSync(ROOMS_DIR, { recursive: true });
  const file = roomPath(room.roomId);
  const tmp = `${file}.tmp-${crypto.randomUUID()}`;
  writeFileSync(tmp, JSON.stringify({ roomId: room.roomId, messages: room.messages }, null, 2));
  renameSync(tmp, file);
}

function publicMessage(m) {
  const out = {
    id: m.id,
    at: m.at,
    author: m.author,
    authorKind: m.authorKind,
    body: m.body,
    kind: m.kind,
    clientState: m.clientState,
  };
  if (m.roleName) out.roleName = m.roleName;
  if (m.artifactUrl) out.artifactUrl = m.artifactUrl;
  if (m.label) out.label = m.label;
  return out;
}

function identityLabel(authorKind, roleName) {
  if (authorKind === 'Agent') {
    const role = String(roleName || '').trim();
    return role ? `Agent · ${role}` : 'Agent';
  }
  return authorKind;
}

export function getRoom(roomId = DEFAULT_ROOM) {
  const room = loadRoom(roomId || DEFAULT_ROOM);
  return { roomId: room.roomId, messages: room.messages.map(publicMessage) };
}

export function addMessage(roomId, input = {}) {
  const id = String(roomId || DEFAULT_ROOM).trim() || DEFAULT_ROOM;
  const body = String(input.body || '').trim();
  if (!body) bad('body required');
  if (body.length > 2000) bad('body must be 1-2000 characters');

  const kind = String(input.kind || '').trim();
  if (!KINDS.has(kind)) bad('kind must be working, blocker, or delivered');

  const authorKind = String(input.authorKind || '').trim();
  if (!AUTHOR_KINDS.has(authorKind)) bad('authorKind must be Human, Agent, Moderator, or System');

  const author = String(input.author || '').trim().slice(0, 80);
  if (!author) bad('author required (max 80 characters)');

  let roleName = undefined;
  if (authorKind === 'Agent') {
    roleName = String(input.roleName || input.authorRole || '').trim().slice(0, 80) || undefined;
  }

  let artifactUrl = undefined;
  if (input.artifactUrl != null && String(input.artifactUrl).trim()) {
    artifactUrl = String(input.artifactUrl).trim().slice(0, 2000);
  }

  const message = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    author,
    authorKind,
    roleName,
    body,
    kind,
    artifactUrl,
    clientState: 'sent',
    label: identityLabel(authorKind, roleName),
  };

  const room = loadRoom(id);
  room.messages = [...room.messages, message];
  persistRoom(room);
  return publicMessage(message);
}

export function patchMessageState(roomId, messageId, clientState) {
  const state = String(clientState || '').trim();
  if (!CLIENT_STATES.has(state)) bad('clientState must be queued, sent, or failed');
  const mid = String(messageId || '').trim();
  if (!mid) bad('message id required');

  const room = loadRoom(roomId || DEFAULT_ROOM);
  const idx = room.messages.findIndex((m) => m.id === mid);
  if (idx < 0) bad('message not found', 404);
  room.messages[idx] = { ...room.messages[idx], clientState: state };
  persistRoom(room);
  return publicMessage(room.messages[idx]);
}

export const defaults = { DEFAULT_ROOM, KINDS: [...KINDS], AUTHOR_KINDS: [...AUTHOR_KINDS] };
