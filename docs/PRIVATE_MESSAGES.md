# Optional private messages

## Scope and reuse decision

This release adds opt-in encrypted one-to-one conversations and contact requests to the existing Lobby sidebar and `/chat`. Public guests still join immediately with generated names; no wallet or sign-in is introduced. Payments, persistent handles, device linking, external platform bridges and automatic bot replies are separate work.

The implementation inspected Caravel at `e5edec70b4c3ea64a008d0837e4613aeee2116b3` (MIT) and adapts only its `wrapMessage` / `unwrapMessage` approach. Its full wallet, relay and group provider is not copied. `nostr-tools@2.24.1` (Unlicense) is pinned in client and server, installed with lifecycle scripts disabled, and exercised by actual encryption/signature tests. Notices are retained at `/chat-notices.txt`. The shared wrapper also verifies outer and seal signatures, the rumor hash, authenticated author, recipient, conversation and logical message identity.

A representative trial sent a gift-wrapped message through `wss://nos.lol` using independent sender/recipient connections, recovered it after reconnecting, and rejected a third key. The product retains the existing authenticated PostgreSQL delivery service for ciphertext instead of adding public relay availability, relay discovery or wallet dependencies. This is an intentional refinement of the transport trial: public relay interoperability is not a shipped feature or claimed acceptance result. The browser exchange uses two independent guest sessions, not a relay echo.

References: [Caravel source](https://github.com/okansaglam016161-pixel/caravel), [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md), [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md). Reviewed October 10, 2026. This is a bounded implementation review, not an independent security audit.

## Contract

- A participant opts in via the private inbox or the private-message action on another participant's public message. A short-lived, single-use signed challenge binds their generated public key to their authenticated guest account and exact origin.
- Contacts have pending, accepted, declined and blocked states. The recipient must explicitly accept. Reverse simultaneous requests do not imply acceptance. Only the person who declined or blocked can reopen that decision. Blocking is enforced by the Lobby server for this conversation; it does not prevent someone creating a different disposable guest.
- Message bodies are encrypted in the browser into two NIP-59 copies: recipient and sender self-copy. The service accepts only envelopes, not an additional plaintext body field. Ciphertext is separate from public messages, search, feeds and moderation reports. Links do not generate automatic previews. Private messages are not bridged to external channels.
- The authenticated backend sees account IDs, public keys, contact state, timing, ciphertext size and acknowledgment timestamps. Encryption is not anonymity. The key directory is server-bound; users can compare the displayed key fingerprint through another trusted channel. Protection against a malicious key-directory service has not been independently audited.
- The client verifies cryptographic signatures and message context before rendering or acknowledging a message. Display names remain editable, unverified labels; routing uses immutable account IDs and keys.
- `Sent` means the service accepted ciphertext. `Received` means the recipient browser decrypted and rendered it and returned an authenticated acknowledgment. It is not a human read receipt. Bad ciphertext is not acknowledged. There is no simulated private typing or online status.
- Encrypted drafts and pending envelopes survive reload. Retry reuses the exact logical ID and envelopes. Public drafts are unchanged. Contact and unread badges are in-app only; mute suppresses a conversation's unread badge in that browser.

## Key and storage limits

A separate messaging secret is generated only on opt-in. IndexedDB stores it encrypted with an AES-GCM wrapping key generated as a nonextractable Web Crypto key. Draft text and pending envelopes are encrypted with that wrapping key. The plaintext secret and rendered messages exist in browser memory. Nonextractable storage is not protection from scripts running on this origin, browser extensions or a compromised device. There is no raw secret in localStorage, telemetry or server requests.

A unique IndexedDB insert and a same-origin Web Lock serialize key creation/binding across tabs. Reload keeps the identity; a server-bound key that is absent or mismatched locally yields an explicit unavailable state. It is never silently replaced. There is no recovery/export, key rotation or multi-device history synchronization in this release. Clearing browser data, leaving the disposable guest session, or letting its seven-day session expire can lose private access. Public chat remains available with a new guest. Historical messages are never reassigned based on a display name.

The existing retention task now removes private ciphertext older than 90 days and expired challenges. Its scheduled production operation and backups remain an operational gap; do not promise a guaranteed deletion deadline until those are verified. Contact records and key bindings persist independently of message retention.

## Activation and rollback

1. Apply additive `server/community/migrations/20261010_private_messages.sql` to the already-authorized chat database. Verify RLS, backend DML grants and no `anon`/`authenticated` grants for all four new tables. No new browser database credential or exposed schema is needed.
2. Deploy the full accepted revision with `CHAT_PRIVATE_ENABLED=1` in the existing server-only Vercel environment. `/api/chat/capabilities` must advertise `privateMessages: true` only when the chat service is also configured. Local preview explicitly enables the feature.
3. Verify contact request, acceptance, both directions of receipt, reload and blocked access in dedicated test sessions on the stable alias. Keep production synthetic messages bounded.
4. Roll back by setting `CHAT_PRIVATE_ENABLED=0` and redeploying. Private routes then return 503 and the entry point disappears. Public chat continues. Do not remove the migration, ciphertext, bindings, browser keys or evidence. Re-enable with the same settings and schema after correction.

The immutable deployment hostname is a snapshot, not the shared current-release link. Use `https://ootle-lobby-preview.vercel.app/?chat=open` and check its exact build revision.

## Acceptance and maintenance

Run `node --test test/private-chat.test.mjs`, the existing chat tests, client tests, `npm test`, `npm run validate`, and `npm run build:site`. Through CUA test distinct browser sessions, request consent/decline/block, bidirectional decryption, reconnect, failed retry without duplication, storage loss, safe rendering and public-chat regressions. Test the sidebar, `/chat` and 390px viewport. Keep synthetic evidence and recordings outside the public repository.

When upgrading nostr-tools or changing the mailbox/key lifecycle, repeat the tamper, author/recipient/context binding, session replay, permission, retry and two-browser tests. Record the pinned dependency versions and actual deployment result. Do not broaden claims to audited security, external interoperability, recovery or message delivery without corresponding evidence.
