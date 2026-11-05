# Lobby launch integration — October 29, 2026

## Selection receipt

- Reuse: the public `marguerite347/ootle-lobby-community` repository, its reviewed contribution path, existing Express chat/database, and tested Vercel deployment package. Base: `42c2b39e8902cfedbab9e31a534d86f166b49439` on `main`.
- Why: the actual `lobby.tari.com/build.json` matched main. The browser reproduced an origin rejection when joining chat; `/ootle` still reported that signup was disconnected. This is an integration/configuration repair, not a new site or chat service.
- Availability: owner GitHub CLI is authenticated as `marguerite347`; existing Vercel CLI 65.7.0 accesses `peekaboo4/ootle-lobby-preview`. The Vercel connector can inspect deployments but cannot read that team's environment configuration, so the already authenticated CLI is used for deployment configuration.
- Trial: tests through the actual public Express entry point verify the provider's exact JSON contract, truthful success/failure, origin/header checks and unchanged unrelated write restrictions. Chat tests exercise both explicitly listed origins, separate guest sessions, and rejection of untrusted origins.
- Remaining external input: a public Turnstile site key authorized for `lobby.tari.com` and accepted by the existing Tari newsletter backend. No secret key, one-time response token, or replacement mailing list is needed in the Lobby.

## Changes

1. Support an explicit `CHAT_ADDITIONAL_ORIGINS` list. Keep the existing primary origin and its browser-local private keys usable. Do not permit arbitrary origins, wildcard CORS, or unauthenticated message writes.
2. Honor `PUBLIC_SITE_URL` in the Vercel entry point, defaulting to `https://lobby.tari.com`.
3. Mount a narrowly scoped public signup adapter before the general public-write block. It posts `{email, token}` to `https://rwa.y.at/miner/exchanges/user`, matching [Tari's published hook](https://github.com/tari-project/tari-dot-com/blob/3a33d0b7c939435a5d4b3b97664c12e5d4c78652/src/services/api/useSubscribeNewsletter.ts). The API owner verifies the Turnstile token with the matching secret. No email/token logging or local subscription storage is added.
4. Add explicit-render Turnstile lifecycle, expiration/error handling and fresh verification after failed submissions. Permit only Cloudflare's widget origin in the script/frame CSP directives, following [Cloudflare's CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).
5. Remove unsupported topic selection and confirmation-email claims. The provider's boolean success is the only signup success signal; this does not establish downstream delivery.
6. Replace the launch page's old journal CTA with the current October project gallery. Following the owner's clarification, rename the top-right header button from Projects to Build and link it directly to the official Ootle docs at `https://ootle.tari.com/`.
7. While no approved key is configured, collect no addresses and offer the forum as an immediate path to launch news. The countdown CTA says Launch updates rather than promising a working waitlist.

## Configuration and remaining acceptance

Existing project: `ootle-lobby-preview` in `peekaboo4`, project ID `prj_oBeb3NaCYysUN4kHeQyPseLR9UnA`.

- Keep the existing `CHAT_PUBLIC_ORIGIN` and all chat database/secrets unchanged.
- Set production `CHAT_ADDITIONAL_ORIGINS=https://lobby.tari.com`.
- Set production `PUBLIC_SITE_URL=https://lobby.tari.com`.
- After Possum approves the hostname on the Turnstile widget used by Tari's newsletter API, set production `TARI_TURNSTILE_SITE_KEY` to that widget's public site key and redeploy. If a new widget is created, the API owner must configure its matching secret on the API, not in this repository.
- Verify one explicitly approved test address reaches the intended Tari subscriber list. No live email signup or delivery is claimed until this succeeds. Confirm provider-side hostname validation and abuse limits; the Lobby's in-memory burst guard alone is not distributed rate limiting.
- If the Tari API rejects the Lobby origin, approve that exact origin in the backend; do not spoof `tari.com` or disable CAPTCHA validation.

## Validation and release boundary

Before release: 57 root tests and 198 client tests passed; TypeScript/Vite build, content/integration validation and packaged server startup passed. Local browser and live production checks are recorded separately in the task handoff. A merged PR or successful build is not proof of live chat or email enrollment.

Rollback: revert the release commit and redeploy the accepted revision. Remove the newly added `CHAT_ADDITIONAL_ORIGINS` if needed; preserve all database data and browser keys. Do not remove or rotate existing chat secrets as part of this rollback.

## November 5: follow the wallet clock

Selection: reuse the existing `/api/launch` route, Express/Vercel package, and countdown ticket. The previous `content/launch.json` fixed the date locally; it is removed. The route now reads only `ootle-mainnet-launch-at` from the official public wallet config at `https://ut.tari.com/config`. The official Universe source reads that field in `src/components/wallet-l2/L2Tiles.tsx` and fetches `/config` in `src/store/actions/airdropStoreActions.ts` (source checked at `1c27cf67e3ac370c638917e4e7f9dd52ec572d82`). The deployed wallet backend may vary by build; the public production config is the accessible authority used by this site.

The server caches a successful read for 60 seconds and exposes only the normalized timestamp. The browser fetches immediately, every minute, and when returning to the tab. No date is displayed before a valid response; a transient error retains the last verified date. A successful official config response that removes or invalidates the date clears the countdown. Each browser request has an eight-second timeout so a hung connection cannot block later polls. Zero becomes “Launching soon,” matching the wallet's distinction between countdown completion and mainnet availability. The label and accessible description use the fetched date, including seconds.

Acceptance before publication: server tests cover the field projection, timezone, cache expiry, changed dates, concurrent requests, invalid config and recovery. Browser logic tests cover changed dates, errors, no initial data, cleanup, seconds precision and zero. Local public endpoint, desktop/mobile rendering and live revision/endpoint comparison are checked separately. No authentication, provider key, transaction, database or new package is required.

November 5 local acceptance: PASS — 100 root tests, 9 targeted server/journal tests, 5 countdown client tests, content/integration validation, TypeScript/Vite production build and packaged runtime/download checks. The local `/api/launch` exactly matched the official config (`2026-11-11T11:11:11Z`). Desktop and 390px mobile screenshots show the existing countdown ticket and no horizontal overflow; mobile retains its existing compact minutes-only layout. The testnet staging config (`https://rwa.yat.fyi/config`) returned 403, so equivalence to a specific testnet build is not claimed. Live publication is recorded in the task handoff after verification.

Follow-up acceptance: four server adapter tests and seven countdown client tests pass, including explicit target clearing and hung-request timeout/recovery. The first Git-source deployment failed before building (`git_info_fail`); production remained unchanged. Deployment uses the established authenticated CLI/source workflow next.


### Source correction: testnet wallet

The exact user-requested source is `https://rwa.yat.fyi/config`, selected by Universe's `src-tauri/env.esmeralda`. Browser and Node native fetch both returned HTTP 200 and `ootle-mainnet-launch-at: 2026-11-11T00:00:00Z` on November 5. The earlier Python 403 did not establish that the service was inaccessible. The production wallet config differs (11:11:11Z), so it is not an interchangeable authority. The Lobby adapter now follows the testnet endpoint exactly. No authentication headers, copied timestamp, proxy fallback or user-agent spoofing is needed. The preceding production-source deployment is superseded by this correction.
