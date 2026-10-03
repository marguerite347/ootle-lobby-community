# Daily Spark vault ignition — build plan

Written before the presentation overhaul. Checkout `4597135b0215e787e8b34e543ee090ce17ca3a3e` on `main`, which matched `origin/main` after `git fetch origin main`.

## Result and acceptance

A correct daily answer plays one staged vault ignition (impact number, then a settled charged reactor) and banks the server base. One spin eases to the server wedge and settles as base × multiplier = banked. Replay is visual only. Wrong, timeout, already-played, and error do not celebrate or credit again.

Check: existing `dailyTrivia.test.mjs` still passes; new presentation tests cover mood, wheel landing, mute, and replay. Browser: ready, answering, correct, wrong, timeout, spin, claimed, already-played, error, at 1280×720 and 390×844, with focus-loss, mute, and reduced motion.

## Selection receipt

- **Reuse / why:** Keep the React 18 + Vite homepage hero, Express daily-trivia API, installed `canvas-confetti@1.9.3`, and the authored reactor. The gap is presentation: the current win dumps confetti, coins, and a wheel at once, and the ending does not read as a closed vault. Studio celebration recipe is the stage order (brief → motion → sound → preview), not a new engine.
- **Availability:** Catalog suggestions were not installed. `canvas-confetti@1.9.3`, `motion@13.4.1`, React `^18.3.1`, and Vite `^5.4.8` are already in `creator-hub/hub/client/package.json`. Web Audio is built into the browser. Envato is not signed in here. No new package.
- **Trial before scale:** One reward reveal and its settled state, then the other phases. Do not generate a full asset set first.
- **Not claimed:** Listening quality, human fun, Envato delivery, merge, or deploy.

## Toolkit verification

Offline `buildToolkit` from `creator-hub/hub/server/buildToolkit.mjs` against `creator-hub/hub/data/seed/catalog.json`. Coverage string from the function: metadata matches only, not an install or compatibility guarantee.

Idea that describes the real stack, without naming other engines:

`browser react daily trivia reward reveal celebration wheel spin settled state css svg web audio particles juice hud`

Returned skills actually used as a shortlist: game-feel, audio-design, game-ui-ux. `tari-resources-state` matched the word “state” and was not selected; this feature does not change Ootle application state.

Returned resources rejected:

| Candidate | Why rejected |
| --- | --- |
| Hellblade audio article, Amplitude Audio SDK, “basics of recording audio” | Keyword “audio”. Not a browser bus, not installed. |
| React Bits Splash Cursor | Keyword “react”. A cursor effect, not a reward reveal. |
| tsParticles | Catalog tool, not installed. Installed canvas-confetti plus a fixed CSS coin budget is enough. Adding a particle runtime would be a new dependency for the same job. |
| Generic “React” catalog card | The Hub client is already React. |

A second idea that included the words “No Godot” still ranked Godot audio, Godot animation, Godot export, Godot demo projects, A Dark Forest, and Deckbuilder Framework. Those are wrong-engine matches. The negating word is not ignored by `toolkitTerms`. Rejected. This remains a React/CSS/SVG/Web Audio feature. Phaser, Unity, Unreal, Pixi, three.js, and PlayCanvas were not selected.

## Skills and docs actually read

Gamedev pin in `skills/README.md`: `b105e1cf617adf0b68ed98790a716bbb60993179`.

| Path | Applied |
| --- | --- |
| `AGENTS.md`, `creator-hub/hub/AGENT_START.md` | Onboarding, access checklist, offline toolkit |
| `.agents/skills/resource-first-workflow/SKILL.md` and `references/selection-record.md` | This receipt |
| `.agents/skills/readable-code/SKILL.md` | Named presentation helpers, small functions |
| `.agents/skills/tari-game-development/SKILL.md` | Stay on the existing web client; no engine swap |
| `creator-hub/skills/SKILL.md` | No Tari/Ootle transaction in this loop |
| `skills/vendor/gamedev/router/SKILL.md` | Engine fingerprint is none of the listed engines. Use engine-neutral disciplines only |
| `skills/vendor/gamedev/skills/disciplines/game-feel/SKILL.md` | Importance tiers, eased settle, short panel shake, number pop. Juice returns to rest and does not stall the server timer |
| `skills/vendor/gamedev/skills/disciplines/game-ui-ux/SKILL.md` | Anchored hero, safe area, focus-visible, event-driven phase views, 1280×720 and 390×844 |
| `skills/vendor/gamedev/skills/disciplines/audio-design/SKILL.md` | Master / UI / SFX buses, headroom, pitch variation on repeated ticks, immediate mute |
| `skills/vendor/gamedev/skills/disciplines/create-game-assets/SKILL.md` | Asset request and provenance. No generation tool is available here |
| `skills/vendor/gamedev/skills/disciplines/performance-optimization/SKILL.md` | Fixed coin budget, one confetti burst, pause decoration when hidden |
| `skills/vendor/game-design/game-design-peak-end-audit/SKILL.md` | Peak is the ignition number. Ending is the settled ledger, not a wheel left spinning |
| `skills/vendor/game-design/game-design-perceived-randomness-audit/SKILL.md` | Odds stay visible. 1× keeps the base. Server chooses the wedge |
| `skills/vendor/gamedev/skills/genres/puzzle/SKILL.md` | Rejected. This is one multiple-choice question, not a board puzzle |
| `creator-hub/hub/shared/studio.mjs` celebration recipe | Stage order only. Design nodes are not a runtime |
| `creator-hub/hub/INTERACTION_DESIGN.md` | Lime for confirmed success, celebrations only after the server saves |
| `creator-hub/hub/GAME_UI_KIT.md`, `GameKit.tsx` | `SuccessNotice` is a 900ms check, no payout. Not the vault reveal. `motion/react` stays on GameReveal |
| `creator-hub/video-templates/src/brand.mjs` | Public palette: ink `#040723`, purple `#813BF5`, green `#C9EB00`, cloud `#ECEEFF` |
| `creator-hub/DAILY_SPARK.md`, `dailyTrivia.mjs` | Credit rules unchanged |
| `creator-hub/ECONOMY_DESIGN.md` | Sparks stay a preview point with no sink. Do not retune odds |
| `creator-hub/resources/audio.md` | No Kenney, Freesound, ElevenLabs, or Suno download |

## Access checklist

| Capability | Status | Evidence | Next action |
| --- | --- | --- | --- |
| Hub Node 20+ | Ready | Node v22.14.0. `node_modules` not present at plan time; install from the lockfile before tests | `npm ci` in `creator-hub/hub` |
| Hugging Face | Not needed | No model inference | None |
| Envato | Missing in this environment | License FAQ fetched. elements.envato.com itself returned a bot wall. No signed-in browser | Codex request below |
| Voice / music providers | Not needed | Procedural cues only until a licensed sting arrives | Do not spend credits |
| Preview | This VM | Do not use `http://127.0.0.1:4198` | Run Hub here |

## Design

**Feeling:** a small daily vault. Anticipation while the crystal idles, a sharp ignition when the server confirms a win, then a quiet closed ledger. Loss dims the crystal and teaches the answer. The spectacle never chooses the reward.

**Palette roles:** ink surfaces, lavender controls, lime only after a confirmed credit, warm gold on the wheel. Public brand tokens above, plus the existing Hub lime `#dcfa53` / `#d5f544` already used on this hero.

**Importance tiers:**

| Event | Channels |
| --- | --- |
| Select, tick | UI bus, no shake, no confetti |
| Miss, timeout | Soft SFX, dimmed reactor, no coins |
| Correct base, spin landing | SFX, one confetti burst, 12 coins, brief panel offset, number pop, then rest |

**Peak and end:** players should remember the number appearing in the crystal, then leave on three settled figures (base, multiplier, banked) and tomorrow’s reset. A 1× spin is “base kept”, not a miss.

**Randomness:** six equal wedges stay labeled. The pointer does not move. Rotation is visual. `spinIndex` remains server-owned.

**Layout:** the section is a two-column grid from 900px and a single column below that. Critical controls sit inside the card with safe-area padding. The reveal overlay is `pointer-events: none` inside the card so the site header and skip link stay usable. Focus moves to the question after start, then to the next real control after the overlay closes.

**Motion off:** `prefers-reduced-motion` or `data-hub-effects=off` skips shake, coins, confetti, and spin travel. The numbers still appear. Hidden tabs cut the master bus and pause decorative CSS. The countdown keeps running because the deadline is server-owned.

## Envato asset request for Codex

This builder cannot sign into Envato and must not ask for passwords, cookies, or tokens. Do not replace this request with a claim that generic particles finished the premium direction. The playable build uses an authored SVG stand-in (`data-art="authored-stand-in"`) until these items are incorporated.

License check, 2026-09-23, from Envato help (the live elements.envato.com license page was blocked by a bot wall):

- [Elements license](https://help.elements.envato.com/hc/en-us/articles/360000628966-Envato-Elements-License)
- [Correct usage](https://help.elements.envato.com/hc/en-us/articles/360000621783-Correct-Usage-of-Envato-Elements-Items)
- [Prohibited usage](https://help.elements.envato.com/hc/en-us/articles/360000621803-Prohibited-Usage-of-Envato-Items)

Website use inside one end product is allowed while the subscription is active, and the license can become perpetual for that completed product. Raw items must not be committed to this public repository, redistributed as stock, or left extractable as standalone source. Register one project license for Tari Creator Hub. Confirm audio-item clauses on the specific download before use. Keep item URL, item id, and download date in provenance. No account secrets.

Search inside Elements. Reject anything that is a UI screenshot, a meme, a photoreal human, or a different palette (no neon cyberpunk city, no gold casino chips).

| Role | Style | Format | Size / duration | Alpha / loop | Placement | If unavailable |
| --- | --- | --- | --- | --- | --- | --- |
| Crystal vault hero | Faceted standing crystal, three-quarter, ink and lavender with a lime core. No text, no letters, no watermark | SVG preferred, or PNG | 1024×1280 master, readable at 112×150 | Transparent background. Still, not a video | Replaces the `<svg class="reactor-crystal">` in `SparkReactor.tsx` | Keep the authored SVG |
| Charged variant | Same crystal, brighter lime core, same silhouette and camera | SVG or PNG | Same frame as the hero | Transparent | `mood="settled"` and `mood="ignited"` | CSS filter on the hero |
| Spark coin | Simple beveled disc, gold rim, lime spark mark, no currency symbol that implies cash | PNG sprite or SVG | 128×128, or a horizontal strip of 8 frames | Transparent. Loop 8 frames if animated | The 12-coin shower in `.spark-coin-rain` | Keep the CSS disc |
| Win sting | Bright crystal chime, no vocals, no melody that needs a sync license | WAV 44.1kHz stereo, peak under −1 dBFS | 1.2–2.0 s, one shot | Not a loop | SFX bus, cue `win` | Keep procedural chord |
| Spin ratchet | Soft mechanical clicks slowing down | WAV | 3.4 s, or a 0.4 s click intended to be retriggered | Clicks may loop; the file itself is one shot | SFX bus, cue `spin` | Keep procedural ratchet |
| Soft miss | Low muted tap, no buzzer, no voice | WAV | 0.25–0.4 s | One shot | SFX bus, cue `miss` | Keep procedural tone |

Delivery: optimized files plus a provenance note (item page URL, id, license, download date). Do not include the raw Envato zip in git. A coordinator can place incorporated files in approved private storage if the public repo would make them extractable.

## Chosen packages and assets

- `canvas-confetti@1.9.3` — one burst on a confirmed large tier only.
- Authored SVG crystal in `SparkReactor.tsx` — stand-in, not an Envato asset.
- Procedural Web Audio in `sparkAudio.ts` — original cues, opt-in, one master bus.
- No new npm dependency. `motion` stays unused by this feature.

## Gacha guidance applied on 2026-09-23

Merged `origin/main` at `48817e7`, which contains `d362e23604f847cf5bc8d07987d61307bc96e387` (“Add gacha reward experience skill”). Read `.agents/skills/gacha-reward-experience/SKILL.md` and `references/mobile-gacha-research.md`. The source is an AI-mode synthesis, not a study. This remains a free daily reward. No paid currency, offer, banner, duplicate converter, or pity counter was added. The vault art direction stays the one already chosen.

| Idea | Decision |
| --- | --- |
| Understandable odds | Applied. The wheel prints the server array `[1, 2, 1, 3, 2, 5]`, and the rules state that 1× and 2× appear twice and 3× and 5× appear once. No research example rates were copied. |
| Progress continuity | Applied. The server already keeps the balance across UTC days. The ready vault now says how many Sparks carry over when the balance is above zero. |
| Useful rewards | Rejected as a new sink. Sparks are preview points with no redemption. Inventing a use would be a product change. The copy stays honest about that. |
| Distinct currencies | Applied by naming. Rewards are Sparks, and the rules say they are not TARI. No second currency. |
| Server-authoritative settlement | Already applied. The reveal runs after the save. Replay and a repeated spin do not pay again. |
| Reachable mobile actions | Applied. Below 760px the game panel is visually first, and the sound control is at least 44px. |
| One primary action per state | Applied. Ready ignites, the question is the four answers, a win spins, a timeout reveals, an error reloads, and the closed vault has one onward link. Replay stays a text control. |
| Clear names | Applied. Wedges show `1×` text, not color alone. The 1× result says the base was kept. |
| Safe areas and gameplay-first onboarding | Applied in layout. Safe-area padding was already on the section. Rules stay inside a disclosure so play is not blocked by a tutorial. |
| Pity thresholds, legal or retention claims, paid offers | Rejected. The skill marks those claims unverified, and this loop does not sell pulls. |

## Rules that stay

From `creator-hub/hub/server/dailyTrivia.mjs` and `DAILY_SPARK.md`: one attempt per UTC day, 100 or 150 base, six wedges `[1,2,1,3,2,5]`, spin adds only `base × (multiplier − 1)`, repeated answer/spin do not pay again, celebrations run after the save. This plan does not change those rules.

## Smallest playable trial

From `creator-hub/hub`:

```sh
node --test server/test/dailyTrivia.test.mjs
npm --workspace client exec vitest run src/components/sparkPresentation.test.ts src/components/sparkAudio.test.ts
```

Outcome, 2026-09-23, after the reveal checkpoint: 8 server tests and 7 presentation/audio tests passed. A headless Chrome pass on this VM’s Hub at `http://127.0.0.1:4298/` (not the Mac preview) played ready, question, correct ignition, settled spin, claimed ledger, visual replay, reload, wrong, timeout, error, 390×844, and reduced motion. One layout fix followed the first screenshots: the game card’s `overflow: hidden` was collapsing the grid row and clipping the loss explanation. The spin control was then inside the 1280×720 viewport after scroll.

## Budget

No paid generation, no new subscription, no Envato download from this agent. Install cost is the existing lockfile only. Super Spin cost is unknown; this pass did not buy assets or generation.

## Preferred Super Spin (2026-09-23)

Reuse: the existing `dailyTrivia.mjs` settlement, vault wheel, and `sparkPresentation.ts` timing. No new package. The gacha skill stays in free-daily-reward mode. Option B, pity, and paid spins are rejected.

Stage-1 slots stay `[1, 2, 1, 3, 2, 5]`, each 1/6. Only a 5× result opens Super Spin. Decline keeps `base × 5`. Our conditional table is S=1 at 60% (effective 5×), S=2 at 25% (10×), S=5 at 12% (25×), S=10 at 3% (50×). Final credit is `base × 5 × S`. Overall chance of 50× is 0.50%. YouTube `TsiGe9qY4Q8` is carousel feel only. The Blast article's unpublished odds are not copied. The spec is `creator-hub/DAILY_SPARK_SUPER_SPIN.md`.

The Super wheel uses unequal arcs plus a percent list. It rests in the 60% wedge so the pointer is not parked on the 3% sliver. Skip and reduced motion show the server total without a second roll.

## Brand fold (BRAND.md @ 36346a1, Lobby rename @ 7915724)

Product name in shared chrome is **Ootle Lobby**, taken from main. Daily Spark does not rename routes or storage keys, and new lines do not call the platform Creator Jam. Creator Jam remains the name for challenges inside the Lobby.

Applied lines, each on its real state: intro “Common question. Legendary drop.” plus one Sparks-are-not-TARI line; Ready only, once, “Lock in your answer. Let the wheel cook.”; 1× “Base kept.”; 2×/3× “Loot secured.”; Super after 5× “Wait… bonus round?”; Super S=1 “5× held.”; Super 10×/25× “RNG went crazy.”; 50× “NO SHOT.” Decline stays functional. Rejected “Big brain. Bigger loot.” and the other retired lines in BRAND.md. Odds stay in How it works.

Reveal tiers from the assets packet: quiet (no confetti, no coin-rain, no impact shake), mid (28 particles, no coins), top 50× only (64 particles, coin-rain, impact). The crystal stays an authored SVG stand-in with foil facets. Cost unknown.

Daily Drop, Loot as a currency name, and Your stash are not approved. This pass does not rename Daily Spark, Sparks, or the balance, and it does not migrate economy keys.

## WON vault disc (critique of the flat pie)

Applied from the v3 frames: after a correct answer the brochure collapses to the rules disclosure and the game is the hero. The bank chip reads `{base} Sparks banked · base locked`. The disc is about 320px with a metal rim, six equal arcs for `[1, 2, 1, 3, 2, 5]`, dark seams every 60°, and one soft sheen per wedge on the outer third. The hub reuses the authored crystal silhouette and is marked `data-art="authored-stand-in"`. The pointer is a painted triangle. Ready 5× is a slight foil lift, not a full lime flood, with the callout `5× gateway` / `Opens optional Super · same as today`. The preview strip uses the server base: IF 1×, IF 2×/3×, IF 5× → Super. The primary control is `Spin once`.

Motion is press, a short wind, then the existing ease-out travel. The server still owns the outcome. There is no near-miss slowdown. A 1× or 2×/3× land still uses the quiet or mid settle. A 5× land freezes on the lit wedge, shows `5×` and the banked path such as `150 → 750`, then `Continue to Super` plus `Keep {total} · skip Super`. Continue opens the existing Super offer (`Wait… bonus round?`). Skip and reduced motion keep the same server total and still stop on that choice.

Rejected: reshaping stage-1 odds, a second lime gateway, micro-facets that read as extra wedges, and renaming Sparks. Ready keeps one play line, “Lock in your answer. Let the wheel cook.”, plus the plain line “Four choices. The clock starts when you do.” It is not stacked as two slogans, and it is not in the intro. The intro keeps “Common question. Legendary drop.” and one Sparks-are-not-TARI line. Odds stay in How it works. The ready button is “Play today’s question”. “Ignite today’s challenge” is not used. “VAULT UP TO 750” is not a second hero. The 750 and 7,500 caps stay in the plain prize note. The pre-spin heading says banked, not safe. “Wait… bonus round?” stays on the Super offer only. The 5× callout sits beside the disc so the wedge label stays readable, and the six wedges use separate colors with the 5× sector dark until it lands.
