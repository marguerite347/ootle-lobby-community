# Ootle community chat

This implementation puts the working community chat in the Lobby's existing right sidebar. "Pop out" opens the same conversation in a larger `/chat` view; both reuse one chat component and the same authenticated `/api/chat` service. It does not reopen the old anonymous community/project/collective chat handlers. Hosted chat is default-off. A separate invite-only test deployment uses the existing Ootle Supabase project through a private schema and a dedicated backend role. No external channels are connected and no cross-app messages have been sent.

## Working first slice

- Conversation selection, text messages, threads/replies, message search and device-local drafts.
- PostgreSQL storage, identity-bound authors, single-use expiring invitations or invite-only GitHub sign-in using state and PKCE, revocable opaque sessions stored as hashes, and exact-origin mutation checks.
- Server-owned roles, private channel membership, duplicate-safe sends, shared account quotas, reports, authorized hide/restore and moderator audit history.
- A cross-post data model with source platform/remote IDs, explicit destinations, an atomic delivery outbox, and separate queued/sending/delivered/failed/uncertain states. The HTTP service currently rejects external destinations. No transport worker is enabled.
- A local preview with visibly labeled fictional conversations and a separate local account. It is loopback-only and refuses to start on Vercel. Its data lives in ignored `work/community-preview/`, never in Git.

The first UI shows the most recent 100 messages per channel and direct replies within that window. Older-message pagination, comprehensive thread retrieval, attachments, edits, reactions, browser notifications, and cross-device draft/unread synchronization remain follow-up work. Private channels and membership currently require operator provisioning; no public channel-creation UI is enabled.

## Run the review environment

```sh
npm ci --ignore-scripts
npm --prefix creator-hub/hub ci --ignore-scripts
npm --prefix creator-hub/hub/client run build
node scripts/start-community-preview.mjs
```

Open `http://127.0.0.1:4318/`, open the Chat sidebar, then enter the local preview. The larger view is also available at `/chat`. Drafts synchronize between same-origin windows, and the sidebar stops polling while collapsed. The preview uses embedded PostgreSQL (PGlite) on disk, including the real storage and authorization code. It is not proof of a hosted multi-instance deployment or a live OAuth provider connection. `CHAT_PREVIEW_DIR` can select another local test-data folder.

## Hosted activation

Provision an operator-approved PostgreSQL database with TLS certificate validation and a backend-only credential. A Supabase-hosted PostgreSQL database is compatible; its browser Data API and anonymous keys are not used. The schema is private, table RLS is enabled, and browser roles receive no access. Use a dedicated backend role/credential; never put it in frontend variables.

Configure only on the intended environment:

| Setting | Purpose |
| --- | --- |
| `CHAT_ENABLED=1` | Explicitly enables the new service. Omit to keep it closed. |
| `CHAT_DATABASE_URL` | Server-only TLS database connection. |
| `CHAT_DATABASE_CA` | Optional provider CA certificate in PEM form. Certificate verification is always required. |
| `CHAT_PUBLIC_ORIGIN` | Exact HTTPS origin; no wildcard origins. |
| `CHAT_INVITES_ENABLED=1` | Enables single-use invitations for the shared test. |
| `CHAT_INVITE_SECRET` | Server-only random key for hashing invitation rate-limit buckets. |
| `CHAT_GITHUB_CLIENT_ID` | Optional identity-only OAuth app client ID. |
| `CHAT_GITHUB_CLIENT_SECRET` | Server-only OAuth app secret. |
| `CHAT_OWNER_GITHUB_ID` | Verified numeric GitHub account ID for initial owner creation. |
| `CHAT_ALLOWED_GITHUB_IDS` | Comma-separated IDs invited to the chat. |
| `CHAT_OPEN_ENROLLMENT=1` | Optional community enrollment; default is invite-only. This never grants repository access. |

Set the OAuth callback to `<CHAT_PUBLIC_ORIGIN>/api/chat/auth/callback`. It requests no repository scopes and never stores the provider access token. Session cookies are Secure, HttpOnly and SameSite=Lax in hosted mode. The owner ID only sets a role on initial account creation; later role changes require an explicit operator action.

Before activation, install the schema in the selected database with `node scripts/manage-community.mjs install`. This is an initial schema installer, not a migration runner for future incompatible changes. The shared test installs this schema in the existing `ootle-workbench` project. The `ootle_chat_preview` login has only schema usage and table DML with backend-only RLS policies; it has no access to the Auth schema, no superuser privileges, and cannot bypass RLS. Browser roles have no schema or table grants.

Run `node scripts/manage-community.mjs retention` daily through the chosen hosting scheduler. Messages expire after 90 days; old parent messages with live replies retain only an expired placeholder. Moderator audit records expire after 180 days, expired sessions/login attempts are removed, and rate-limit records expire after a day. The scheduler is not configured by this branch. Verify its execution before opening hosted enrollment.

Before public activation, verify the real OAuth callback, owner/member/private-channel boundaries, moderation, shared quotas from two live app instances, persistence across a deployment, scheduled retention, and restored backups. Apply schema changes through the selected database provider's migration workflow and inspect its security advisors. Local tests do not replace these deployment checks.

## Shared two-person test

The shared test uses single-use invitations because it does not yet have a GitHub OAuth app. Invitations contain 256-bit random secrets; only their hashes are stored in PostgreSQL. Redemption atomically creates an account and a seven-day session, using the invitation's server-owned role. Invitation codes expire after seven days and never let the browser select its own role or account ID. Each person chooses a display name; these are test identities, not verified GitHub identities.

The operator can issue an invitation with `node scripts/manage-community.mjs invite "Tester" member /absolute/private/path/invite.json`, using the chat database and public-origin environment variables. Use `owner` only for the community owner. This writes a mode-0600 file outside the repository. Share a separate link with each person. The fragment carries the code to the join form without sending it in an HTTP URL; the form clears it from browser history. Joining requires an explicit form submission. Do not log invitation codes or commit these files. Signing out ends that session; issue a fresh invitation when access is needed again.

The test URL is `https://ootle-lobby-chat-test-peekaboo4.vercel.app/?chat=open`. Its deployment runtime variables are scoped to that preview deployment, because this Vercel project has no linked Git repository for branch-scoped variables. Production variables and the production alias are unchanged. For future redeployments, provide the same private runtime settings and move only the test alias after verification.

## Cross-app posting and aggregation contract

Every imported message must preserve the platform, remote channel/message ID, source author, source URL where supported, and parent-thread mapping. External identities are not native account claims. Never create native moderator/owner roles from source names or untrusted webhook metadata.

Channel owners authorize each connection and its read/post permissions. The app must not infer that a chat visible to an operator is approved for aggregation. Private source messages remain behind the same audience restrictions; imports must not silently broaden their readership.

Use the existing Chat SDK adapters as the first transport candidate, with a durable state adapter. Do not add an AI auto-responder by default. Credentials stay server-side, inbound signatures are verified before ingestion, and normalized remote IDs deduplicate replayed events. Own-bot events and delivery receipts must suppress echoes; imported messages never automatically fan out to other channels.

Posting is explicit: choose destinations, review the exact message and audience, then create the native message and delivery rows in one transaction. Only authorized publishers can cross-post. The worker must re-check connection/posting permissions before sending. A platform receipt marks delivery; an ambiguous timeout remains `uncertain` and must not be blindly retried. Retrying one failed destination must not resend successful ones. Editing a message, deleting it, and synchronizing reactions need separate policies.

Transport-specific gaps to resolve with the chosen first channels:

- Telegram bot access requires the appropriate group/channel permissions; bots cannot retrieve arbitrary complete historical messages. Privacy-mode and channel-owner authorization must be verified for the actual channel.
- Ordinary Discord message aggregation requires Gateway events, not just HTTP interactions; the gateway lifecycle and approved message-content access need a tested deployment path.
- Slack requires the workspace app installation and the exact channel scopes/membership. The operator's Codex Slack connector does not authorize the deployed app.

References: [Chat SDK adapters](https://chat-sdk.dev/docs/adapters), [Telegram adapter](https://chat-sdk.dev/adapters/official/telegram), [Discord adapter](https://chat-sdk.dev/adapters/official/discord), [GitHub OAuth state and PKCE](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).

## API and checks

Public capability read: `GET /api/chat/capabilities`. Sign-in/session routes: `GET /session`, `GET /auth/start`, `GET /auth/callback`, `POST /logout`. When enabled, `POST /invitations/redeem` exchanges an unused invitation plus display name for a secure session. The local preview alone exposes `POST /preview/session`.

Authenticated routes under `/api/chat`: `GET /channels`, `GET /channels/:id/messages?q=&before=`, `POST /messages`, `POST /messages/:id/report`, `GET /moderation`, `POST /messages/:id/moderate`. Every mutation requires the exact Origin and `X-Ootle-Chat: 1`; public bodies never determine the actor or role. Unknown chat endpoints terminate within this router. Other Lobby write routes remain blocked by the existing guard.

Validation: `node --test test/community-chat.test.mjs`, `npm test`, `npm run validate`, and the client build/tests. The chat suite covers real PostgreSQL persistence/restart, isolation, quotas, moderation, idempotency, atomic cross-post plans, HTTP CSRF/session boundaries, RLS denial for browser roles, and OAuth state/PKCE with a controlled provider fixture. Live transport delivery and real-provider OAuth are not claimed.

Browser acceptance on 2026-10-09 exercised native posting, replies, channel switching with draft recovery, search, report/hide/restore, and the explicitly unconnected destination picker. A clean local server restart preserved the session, posted message and reply. At widths 375, 390, 768, 1024 and 1440, the composer stayed visible and the page had no horizontal overflow; message text remained 16px. This was the loopback review environment with fictional sample conversations.

The sidebar follow-up verified native posting alongside the Lobby, channel/draft preservation through collapse and reopen, thread viewing, a 390px mobile sheet, and nested dialog Escape handling without closing the sheet. Pop out opened the selected builders channel; editing its draft synchronized back into the sidebar. Embedded chat does not replace the Lobby document title. Its layout responds to the panel width, so a 360px dock remains compact even on a wide desktop.

## Selection receipt

Reused the Lobby's React/Vite shell, Poppins assets, Express security headers and error handling, Node test runner and current GitHub workflow. The former file-backed chat was inspected but not reused as a hosted store because its browser-selected identity and local JSON state do not meet the chat boundary. The first PostgreSQL trial exercised a real send/reply, duplicate retry, private-channel rejection and moderation before the broader UI implementation.

`pg` is installed for hosted PostgreSQL and PGlite for the local preview/tests; the disk restart test verifies the local persistence path. For the shared test, the existing Supabase connector applied the private schema and dedicated role to the Ootle Workbench project. A representative TLS-verified PostgreSQL connection proved chat-schema access and Auth-schema denial; Supabase security advisors reported no findings. This reuses the tested store and avoids adding an Edge Function relay or a second paid project. Vercel CLI account access was verified; its MCP connector did not authorize the same team. The CLI handles the separate preview deployment. Chat SDK documentation was inspected as the transport shortlist; its adapters are not installed or connected in this implementation. The resource-first, Chat SDK, frontend-design and responsive-design skills informed this work.
