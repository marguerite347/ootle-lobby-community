# Ootle Lobby Community chat: rules, limits and moderation

**Stamp:** 2026-09-24
**Scope:** The **Community** tab of the chat sidebar: one public text room for players and creators.
The **Project room** tab is a separate room governed by [moderation-rules-20260924.md](moderation-rules-20260924.md).

**Status:** A local development slice. Legal has **not** reviewed it. Do not launch it to the public, or to minors, until the items under "Needs review before launch" are resolved.

## What people see

- A sidebar docked on the right (at 1100px and wider), or a **Chat** button that opens a full-height sheet on smaller screens.
- A persistent note in the room: *"Be kind. No personal info. Never share keys or seed phrases. Everything here is public."*
- A self-chosen display name, labelled *"You pick it. Names are not verified."*
- A **Report** button on each message (not shown on messages you just sent; the server refuses reports on your own).

## Room rules

1. Be kind. No slurs, harassment, threats or encouraging self-harm.
2. No personal info: yours or anyone else's (real names, addresses, phone numbers, emails, school, socials).
3. Never share keys, seed phrases or passwords. No moderator or team member will ever ask for them.
4. No links. Describe things in words; the Lobby's own pages are one click away in the header.
5. Text only. No images, files, DMs or mentions.
6. Everything posted is public to anyone who opens the Lobby.

## Enforced limits (server: `creator-hub/hub/server/communityChat.mjs`)

| Rule | Limit | Response |
| --- | --- | --- |
| Display name | 1–32 characters after trimming | 400 |
| Message body | 1–500 characters after trimming | 400 |
| Invisible characters | Control characters, zero-width characters and bidi overrides are removed; tabs become spaces; 3+ blank lines collapse to one | silent cleanup |
| Rendering | Stored and displayed as plain text; never parsed as HTML or Markdown | — |
| Links | URL schemes, `www.`, and `name.tld` for common TLDs (also `[.]`, `(.)`, ` dot `) rejected in names and bodies; this also catches emails | 400 `link` |
| Keys and seed phrases | `-----BEGIN`, 48+ hex characters, 44+ character base58 runs with mixed case and digits, or 12+ consecutive 3–8 letter words | 400 `secret`; client clears the draft |
| Blocklist | Whole-word match against `server/communityChatBlocklist.json` after lowercasing and undoing common swaps (`0→o`, `1→i`, `3→e`, `4→a`, `5→s`, `7→t`, `@→a`, `$→s`) | 400 `blocked`, neutral copy |
| Rate limit, per browser | 5 messages / 30 s | 429 `rate_limited` with seconds to wait |
| Rate limit, per IP | 20 messages / 30 s | 429 `rate_limited` |
| Duplicate | Same browser, same text (case and spacing ignored) within 2 min | 429 `duplicate` |
| Stored history | Newest 500 messages; API returns at most the newest 200 visible | — |

Rate-limit counters live in memory and reset when the server restarts. Behind a reverse proxy, enable Express `trust proxy` for the deployment so `req.ip` is the visitor, or all visitors share one IP bucket.

## Reports and moderation

1. Anyone can press **Report** on a message they did not send. Each browser counts once per message.
2. When **3 distinct browsers** report a message, it is hidden from everyone at once (`status: hidden`, `hiddenReason: reports`) and waits for review.
3. A moderator reviews the queue and restores, keeps hidden or deletes.

Moderator API (requires `Authorization: Bearer <token>`):

| Endpoint | Purpose |
| --- | --- |
| `GET /api/community-chat/moderation` | Hidden and reported messages with report counts |
| `POST /api/community-chat/messages/:id/moderate` `{ "action": "hide" \| "restore" \| "delete" }` | `hide` removes it from view; `restore` shows it again and clears reports; `delete` wipes name and body from disk and keeps only the id |

**Auth:** the hub has no global admin login. `manage-history` uses per-project keys, which do not fit a room-wide moderator. So moderation uses the `COMMUNITY_CHAT_MODERATOR_TOKEN` environment variable:

- Set a random value of at least 24 characters (for example `openssl rand -hex 32`) in the server's private environment. Never commit it or paste it into chat.
- Tokens are compared in constant time (SHA-256 digests with `timingSafeEqual`).
- If the variable is unset or shorter than 24 characters, moderation endpoints return 503 and nothing can be moderated. Reports still hide messages at the threshold.
- There is no moderator UI yet; use the API (for example with `curl`).

Public endpoints: `GET /api/community-chat/messages[?after=<id>]` (returns `messages`, `removedIds`, `reset`) and `POST /api/community-chat/messages` `{ name, body, clientId }`, `POST /api/community-chat/messages/:id/report` `{ clientId }`.

## What is stored

| Datum | Where | Visible to |
| --- | --- | --- |
| Display name, message body, timestamp, id | `<runtimeDir>/community-chat/messages.json` | Everyone (API and UI) |
| SHA-256 hash of the browser's random client id (author and reporters) | same file | Server only; never returned by the public API |
| IP address | Server memory only, for rate limiting | Not persisted |
| Display name, client id, ids this browser reported, dock open/collapsed | Browser `localStorage` | That browser only |

The client id is a random value, not an account. Clearing site data creates a new one.

## Not done in this slice

- No accounts, sign-in or verified identities. Anyone can pick any display name, including one that imitates someone else.
- No age gate, parental consent or age-appropriate design review.
- No ML or human pre-moderation. The blocklist is short and English-only; filters can be evaded, and they can reject harmless text (for example, a long lowercase sentence of 3–8 letter words may look like a seed phrase, and a base58 wallet address is rejected as a possible key).
- No moderator UI, audit log, appeals, bans or IP blocks.
- Reports can be abused: three browsers (or one person clearing storage) can hide any message until a moderator restores it.
- No retention policy beyond the 500-message cap, and no user-initiated deletion of one's own messages.
- No websockets; messages arrive by polling every 4 s while the room is on screen and the tab is visible.

## Needs review before launch

- Legal and compliance: minors (COPPA/GDPR-K style obligations), terms of use and community guidelines, privacy notice for stored messages, retention and deletion requests, and reporting obligations for illegal content.
- A named moderation owner, response time and escalation route.
- Whether the blocklist and secret filters are adequate, and in which languages.
- Deployment: `trust proxy`, a set moderator token, and backups/retention for `community-chat/messages.json`.

### Local polling implementation note

The current Community client reads a full bounded snapshot (up to 200 messages)
every four seconds while visible. Reads are serialized. A completed local send or
report invalidates any older read and queues a fresh snapshot, preserving unseen
peer messages and moderator restores. The API's optional `after` cursor only
tracks insertion order; it does not deliver restores of earlier messages. Other
clients must use full snapshots until that protocol supports moderation revisions.
