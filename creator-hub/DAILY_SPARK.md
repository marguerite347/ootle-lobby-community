# Daily Spark: daily trivia hero

## Build plan and resource receipt

This is an in-Hub React/Express game, not a new game-engine project. Reuses HubMotion's
Effects preference, installed canvas-confetti, native browser audio, and existing
runtime-directory persistence patterns. No paid generation or external asset package.

Read: `.agents/skills/readable-code/SKILL.md`, `.agents/skills/tari-game-development/SKILL.md`,
`skills/vendor/gamedev/router/SKILL.md`, its `disciplines/game-feel` and `disciplines/game-ui-ux`
SKILL.md files, and `creator-hub/ECONOMY_DESIGN.md`. Requested the existing build-toolkit
with “timed trivia game rewards game feel”; chose engine-neutral feedback/UI guidance
rather than introducing an engine for four answer buttons and a visual wheel.

Small acceptance trial: start → answer → reward → spin → refresh. Verify expired/wrong
answers, repeated claims, malformed choices and UTC rollover before expanding content.

## Rules and state

- One question and one answer attempt per UTC day, per opaque HttpOnly browser cookie.
- 20 seconds from server-issued start. Correct within 8 seconds: 150 Sparks; later: 100.
  Under 500ms is rejected and consumes the attempt. Deadline is server-authoritative.
- Correct answers unlock one optional free spin. The base is credited immediately.
- Six equal slots: 1×, 2×, 1×, 3×, 2×, 5×. Spin adds only base × (multiplier − 1).
  A 1× wedge keeps the base. Stage-1 maximum is 750 at a 150 base and 500 at a 100 base.
  A 5× result banks that total and may offer one optional Super Spin. See
  [Preferred Super Spin](DAILY_SPARK_SUPER_SPIN.md). Expected stage-1 total per successful
  spin is 7/3 times base; this is prototype issuance with no sinks, not a balanced economy claim.
- UTC midnight resets the opportunity, not the balance. Unused spins expire then.
- Random answer IDs and shuffled order; answer keys never appear in a live round.
  Already resolved answer/spin requests return their existing result without paying again.
- Fourteen author-reviewed creator questions rotate. Expand this repository-owned bank
  before a long-running public season; avoid claiming every day has never-before-seen content.
- Sparks are non-purchasable, non-transferable, non-redeemable preview points. No cash
  value, TARI settlement, rewards promise, wager or paid spin. No blockchain dependencies.

## Access, persistence and limitations

`GET /api/daily-trivia` establishes a browser identity; POST `/start`, `/answer`, `/spin`,
`/super`, and `/decline` require the HttpOnly cookie and `X-Hub-Trivia: 1`. Writes reject mismatched Origin.
POST data cannot choose reward amounts, elapsed time or multiplier. Each IP is bounded
at 90 requests/minute; limiter keys and registered preview players have hard caps.

This is **not bot-proof**. A bot can wait, solve questions or reset browser identity.
The public repository's question bank is not a secret. Cookies do not identify a person.
Rate limits are process-local, and a trusted reverse-proxy policy must precede any
production proxy configuration. No device fingerprinting or behavioral telemetry.

Disposable prototype state lives in `CREATOR_HUB_DATA_DIR/daily-trivia.json`, never Git.
Synchronous atomic replacement supports a single Node process and survives restarts;
this is not a transactional multi-instance/cloud ledger. Do not deploy multiple writers
or treat a developer Mac as the authoritative account store. Existing cloud migration
is deferred: see `DECENTRALIZED_HUB_IMPLEMENTATION_PLAN.md` and issue #156.
No durable cross-device account identity is connected. UI explicitly calls out preview identity.

Before public reward rollout: authenticated accounts, a transactional cloud ledger with
unique (account, UTC day, action) constraints, distributed rate limiting, verified human
challenge at suspicious claims, secret rotation/recovery, account deletion and retention,
question/content scheduling and economy caps. Human-verification provider access remains
unconfigured. Assess false positives and accessible alternatives; no CAPTCHA guarantees
one-human-one-account. Keep this work separate from rapid prototype acceptance.

## Presentation and verification

Homepage hero; header balance links back to it. Timer begins only on explicit play.
Keyboard buttons, visible answer text and an untimed explanation follow the timed round.
Failure gives the correct answer and Learn link. Retrying a transport failure checks
server state, rather than fabricating a win. Server saves precede success celebrations.

Reduced motion and Effects off suppress decorative motion; optional audio starts off.
Coins, confetti and reward overlay are transient and do not intercept input. Wheel
rotation is visual only; its final wedge is selected by the server. Refresh recovers it.

Run `node --test creator-hub/hub/server/test/dailyTrivia.test.mjs`, then the Hub client
build/tests. Browser acceptance: ready, live timer, win, banked balance, bonus spin,
refresh recovery, loss, Effects off, keyboard and narrow layout.

## Recorded prototype validation (2026-09-23)

Full suite: 186 server tests, 11 game tests and 57 client tests passed. Browser trial on
a separate localhost identity: correct answer awarded 150, spin landed 2×, 300 balance
and final wedge survived reload. Main 127.0.0.1 identity was left ready to play.
390px viewport geometry: game and controls fit without horizontal page overflow.
Browser error log was empty. Synthesized optional fanfare was not subjectively auditioned.

## Vault Charge hero (2026-09-24)

Idle and settled Daily Spark crystals use the authored Lobby Vault Charge plate
(`data-art="authored-lobby-vault-charge"`). The stamped PNG is
`client/public/daily-spark/vault-charge/vault-charge-hero.png`
(SHA256 `f038205b9a4522665cd3c4f66a37e6aed0478ce826e51d622a27d62bd293b076`).
The Y6HUAQT derivative remains in the repo and is not mounted. Ready copy stays
“Lock in. Get your loot.” / “Beat the question. Spin for the multiplier.”
A settled 1× keep still says “Base kept.” and “A 1× wedge keeps the base.”,
with caption “The vault cools. Banked Sparks stay loud.”, outline Continue,
and “Sparks are not TARI.” CD and AD still stamps are DIRECTION-OK, not
production ACCEPT. Motion was not captured in this wiring. Odds and amounts
are unchanged.

## Lobby Vault v4 art pass (2026-09-24)

Face, rim, pointer, gateway badge and Vault Charge hero were redrawn for a more
polished game feel. They come from `hub/scripts/daily-spark-art/`. File names,
URLs, the wedge order `1×, 2×, 1×, 3×, 2×, 5×` and the 330° 5× plaque are
unchanged. Odds and amounts are unchanged. Tiers are distinguished by pip
count, label size and the 5× sunburst shape as well as colour. The pointer
plate now points into the disc. The hashes below are the v4 bytes. See
`client/public/daily-spark/vault-disc/PROVENANCE.md`. This is a direction
proposal: CD/AD have not stamped it, and motion was not re-reviewed.

The art brief, feedback tiers, peak-end audit and asset manifest are in
[`daily-spark/ART_DIRECTION.md`](daily-spark/ART_DIRECTION.md) and
[`daily-spark/asset-manifest.json`](daily-spark/asset-manifest.json). The
follow-up game-feel pass adds a quiet correct-answer beat, a 520ms wheel landing
hold (tick for 1×, pop for 2×/3×), a truthful bonus line, a live "Spinning…"
control and a banked count-up that always ends on the server total.

## Lobby Vault Disc (2026-09-24)

The spin-ready disc and the Super wheel share `data-art="authored-lobby-vault-disc"`.
Stage wedges stay `1×, 2×, 1×, 3×, 2×, 5×`. Super keeps its unequal arcs and does
not use the six-wedge face. The hub is the Vault Charge hero at 34% of the disc.
Plate URLs are `/daily-spark/vault-disc/` (`vault-disc-face`, `vault-disc-rim`,
`vault-pointer-lime`, `vault-gateway-badge`). Expected face@2x SHA256 is
`73f9b6bc0a242f49a80d907e0a83f4b8fb9a4d900c3cb03bded0b96c01928236`. Expected
soft-fuse rim@2x SHA256 is
`9321083acb9ccd4aaedc58b088e38197e3d95cc7c1c0d73d9fa8fe4d04d3182c`. Those
stamped face, rim, pointer, and gateway bytes were not in the cloud checkout
at wire time, so the disc uses the purple-glass CSS until the pack is copied
onto those URLs. The stage rim image sits inside the rotating spin and prefers
the @2x PNG, then the SVG. Super keeps the foil CSS rim and does not mount that
stage image, because the PNG bakes “5× · Super path”. AD soft-fuse
DIRECTION-OK is for the rim asset, not a rendered Hub ACCEPT. There is no
`.vault-gate` tooltip. Settlement amounts are unchanged.

## Vault ignition pass (2026-09-23)

The homepage hero now stages one confirmed win as an impact number, then a settled
charged crystal and ledger. The spin eases to the server wedge and ends on
base × multiplier = banked. A 1× result is labeled as the base kept. Replay stays
visual. Loss and timeout dim the crystal and do not throw coins. Sound is still
opt-in, on a master bus that mute and a hidden tab cut immediately. Reduced motion
and Effects off skip travel, shake, coins, and confetti. Credit rules above are
unchanged. Plan, asset request, and provenance: `creator-hub/daily-spark/`.

## Reactor presentation pass (2026-09-23)

Applied the game-feel, game-ui-ux and audio-design disciplines from the existing
gamedev skill library, plus the Lumina VFX Architect principles of motivated light
sources and bounded particles. Reviewed `creator-hub/resources/audio.md`; reused
Web Audio and installed canvas-confetti rather than adding another runtime library.
This is an engine-neutral application of those skills to the existing React game.

The loop now stages anticipation (floating faceted reactor and embers), decision
(readable timer and speed-bonus state), feedback (answer cue and short impact),
reward (ignition, coin shower, mechanical spin), and return (banked reward and reset).
The completed state is a charged reactor with base × multiplier = banked totals,
not a permanently displayed wheel. The replay button is explicitly visual only and
never submits a reward mutation. An expandable recipe links creators to game-feel,
audio skills and the interaction kit.

All artwork lives in `SparkReactor.tsx` and `DailyTrivia.css`; all original procedural
cues live in `sparkAudio.ts`. No paid generation, remote asset dependency or private
source file is needed. Sound is opt-in with one master bus and cleaned-up oscillators.
Effects off and reduced motion disable decorative animation.

Validation: production client build, 60 client tests and seven daily-trivia server
tests passed. Isolated browser trial completed start → correct answer (100) → spin
(3×) → saved balance (300), plus visual replay without another credit. Desktop and
390px mobile checked; mobile celebration placement adjusted for the sticky header.
The main preview user's existing balance was preserved. Browser console had no errors.
Audio controls executed successfully, but the generated cues were not auditioned
by ear; subjective sound quality still needs listening review.

## Preferred Super Spin (2026-09-23)

Stage-1 odds stay six equal wedges. Landing 5× banks `base × 5` and offers one optional Super Spin with this project's own chances: 60% keep 5×, 25% land 10×, 12% land 25×, 3% land 50×. Decline keeps the 5×. The server saves the outcome before the animation. Spec and Blast source distinction: `DAILY_SPARK_SUPER_SPIN.md`.
