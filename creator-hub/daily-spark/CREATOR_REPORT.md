# Daily Spark vault — creator report

2026-09-23. Design and implementation are in this branch. It is not merged and not deployed.

## What helped

- Reading the live `DailyTrivia.tsx`, `dailyTrivia.mjs`, and `DAILY_SPARK.md` before drawing. The credit rules were already the right simulation. The gap was the peak and the ending.
- The offline `buildToolkit` call made the wrong-engine matches obvious. An idea that said “No Godot” still returned Godot projects. Naming the real stack (React, CSS, SVG, Web Audio) returned game-feel, audio-design, and game-ui-ux.
- Studio’s celebration recipe was useful as an order: motion, then sound, then one preview. It is not a runtime.
- Installed `canvas-confetti@1.9.3` was enough for one burst. A new particle library would not have changed the ledger.
- Keeping presentation math in `sparkPresentation.ts` let the wedge, the mute bus, and the “1× keeps the base” label be tested without a browser.
- The first rendered screenshots caught a real clip: `overflow: hidden` on the game card let the CSS grid row ignore the taller column. Loss text was cut off. That was not visible from the source.

## What failed or stayed weak

- Envato was not usable here. elements.envato.com returned a bot wall. No signed-in browser, and raw Elements files must not be committed to this public repo. The crystal is an authored SVG stand-in. The premium direction is requested in `BUILD_PLAN.md`, not delivered.
- Procedural cues were not listened to. Unit tests show mute sets the master gain to 0 and closes the context. That is not a judgment of how the chime sounds.
- No person played it. Headless Chrome completed the paths below. That is not a fun rating.
- Homepage console logs included 404s for unrelated missing media and the intentional 500 used to show the trivia error alert. They were not trivia credit failures.
- The toolkit still treats a negated engine name as a request for that engine.

## Gacha research

Read `.agents/skills/gacha-reward-experience/SKILL.md` and `references/mobile-gacha-research.md` after merging main. The mode is a free daily reward. The vault look was not replaced.

Applied: published wedge odds, carried Spark balance on the ready vault, Sparks named apart from TARI, server settlement before the reveal, the phone panel before the essay, one primary action in each state, text on every wedge, and safe-area padding. Rejected: pity, paid offers, banners, duplicate conversion, and any claim that this loop retains players or meets a legal standard. Those source numbers are unverified, and no paid economy was added.

## Ootle Lobby brand fold

Main `7915724` renamed shared chrome to Ootle Lobby. This feature kept that shell and did not invent a second product name. Daily Spark lines follow `creator-hub/BRAND.md` at `36346a1` and the story state map: legendary drop on the ready hero, bonus-round only on a real 5× offer, RNG only on a real 10× or 25×, NO SHOT only on 50×, and quiet “Base kept.” / “5× held.” with no confetti or coin-rain. “Big brain. Bigger loot.” is not used.

The authored crystal gained foil facets and still carries `data-art="authored-stand-in"`. No Envato file was added. Audio was not listened to. No person playtested. The user’s port 4210 preview is a separate checkout and may still be the earlier vault commit. Cost unknown.

Daily Drop, Loot as the soft currency, and Your stash were recommendations only and were not applied. The game remains Daily Spark. The header and ledger still say Sparks. The balance still uses the existing preview balance. “Loot secured.” is only the line for an earned 2× or 3× settle. Storage stays `daily-trivia.json` and the `hub_trivia` cookie.

The producer unlocked Economy Option A on this same branch. Stage-1 stays `[1, 2, 1, 3, 2, 5]`. A 5× result banks that total and offers one free Super Spin. Decline keeps the 5×. Our chances are 60% / 25% / 12% / 3% for effective 5× / 10× / 25× / 50×. The YouTube clip is a carousel-feel reference only. Blast’s exact odds were not published and were not copied. Spec: `creator-hub/DAILY_SPARK_SUPER_SPIN.md`.

The producer unlocked the WON vault disc on this same branch after rejecting the flat pie. The answered screen drops the brochure, shows the bank chip, and spins a six-wedge material disc. A 5× land holds on the gateway (`5× hit. Super unlocked.`, `Continue to Super`) before the existing Super offer. Stage-1 math is unchanged. “Lock in your answer. Let the wheel cook.” is the one Ready play line, with “Four choices. The clock starts when you do.” under it. The intro is “Common question. Legendary drop.” plus one Sparks-are-not-TARI line, and it collapses after a correct answer. Odds stay in How it works. The button says “Play today’s question”. “VAULT UP TO 750” is not a second hero; 750 and 7,500 stay in the plain prize note. The 5× callout sits beside the disc.

Headless Chrome on this VM, against a scripted 5× stage spin, checked the answered hero at 1280 and 390: six labels `1× 2× 1× 3× 2× 5×`, the bank chip, the gateway callout, the payout strip, a dimmed `Spin once` during travel, the land hold with `150 → 750` before any “Wait… bonus round?”, then the existing Super offer with 60%. Phone overflow on the ready hero was 0.

Brand-voice frames from a disposable preview on this VM (port 4312, not the operator’s port 4210). The Ready panel no longer has a “VAULT UP TO 750” shout; 750 and 7,500 are in the plain prize note. Create was not rewritten.

- `/opt/cursor/artifacts/screenshots/home-spark-launch-1280.png` — Home, Daily Spark and Launch together
- `/opt/cursor/artifacts/screenshots/home-spark-launch-390.png` — same at 390
- `/opt/cursor/artifacts/screenshots/create-paths-studio-1280.png` — `/create` path cards and Studio entry
- `/opt/cursor/artifacts/screenshots/create-paths-studio-390.png` — same at 390

Audio was not listened to. No person playtested. Cost unknown. Not merged. Not deployed.

## Answered layout, ledger, and focus

The Riff disclosure was a grid item with the default order, so on desktop it painted before the game. It is now last. The answered game no longer keeps a 440px minimum height, and the section gap is 12px.

A Super settle has four ledger values. Desktop uses one row: base, stage, effective, banked. A narrow screen uses two pairs so the banked total stays with its label.

After “Continue to Super”, focus moves to “Take the Super Spin” before paint. Headless Chrome on disposable port 4313 confirmed that target, the answered order (game, then rules, then Riff), and a single-row four-value ledger.

- `/opt/cursor/artifacts/screenshots/answered-order-1280.png`
- `/opt/cursor/artifacts/screenshots/ledger-four-1280.png`

## Settled safe zone

Applied `creator-hub/agents/CREATIVE_OPERATING_RULES.md` at main `d24b3d1` and the gacha reward skill’s settled-balance rule: spectacle ends on a readable banked total. The crystal SVG is unchanged and still `data-art="authored-stand-in"`. This pass only bounds the decoration. Layout is separate from the art fill. Orbits, the floor, and embers are not drawn on the settled reactor. A quiet settle also hides the halo, so the frame is a closed ledger plus a charged crystal. The banked figure is the largest number in the ledger. Title, caption, ledger, and the next action sit outside the decoration box.

Headless Chrome on a disposable port (not 4210), scripted 5× then Super S=1, measured the quiet settle at 1280. Orbits, halo, floor, and embers were `display: none`. The title ended 10px above the decoration box. The crystal ended 20px above the caption and the caption ended 10px above the ledger. The primary action sat below the ledger. Overlap list was empty. The same quiet frame at 390 kept that stack. Reduced-motion stills are labeled on the image.

- `/opt/cursor/artifacts/screenshots/before-quiet-rm-1280.png` — BEFORE · REDUCED MOTION, glow crossed the ledger
- `/opt/cursor/artifacts/screenshots/before-quiet-rm-390.png` — BEFORE · REDUCED MOTION at 390
- `/opt/cursor/artifacts/screenshots/after-quiet-rm-1280.png` — AFTER · REDUCED MOTION
- `/opt/cursor/artifacts/screenshots/after-quiet-rm-390.png` — AFTER · REDUCED MOTION at 390
- `/opt/cursor/artifacts/screenshots/after-reveal-1280.png` — Super wheel reveal
- `/opt/cursor/artifacts/screenshots/after-payoff-1280.png` — quiet payoff card, “5× held.”
- `/opt/cursor/artifacts/screenshots/after-quiet-1280.png` — motion path, quiet settle
- `/opt/cursor/artifacts/screenshots/after-quiet-390.png` — motion path, quiet settle at 390
- `/opt/cursor/artifacts/settle-sequence.mp4` — headless sequence, reveal → payoff → quiet settle (about 2.8s, stitched frames)

The settled column centers the crystal. That also shrink-wrapped the ledger to its labels (about 194px on a 1280 desktop). The ledger now stretches to the card. Headless Chrome on a disposable port (not 4210) measured the stats row at the same width as its parent: 714px at 1280, 262px at 390. A 2× settle is three cells (base, multiplier, banked), 229px each on desktop. A Super S=1 settle is four cells (base, stage, effective, banked), 170px each on desktop and a 2×2 pair on the phone. Cells do not overlap. The banked figure stays the largest number (32px on three values, 28px on four). Orbits and the halo still do not cross the title, caption, ledger, or next action.

- `/opt/cursor/artifacts/screenshots/ledger-3-1280.png` — three-value ledger, 1280
- `/opt/cursor/artifacts/screenshots/ledger-3-390.png` — three-value ledger, 390
- `/opt/cursor/artifacts/screenshots/ledger-4-1280.png` — four-value ledger, 1280
- `/opt/cursor/artifacts/screenshots/ledger-4-390.png` — four-value ledger, 390

Audio remains the procedural bus. NOT AUDITIONED. The Envato sting is not integrated. Visual acceptance of the stand-in is still open. Cost unknown. Not merged. Not deployed.

## What should improve

- Teach `buildToolkit` to ignore “no/without {engine}” and to stop ranking Godot when the idea is a React page.
- Give cloud agents a signed-in Envato path that never asks for a password, and a place to store incorporated files that are not raw stock in git.
- Add a short browser fixture for this hero so the next pass does not rediscover the grid overflow clip.
- Listen to the five cues on speakers before replacing them. If Codex delivers the requested sting, ratchet, and miss, audition those against the procedural bus before swapping.
- Phone layout now leads with the vault. The column is still tall once the question opens. A later pass can shorten the crystal during the question if the last answer sits too low.

## Checks

| Check | Result |
| --- | --- |
| Server `dailyTrivia.test.mjs` | 8 passed, including resolved rounds hiding options |
| Client presentation and audio tests | 7 passed |
| Client `tsc -b` and production build | Passed |
| Ready, question, correct, settled spin, claimed, replay, reload | Passed in Chrome at 1280×720 |
| Wrong, timeout, error | Passed. Timeout then revealed the server answer. Error alert did not invent a win |
| 390×844 | No horizontal overflow on ready, question, or reveal. Reward line stayed inside the card |
| Reduced motion | Reveal had no impact class. The number still appeared |
| Focus loss | Hidden document adds `is-away` and cuts the master bus |
| Mute | Button returns to off and the unit test sees gain 0 before close |
| Main navigation during the reveal | The sticky nav still received the hit test |
| Credits | Replay and reload kept the balance. Observed totals included 150 (1×), 300 (2×), and 450 (3×) on separate sessions |
| Super Spin server tests | 14 daily-trivia tests passed, including decline at 750, S=2 at 1,500, S=10 at 7,500 and 5,000, and a parallel Super post paying once |
| Super Spin browser | Offer, odds, 10×, 50×, decline, skip, reduced motion, and a 1× path passed in Chrome at port 4299 |

## Status, separately

- **Design:** written in `BUILD_PLAN.md` before the component rewrite.
- **Playable:** exercised on this environment’s Hub at port 4298.
- **Integrated:** shared Daily Trivia components and tests are in the pull request.
- **Merged:** no.
- **Deployed:** no.
