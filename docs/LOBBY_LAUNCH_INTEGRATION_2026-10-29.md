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
6. Replace the launch page's old journal CTA with the current October project gallery. Its main header Projects link already targets that gallery. The exact additional button Fox meant remains unconfirmed.
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
