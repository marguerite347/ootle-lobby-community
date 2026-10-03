// Engagement store: front-end likes/stars and comments for resources and projects.
// Persisted as JSON under the runtime data dir (redirectable via CREATOR_HUB_DATA_DIR).
// There is no account system yet, so a star is keyed by a client-generated anonymous
// user id and comments carry a self-declared author (moderation/claims are future work,
// consistent with CREATOR_HUB.md's community-contribution notes).

import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { runtimeDir } from './paths.mjs';

const FILE = path.join(runtimeDir, 'engagement.json');
const KINDS = new Set(['resource', 'project']);

let db = null;

function load() {
  if (db) return db;
  if (existsSync(FILE)) {
    try { db = JSON.parse(readFileSync(FILE, 'utf8')); } catch { db = null; }
  }
  if (!db) db = { stars: {}, comments: {} };
  return db;
}

function persist() {
  mkdirSync(runtimeDir, { recursive: true });
  const tmp = `${FILE}.tmp-${crypto.randomUUID()}`;
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  renameSync(tmp, FILE);
}

function key(kind, id) {
  if (!KINDS.has(kind)) { const e = new Error('invalid kind'); e.status = 400; throw e; }
  if (!id) { const e = new Error('id required'); e.status = 400; throw e; }
  return `${kind}:${id}`;
}

export function counts(kind, id) {
  const d = load();
  const k = key(kind, id);
  return { stars: (d.stars[k] || []).length, comments: (d.comments[k] || []).length };
}

export function state(kind, id, user) {
  const d = load();
  const k = key(kind, id);
  const stars = d.stars[k] || [];
  return {
    stars: stars.length,
    starred: user ? stars.includes(user) : false,
    comments: (d.comments[k] || []).map(publicComment),
  };
}

export function toggleStar(kind, id, user) {
  if (!user) { const e = new Error('user id required'); e.status = 400; throw e; }
  const d = load();
  const k = key(kind, id);
  const set = new Set(d.stars[k] || []);
  let starred;
  if (set.has(user)) { set.delete(user); starred = false; } else { set.add(user); starred = true; }
  d.stars[k] = [...set];
  persist();
  return { stars: d.stars[k].length, starred };
}

export function addComment(kind, id, { author, body }) {
  const text = String(body || '').trim();
  if (!text) { const e = new Error('comment body required'); e.status = 400; throw e; }
  if (text.length > 2000) { const e = new Error('comment too long'); e.status = 400; throw e; }
  const d = load();
  const k = key(kind, id);
  const comment = {
    id: crypto.randomUUID(),
    author: (String(author || 'anonymous').trim() || 'anonymous').slice(0, 60),
    body: text,
    at: new Date().toISOString(),
  };
  d.comments[k] = [...(d.comments[k] || []), comment];
  persist();
  return publicComment(comment);
}

function publicComment(c) {
  return { id: c.id, author: c.author, body: c.body, at: c.at };
}
