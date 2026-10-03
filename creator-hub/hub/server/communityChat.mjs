// Community chat: one public text room for players and creators.
// Persistence mirrors collectiveChat.mjs (atomic JSON write under runtimeDir).
// Rules, limits and moderation flow: creator-hub/agents/chat/community-chat-rules.md

import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { runtimeDir } from './paths.mjs';

export const LIMITS = Object.freeze({
  NAME_MAX_LENGTH: 32,
  BODY_MAX_LENGTH: 500,
  MAX_STORED_MESSAGES: 500,
  MAX_RETURNED_MESSAGES: 200,
  RATE_LIMIT_MESSAGES: 5,
  // Looser per-IP cap: households, schools and NAT share an address. Behind a reverse
  // proxy, enable Express "trust proxy" or every visitor shares one IP bucket.
  IP_RATE_LIMIT_MESSAGES: 20,
  RATE_LIMIT_WINDOW_MS: 30_000,
  DUPLICATE_WINDOW_MS: 2 * 60_000,
  REPORTS_TO_HIDE: 3,
  MODERATOR_TOKEN_MIN_LENGTH: 24,
});

export const MODERATOR_TOKEN_ENV = 'COMMUNITY_CHAT_MODERATOR_TOKEN';

// User-facing rejection copy. Keep in sync with community-chat-rules.md.
export const REJECTIONS = Object.freeze({
  clientMissing: 'Chat couldn’t identify this browser. Reload and try again.',
  nameRequired: 'Pick a display name first.',
  nameTooLong: `Display names max out at ${LIMITS.NAME_MAX_LENGTH} characters.`,
  bodyRequired: 'Type a message first.',
  bodyTooLong: `Keep it under ${LIMITS.BODY_MAX_LENGTH} characters.`,
  link: 'No links in Community chat. It keeps phishing out. Describe it in words instead.',
  secret: 'That looks like a key or seed phrase. Never share keys or seed phrases with anyone. Message not sent.',
  blocked: 'That message breaks the community rules, so it wasn’t sent.',
  duplicate: 'You just sent that. Say something new.',
  rateLimited: (seconds) => `Slow down a sec. Try again in ${seconds}s.`,
  notFound: 'Message not found.',
  ownReport: 'You can’t report your own message.',
  moderationOff: 'Moderation isn’t set up on this server.',
  moderatorTokenMissing: 'Moderator token required.',
  moderatorTokenWrong: 'Moderator token not accepted.',
  moderationAction: 'Action must be hide, restore or delete.',
});

const MODERATION_ACTIONS = new Set(['hide', 'restore', 'delete']);
const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

// C0/C1 controls (except newline), zero-width characters and bidi overrides.
// Bidi overrides can make text render differently from what is stored.
const INVISIBLE_OR_CONTROL_CHARACTERS =
  /[\u0000-\u0009\u000B-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

const URL_SCHEME_PATTERN = /\b(?:https?|ftp|ipfs|magnet):/i;
const WWW_PATTERN = /\bwww\s*\./i;
// A label followed by a common TLD. Plain dots only allow no spacing so "e.g. me" passes;
// "[.]", "(.)" and " dot " cover the usual obfuscations.
const DOMAIN_PATTERN =
  /\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.|\s*\[\.\]\s*|\s*\(\.\)\s*|\s+dot\s+)(?:com|net|org|io|gg|xyz|app|dev|co|me|ly|tv|info|biz|ru|cn|link|site|online|top|club|shop|live|ai|gl|to|be|us|uk|de|fr|click|win|bet|finance|money|cash|pro|fun|space|website|tk|ml|ga|cf|cc|ws|su|in|zip|mov|sh|lol|xxx|onion|eth|crypto)\b/i;

const PEM_HEADER_PATTERN = /-----BEGIN/i;
const LONG_HEX_PATTERN = /\b(?:0x)?[0-9a-f]{48,}\b/i;
const BASE58_RUN_PATTERN = /[1-9A-HJ-NP-Za-km-z]{44,}/g;
// BIP39 English words are 3-8 letters; a run of 12+ such words looks like a seed phrase.
const SEED_PHRASE_PATTERN = /(?:^|[^a-z])(?:[a-z]{3,8}\s+){11,}[a-z]{3,8}(?![a-z])/;

const CHARACTER_SWAPS = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };

const DEFAULT_BLOCKLIST = JSON.parse(
  readFileSync(new URL('./communityChatBlocklist.json', import.meta.url), 'utf8'),
);

// `code` lets the client react to a rejection kind (e.g. clear a draft holding a secret).
function fail(message, status = 400, code = undefined) {
  throw Object.assign(new Error(message), { status, code });
}

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function stripInvisibleCharacters(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, ' ')
    .replace(INVISIBLE_OR_CONTROL_CHARACTERS, '');
}

export function cleanName(rawName) {
  return stripInvisibleCharacters(rawName).replace(/\s+/g, ' ').trim();
}

export function cleanBody(rawBody) {
  return stripInvisibleCharacters(rawBody)
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function containsLink(text) {
  return URL_SCHEME_PATTERN.test(text) || WWW_PATTERN.test(text) || DOMAIN_PATTERN.test(text);
}

function looksLikeBase58Key(text) {
  const runs = text.match(BASE58_RUN_PATTERN) || [];
  return runs.some((run) => /\d/.test(run) && /[A-Z]/.test(run) && /[a-z]/.test(run));
}

export function looksLikeSecret(text) {
  return (
    PEM_HEADER_PATTERN.test(text) ||
    LONG_HEX_PATTERN.test(text) ||
    looksLikeBase58Key(text) ||
    SEED_PHRASE_PATTERN.test(text.toLowerCase())
  );
}

function normalizeForBlocklist(text) {
  const withoutAccents = text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const unswapped = [...withoutAccents].map((character) => CHARACTER_SWAPS[character] ?? character).join('');
  return ` ${unswapped.replace(/[^a-z]+/g, ' ').trim()} `;
}

export function createBlocklistMatcher(blocklist = DEFAULT_BLOCKLIST) {
  const entries = [...(blocklist.terms || []), ...(blocklist.phrases || [])]
    .map((entry) => normalizeForBlocklist(entry))
    .filter((entry) => entry.trim());
  return (text) => {
    const normalized = normalizeForBlocklist(text);
    return entries.some((entry) => normalized.includes(entry));
  };
}

function normalizeForDuplicateCheck(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function publicMessage(message) {
  return { id: message.id, at: message.at, name: message.name, body: message.body };
}

function isVisible(message) {
  return message.status === 'visible';
}

// Sliding-window counter kept in memory. Restarting the server resets it.
function createRateLimiter({ limit, windowMs }) {
  const eventsByKey = new Map();

  function recentEvents(key, nowMs) {
    const events = (eventsByKey.get(key) || []).filter((at) => nowMs - at < windowMs);
    if (events.length) eventsByKey.set(key, events);
    else eventsByKey.delete(key);
    return events;
  }

  return {
    secondsUntilAllowed(key, nowMs) {
      const events = recentEvents(key, nowMs);
      if (events.length < limit) return 0;
      const oldestCountedAt = events[events.length - limit];
      return Math.ceil((windowMs - (nowMs - oldestCountedAt)) / 1000);
    },
    record(key, nowMs) {
      eventsByKey.set(key, [...recentEvents(key, nowMs), nowMs]);
    },
  };
}

function tokensMatch(expected, provided) {
  // Compare fixed-length digests so timing does not reveal length or prefix matches.
  return crypto.timingSafeEqual(Buffer.from(hashValue(expected), 'hex'), Buffer.from(hashValue(provided), 'hex'));
}

export function createCommunityChat(options = {}) {
  const dataDir = options.dataDir || path.join(runtimeDir, 'community-chat');
  const storeFile = path.join(dataDir, 'messages.json');
  const now = options.now || (() => Date.now());
  const readModeratorToken = options.moderatorToken
    ? () => options.moderatorToken
    : () => process.env[MODERATOR_TOKEN_ENV] || '';
  const isBlocked = createBlocklistMatcher(options.blocklist);
  const clientRateLimiter = createRateLimiter({
    limit: LIMITS.RATE_LIMIT_MESSAGES,
    windowMs: LIMITS.RATE_LIMIT_WINDOW_MS,
  });
  const ipRateLimiter = createRateLimiter({
    limit: LIMITS.IP_RATE_LIMIT_MESSAGES,
    windowMs: LIMITS.RATE_LIMIT_WINDOW_MS,
  });

  function loadMessages() {
    if (!existsSync(storeFile)) return [];
    try {
      const data = JSON.parse(readFileSync(storeFile, 'utf8'));
      return Array.isArray(data?.messages) ? data.messages : [];
    } catch {
      return [];
    }
  }

  function saveMessages(messages) {
    mkdirSync(dataDir, { recursive: true });
    const retained = messages.slice(-LIMITS.MAX_STORED_MESSAGES);
    const temporaryFile = `${storeFile}.tmp-${crypto.randomUUID()}`;
    writeFileSync(temporaryFile, JSON.stringify({ version: 1, messages: retained }, null, 2));
    renameSync(temporaryFile, storeFile);
  }

  function requireClientHash(clientId) {
    const id = String(clientId ?? '');
    if (!CLIENT_ID_PATTERN.test(id)) fail(REJECTIONS.clientMissing);
    return hashValue(`community-chat-client:${id}`);
  }

  function validateName(rawName) {
    const name = cleanName(rawName);
    if (!name) fail(REJECTIONS.nameRequired);
    if (name.length > LIMITS.NAME_MAX_LENGTH) fail(REJECTIONS.nameTooLong);
    if (containsLink(name)) fail(REJECTIONS.link, 400, 'link');
    if (isBlocked(name)) fail(REJECTIONS.blocked, 400, 'blocked');
    return name;
  }

  function validateBody(rawBody) {
    const body = cleanBody(rawBody);
    if (!body) fail(REJECTIONS.bodyRequired);
    if (body.length > LIMITS.BODY_MAX_LENGTH) fail(REJECTIONS.bodyTooLong);
    if (looksLikeSecret(body)) fail(REJECTIONS.secret, 400, 'secret');
    if (containsLink(body)) fail(REJECTIONS.link, 400, 'link');
    if (isBlocked(body)) fail(REJECTIONS.blocked, 400, 'blocked');
    return body;
  }

  function rejectDuplicate(messages, clientHash, body, nowMs) {
    const normalizedBody = normalizeForDuplicateCheck(body);
    const isDuplicate = messages.some(
      (message) =>
        message.clientHash === clientHash &&
        nowMs - Date.parse(message.at) < LIMITS.DUPLICATE_WINDOW_MS &&
        normalizeForDuplicateCheck(message.body) === normalizedBody,
    );
    if (isDuplicate) fail(REJECTIONS.duplicate, 429, 'duplicate');
  }

  function listMessages({ after } = {}) {
    const messages = loadMessages();
    const afterIndex = after ? messages.findIndex((message) => message.id === after) : -1;
    const isIncremental = afterIndex >= 0;
    const candidates = isIncremental ? messages.slice(afterIndex + 1) : messages;
    return {
      messages: candidates.filter(isVisible).slice(-LIMITS.MAX_RETURNED_MESSAGES).map(publicMessage),
      removedIds: messages.filter((message) => !isVisible(message)).map((message) => message.id),
      reset: Boolean(after) && !isIncremental,
      limits: { nameMaxLength: LIMITS.NAME_MAX_LENGTH, bodyMaxLength: LIMITS.BODY_MAX_LENGTH },
    };
  }

  function postMessage(input = {}, { ip = '' } = {}) {
    const clientHash = requireClientHash(input.clientId);
    const name = validateName(input.name);
    const body = validateBody(input.body);
    const nowMs = now();
    const waitSeconds = Math.max(
      clientRateLimiter.secondsUntilAllowed(clientHash, nowMs),
      ipRateLimiter.secondsUntilAllowed(ip, nowMs),
    );
    if (waitSeconds > 0) fail(REJECTIONS.rateLimited(waitSeconds), 429, 'rate_limited');

    const messages = loadMessages();
    rejectDuplicate(messages, clientHash, body, nowMs);

    const message = {
      id: crypto.randomUUID(),
      at: new Date(nowMs).toISOString(),
      name,
      body,
      clientHash,
      reporterHashes: [],
      status: 'visible',
    };
    saveMessages([...messages, message]);
    clientRateLimiter.record(clientHash, nowMs);
    ipRateLimiter.record(ip, nowMs);
    return publicMessage(message);
  }

  function findMessage(messages, messageId) {
    const index = messages.findIndex((message) => message.id === String(messageId ?? ''));
    if (index < 0 || messages[index].status === 'deleted') fail(REJECTIONS.notFound, 404);
    return index;
  }

  function reportMessage(messageId, input = {}) {
    const reporterHash = requireClientHash(input.clientId);
    const messages = loadMessages();
    const index = findMessage(messages, messageId);
    const message = messages[index];
    if (message.clientHash === reporterHash) fail(REJECTIONS.ownReport);

    const reporterHashes = new Set(message.reporterHashes || []);
    reporterHashes.add(reporterHash);
    const shouldHide = isVisible(message) && reporterHashes.size >= LIMITS.REPORTS_TO_HIDE;
    messages[index] = {
      ...message,
      reporterHashes: [...reporterHashes],
      ...(shouldHide ? { status: 'hidden', hiddenReason: 'reports', hiddenAt: new Date(now()).toISOString() } : {}),
    };
    saveMessages(messages);
    return { id: message.id, reported: true, hidden: !isVisible(messages[index]) };
  }

  function authorizeModerator(providedToken) {
    const expectedToken = readModeratorToken();
    if (expectedToken.length < LIMITS.MODERATOR_TOKEN_MIN_LENGTH) fail(REJECTIONS.moderationOff, 503);
    if (!providedToken) fail(REJECTIONS.moderatorTokenMissing, 401);
    if (!tokensMatch(expectedToken, providedToken)) fail(REJECTIONS.moderatorTokenWrong, 403);
  }

  function moderationQueue(providedToken) {
    authorizeModerator(providedToken);
    const flagged = loadMessages().filter(
      (message) => message.status !== 'deleted' && (!isVisible(message) || message.reporterHashes?.length),
    );
    return {
      messages: flagged.map((message) => ({
        ...publicMessage(message),
        status: message.status,
        hiddenReason: message.hiddenReason || null,
        reportCount: message.reporterHashes?.length || 0,
      })),
    };
  }

  function applyModeration(message, action) {
    const moderatedAt = new Date(now()).toISOString();
    if (action === 'hide') return { ...message, status: 'hidden', hiddenReason: 'moderator', hiddenAt: moderatedAt };
    if (action === 'restore') {
      return { ...message, status: 'visible', hiddenReason: undefined, hiddenAt: undefined, reporterHashes: [] };
    }
    // Delete wipes the content from disk; only the id stays so clients can drop it.
    return { id: message.id, at: message.at, name: '', body: '', status: 'deleted', deletedAt: moderatedAt };
  }

  function moderateMessage(messageId, input = {}, providedToken) {
    authorizeModerator(providedToken);
    const action = String(input.action ?? '');
    if (!MODERATION_ACTIONS.has(action)) fail(REJECTIONS.moderationAction);
    const messages = loadMessages();
    const index = findMessage(messages, messageId);
    messages[index] = applyModeration(messages[index], action);
    saveMessages(messages);
    return { id: messages[index].id, status: messages[index].status };
  }

  return { listMessages, postMessage, reportMessage, moderationQueue, moderateMessage };
}
