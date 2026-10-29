# Lobby newsletter and game night — October 29, 2026

## Selection receipt

- Reuse: existing SubscribeForm, TurnstileChallenge, newsletter adapter, Lobby layout and Vercel project. Base: GitHub main 411d301ae9a90f2439efb89549cdc3db343f3588, independently matched to lobby.tari.com/build.json before editing.
- Why: the provider contract and consent/error handling exist. The approved public key supplies the missing configuration. No new service or dependency.
- Availability: authenticated owner GitHub CLI; Vercel connector lacks team access, while existing CLI access to peekaboo4/ootle-lobby-preview was verified. Production public key saved; activation requires deployment.
- Trial: existing newsletter route tests pass with controlled provider responses. Browser checks confirm disclosure opening and persistent dismissal. Lifecycle tests cover expiry, invalid schedules, voting cutoff and changed-event dismissal keys.

## Public behavior

The home page has a newsletter signup disclosure below the countdown header, using the same consent and Turnstile flow as /ootle. A dismissible event banner follows. No addresses or verification tokens are stored in the repository.

Source: [October 27 Discord announcement](https://discord.com/channels/892738558316662855/893157378789351475/1564658377647464551), independently read alongside Customer.io broadcast 535 on October 29. Sunday November 1, 6 p.m. Eastern is EST / 23:00 UTC. R.E.P.O. and Shift At Midnight remain the choices. Voting closes October 31 at 6 p.m. EDT. Direct Game Streams and public server invite links are included.

Edit creator-hub/hub/content/game-night.json for future events. expiresAt is the banner removal time (midnight after the event), not an announced event end. Changing the ID, game or schedule resets dismissal. After voting closes, the CTA links to event details. Newsletter signup remains after banner dismissal.

## Validation and release boundary

63 root tests and 205 client tests passed before the final event content update; 4 final focused event tests passed. Full site build, packaged server startup, content and gap checks passed. Local desktop and 390px mobile inspected; disclosure and persistent dismissal exercised. Live widget/provider acceptance and downstream membership remain separate post-release checks.

Rollback: revert and redeploy. Removing the public key returns signup to its unavailable state. Preserve provider secrets and all chat settings.
