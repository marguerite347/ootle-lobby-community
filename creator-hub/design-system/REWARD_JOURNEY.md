# Reward journey invitation

## Creative brief

Turn the trivia introduction into a brief, playable-looking story: lock an answer,
bank AI Sparks, then spin to multiply the reward. Keep one expressive headline and
one plain explanation per step. Use the existing Poppins, purple, ink and electric
lime treatment. Avoid extra promises, invented rewards, or copy that implies a win
before a correct answer.

The three beats are **Answer 1 Q / Bank your W / Spin for Boost**, one label beneath each icon. Do not add numbered eyebrows or secondary explanatory lines.
The action is **Reveal Today’s Trivia** so its meaning is obvious.

## Motion contract

`hub/client/src/components/SparkJourney.tsx` and `.css` are canonical.
The sequence starts once when at least half of the list enters the viewport.
Each badge gets a short charge/impact; the final multiplier badge turns once.
Beat starts: 0, 700 and 1400ms. Each lasts 950ms. Text stays visible throughout.
Mouse entry or keyboard focus replays the finite sequence. Leaving and reentering
the viewport alone does not restart it. No continuous loop. A remount starts a fresh
invitation. Touch users get the entrance without requiring hover.

The question button has a 1500ms luminous sweep after a 250ms delay, triggered by
its own visibility and hover/focus. The treatment is a CSS gradient/mix-blend lighting
effect, not a new WebGL shader dependency. Its overlay ignores pointer events and
never covers the label. A lime base remains conspicuous after the sweep settles.
Reduced motion and Effects off disable both animation systems. Disabled buttons do
not show the sheen. Reward odds, settlement and timers are untouched.

## Selection and verification

Reused the repo gacha-reward-experience and readable-code guidance, existing brand
palette/type, browser IntersectionObserver and CSS animations. No external asset,
paid generation or library needed for this interface animation. This is a proposed
visual iteration pending user acceptance, not an approved replacement for the
licensed crystal/orbit/coin/glitter assets.

September 24 checks: production build passed; inspected desktop and 390×844 phone
composition; keyboard focus replay observed; stagger/one-iteration CSS verified;
Effects off returned animation:none for every step and CTA sweep. Browser layout
must be reloaded after a viewport override before judging the responsive screenshot.
Rebuild and run `node scripts/stage-reward-reviews.mjs` to retain existing video proofs.

## Reveal-first ready screen

Latest user correction supersedes the question-preview experiment: keep the question
and answer choices hidden until the player presses **Reveal Today’s Trivia**.
Retain the idle crystal and animated CTA. Do not restore the payout arithmetic or
“Lock in your answer. Let the wheel cook.” filler. The reveal action starts the
existing20-second timer. Rewards and odds remain in the rules disclosure.

## Unified invitation layout

The ready state uses one centered composition: headline/promise, accepted crystal,
Reveal Today’s Trivia, compact horizontal journey, then rules and test controls.
Remove the nested game card in this state only. Desktop crystal area is210px and
phone170px; text uses natural height, never clipped. Sound stays beside the crystal.
The journey is a supporting connected strip with explanatory sublines omitted here.
Headline and crystal have finite entrance animations; initial CTA sweep waits2400ms
for the journey, while deliberate hover/focus replays immediately. Existing crystal
idle motion is preserved. Reduced motion/Effects off skip decorative entrances.
Desktop and390×844 phone composition inspected; reveal produced the question and
four enabled choices. This pass is pending user design acceptance.

## Continuous playtest stage

The repeatable playtest retains the unified outer section through ready, question,
answer result and both wheels. Keep the headline and footer in place; hide the journey strip after trivia opens.
The base reward uses SparkUnlock inline, without a body portal, modal focus trap or
page scroll lock. Wheels no longer scroll themselves into view on mount. The
embedded wheel document has a transparent background. Fullscreen capture/legacy
callers retain the default standalone reveal behavior.

Approved VFX remain actual media: glitter-rain.webm during the crystal reward,
grinder-sparks-alpha.webm while spinning, coin-burst.webm behind multiplier wins and Super
settlement. Restart the finite coin fade for each settlement. Previously coins
were called only at Super settlement; the first multiplier win now triggers them.
Keep the wheel-center occlusion mask and honor reduced-motion/Effects off.

## Automatic handoffs after answering

Once trivia opens, hide the instruction strip. In the isolated embedded playtest,
a correct answer runs its crystal/count-up beat then opens the first wheel without
a Continue button (4.8s after crystal readiness; reduced motion1.8s). First action:
**SPIN IT!** After qualifying5× settlement, preserve the result/coin beat for4.4s
(reduced motion1.8s), then reveal Super automatically. Second action:
**Spin It MORE!!** The wheel still waits for that click; never auto-spin or auto-award.
Keep Test again only in the section footer. Standalone lab controls remain unchanged.

## Completed loop and palette rules

Keep the final coins visible for 4.5 seconds, then present rotating win copy,
congratulations and the final AI Sparks total for six seconds. Loss shows rotating
miss copy and the correct answer for six seconds. Return to the invitation with
“Today’s trivia complete” disabled. Do not auto-start another attempt. Test again
or refresh starts a fresh isolated playtest. Real daily settlement remains separate.

Choose one approved edge/facet/core loadout randomly per fresh loop, excluding the
previous choice where storage permits. Use it consistently across ready, reveal,
both wheels and ending. No player palette picker. `capturePalette` is an explicit
filming override. Use true-alpha grinder footage, not black-backed video blending
against a transparent iframe. Begin wheel initialization during the base reveal;
do not reintroduce a fixed startup sleep or flash Super over the first wheel.

## Shared holographic button finish

`hub/client/public/reward-buttons.css` is loaded by the Hub and native wheel iframe.
Reuse this one stylesheet for reveal, answer choices, trivia action buttons and both
embedded spin actions. It adds chromatic foil and a moving specular sweep, with a
finite entrance and hover/focus replay plus pressed lighting. This is lightweight
CSS compositing inspired by collectible-card foil, not a Balatro asset or WebGL
shader. Existing Reveal sheen remains underneath. No new renderer/dependency.
Text and pointer input remain usable; disabled buttons suppress the effect,
reduced motion freezes it and Effects off removes it (iframe uses body.reduced).
Review in context before calling the creative treatment accepted.

Idle CTA follow-up: primary reveal/replay/spin actions now maintain a slow five-second
alternating foil sweep without hover. Hover/focus accelerates it to two seconds.
Answer choices retain the calmer finite treatment. Disabled, reduced-motion and
Effects-off rules still apply. Both embedded spin labels use the same 380px maximum
width, 72px minimum height (66px on phones), and 24px/21px display type.

Game-button typography: use the exact wheel-number Poppins ExtraBold 800 face,
served from `/wheel-lab/poppins-800.woff2` as OotleGameDisplay, on all buttons inside
Daily Spark and on embedded wheel actions. Preserve answer text wrapping and
accessible sizing. Site navigation outside this game section keeps its own type.

Finale voice: final wins rotate their own longer payoff headlines from
TRIVIA_COPY.finale, independently of the brief answer-confirmation copy. Follow
with congratulations, explicitly banked AI Sparks, a creator-oriented invitation
and the numeric total. Avoid cash-out language: AI Sparks are creation credits.

Reveal invitation electric border: a masked conic-gradient rim rotates bright lime,
cyan and white contact highlights around the rounded perimeter, with soft outer
light. It runs slowly at rest and accelerates on hover/focus. The foil fill remains.
Keep the masked electric stroke inside the button clip; box-shadow carries its
light outside. This avoids losing the stroke to inherited overflow clipping. Reduced motion freezes
edge motion; Effects off and disabled completion remove the electric treatment.

LED runner refinement: use one continuous lime-to-cyan gradient tail and one soft
bright head, not separated flashing hotspots. Maintain the same four-second linear
cycle on hover to avoid phase jumps; increase glow only.

Continuous LED border supersedes the racer/tail treatment: illuminate every edge
and corner at all times using a fully opaque lime/cyan/pale-yellow cyclic gradient.
Animate color positions, never border coverage or brightness. No transparent gaps
or isolated head. Hover strengthens glow without phase/speed changes; reduced
motion retains the complete static multicolor border.

The continuous CTA border also includes approved hot pink `#FF3CBA` and a soft
Hero Pink `#F3A9FF` transition alongside lime and cyan. Keep all stops opaque.

### Shared spin-button neon border

Reveal Today’s Trivia, SPIN IT! and Spin It MORE!! share the full-perimeter
neon treatment in `hub/client/public/reward-buttons.css`. Both wheel stages
reuse `body.embedded #spin`; do not duplicate stage-specific effects. Preserve
the larger spin target, wheel-number typeface and foil surface. The opaque lime,
cyan, hot pink and Hero Pink stops flow continuously at four seconds per turn,
with no dark gaps or hover phase reset. Disabled buttons hide the effect; reduced
motion freezes the border, and the effects-off mode removes it. This changes
presentation only, not outcomes, odds or AI Sparks settlement.

The horizontal pre-play journey animates only its icon badges. Keep the text,
connector lines and transparent row surfaces steady. Do not reuse the legacy
card-wide `journey-charge` background/shadow animation in this layout; it creates
rectangular flashes behind the copy.

### Base-to-Super spatial continuity

Treat both spins as states of one stage. In embedded mode reserve fixed rows for
the wheel, outcome copy, primary action, odds label and odds. Keep the crystal,
pointer, wheel center and CTA anchored through first spin, bank celebration and
Super reveal. Place the optional odds below the CTA so their appearance cannot
push it down. Keep copy compact within the shared outcome area; do not restore
a separate large Super introduction. Desktop and narrow screens use the same
row structure with a responsive wheel-stage height. Hidden initial copy keeps
its reserved space. Preserve the existing reward timing and settlement contract.

Warm the Super disc while the canvas is hidden at startup. Transition the wheel
canvas with a 160ms fade-out and 280ms fade-in around the face swap, leaving the
crystal iframe and stage geometry fixed. Disable the action during transition;
reduced motion switches directly. Do not defer texture creation until reveal.

First-spin play-by-play uses the same anchored copy area as Super: FIRST SPIN /
Boost your haul. / base AI Sparks locked, maximum 5×. On spin: Charging up…;
while moving: Make it multiply.; slowing down: Coming in hot.; then the actual
multiplier and total. Reveal the outcome only on settlement, never during motion.
Keep the ready copy visible rather than reserving an empty panel.

The starting crystal is a semantic button sharing the Reveal CTA handler and
busy/completed lock. Support pointer, touch, Enter and Space with a visible
keyboard focus ring. The decorative iframe cannot intercept interaction.

## Persistent wallet payoff

Use the header AI Sparks wallet as the single running balance. The trivia reveal
shows only the reward earned (+amount); do not add another balance badge beside
it. Each confirmed award sends a small group of the existing four-point Spark
marks along curved paths from the crystal or wheel into the visible wallet.
Arrival triggers a brief scale/brightness pulse, lime inner charge and hot-pink
halo. Count from the prior confirmed balance to the new balance, then settle.
Super increases particle count and pulse strength, not layout size. Reserve digit
width and keep the mobile badge beside the countdown.

Presentation never awards currency. Coalesce fast confirmed gains from the earliest
unrevealed balance and consume each queued presentation once. The crystal's actual
reveal beat releases the trivia award; timer fallback is resilience only. First
spin and Super release on settlement. Effects Off, reduced motion or an offscreen
wallet use an immediate count update. Cancel flight on resize, scroll, navigation,
tab hiding and unmount. Effects are finite, click-through and excluded from the
accessibility tree. No new sound is part of this treatment.

Source: `hub/client/src/components/chargeWallet.ts`, `walletAward.ts` and the
`SparkBalance`/`TriviaProvider` components in `DailyTrivia.tsx`.

### Continuous wallet energy and reward typography

The wallet retains earned charge across the run: ignition after trivia (tier 1),
prismatic amplification after another confirmed gain (tier 2), and overcharge
(tier 3). Flights grow from 9 to 14 to 20 Sparks. Border light accelerates and the
icon core changes from lime through cyan to hot pink; only the arrival pulse
scales, never the header layout. Pending wheel rewards can show border anticipation
without updating the number or advancing the earned tier. An unchanged award does
not advance energy. Completion holds charge for ten seconds after the last award,
then eases to normal; ready/loss resets immediately. Motion preferences leave
static earned-state feedback, without moving border electricity.

`public/reward-type.css` is the shared typography source for first-win headlines,
wheel play-by-play/payout text and final win/loss headlines. It uses the existing
Poppins 800 file, purple dimensional shadow and dark lower shadow. Depth scales
down for compact wheel text. Supporting instructions, odds and navigation keep
their normal styles. Animate title entrance on semantic phase changes only;
never restart an animation for numeric count-up ticks or each render frame.

## Shared win treatment (September 25)

Trivia, first-wheel settlement, Super settlement and the final successful payoff use one visual family: radial striped rays behind the collectible, an extrabold dimensional headline, an oversized tabular winning total, and one readable AI Sparks label. Keep the wheel geometry and center fixed. Trivia uses lavender rays, first spin violet rays with lime numbers, and Super/finale pink rays and pink numbers. Rays enter once and settle; reduced-motion and effects-off stop the movement.

Use public/reward-type.css as the shared treatment; SparkUnlock supplies the original trivia rays. Headlines use OotleReward/Poppins 800 with purple extrusion and dark depth shadow. Totals are 64–100px in wheel/finale views and 76–100px in trivia. Supporting player-facing reward text starts at 18px; units use 20px. Remove repeated equations, repeated bank confirmations and transition explanations rather than shrink them. Keep odds accessible and label totals truthfully: wheel values are the complete round payout, not an extra award. Preserve the simulated-playtest disclosure.

Changing this treatment must be checked at trivia, first payout, Super payout, final message and reset on desktop and phone. This presentation pass does not change settlement, probabilities, wallet events, approved crystal assets, fire or Spark showers.

### Super invitation
The unlocked Super offer is an escalation: “SUPER SPIN UNLOCKED”, “GO SUPER.” in 44–68px pink dimensional display type with lime Spark accent, then “[banked] locked. Chase [maximum] AI Sparks.” Keep the existing “Spin It MORE!!” action. A single 650ms charge entrance settles into readable text; reduced-motion/effects-off disable it. Scope this treatment to super-ready so spin commentary and settlement retain their own hierarchy. The wheel render area and center stay unchanged.

### Trivia reward collection
Use one continuous collectible-to-wallet payoff. The shared chargeWallet effect mounts at document-body level, measures the real collectible and persistent wallet, and sends a staggered fan of Sparks into that target. First arrival (850ms) triggers wallet energy and count-up. Remove the separate clipped unlock-loot flight; never aim at a hard-coded viewport corner. Preserve the payoff spacing when removing its DOM layer. Offscreen wallet, reduced motion, effects-off, scroll, resize and hidden-page transitions settle the confirmed balance without leaving stray particles. No accounting changes.

### Scale collection with the award
All confirmed trivia and wheel gains use the same source-to-wallet flight. Scale by the new gain (to minus from), not lifetime balance or spin ordinal: up to 150 uses 14 Sparks, above 150 uses 28, and 1,500+ uses 48 (36 on narrow screens). Larger awards increase sprite size, sweep, collection duration and wallet glow. Bound horizontal paths to the viewport; finish all flights before cleanup. Wallet energy/count-up starts at first arrival and grows while the rest collect. Keep effects cancellable and preserve reduced-motion settlement.
Final rotating headlines stay brief: “LOOT SECURED!”, “SPARKS STACKED!”, “YOU COOKED!” The large winning number does the explaining; keep the dimensional styling.

### Jackpot wallet impact
For gains of 1,500+, group incoming Sparks into three waves 440ms apart. Each arrival emits an outline shockwave around the wallet and eight downward Spark flecks; keep the number readable. Three brief scale/tilt/glow impacts accompany a 1.6-second smooth count-up. All effects finish within three seconds, before the finale. Reuse the existing body-level collection layer and cancellation lifecycle; no new assets, audio or accounting changes. Small payouts retain their lighter treatment.

### Uniform stripe geometry
All four successful reward scenes use reward-rays from public/reward-type.css, including trivia. A fixed square ray disk (960px, or 720px for scenes up to 600px wide) is centered at 50% horizontally and 220px/180px below the scene top. The decorative layer is 580px/540px tall. Use the named reward-scene container query so the wheel iframe and main page choose size from actual scene width, not different viewport widths. Copy length must not resize the rays. Share stripe angles, radial fade and 4.4-second entrance; vary only color. Pause the pseudo-element while trivia's crystal loads; honor motion settings.

### Shower depth
The page-wide celebration should read as stripes behind shower behind wheel/fire. Because the wheel lives in an iframe, the body-level shower uses destination-out occlusion after drawing: an opaque wheel guard to 1.18 radii, feathering to transparent at 1.58 radii, plus tight measured payout-text boxes. Do not restore the old broad rectangular exclusion; it makes the striped field appear above the shower. Wallet-collection Sparks remain a separate foreground journey. Preserve canvas state, motion guards and cleanup.

### Super spin momentum
Super uses ten full rotations plus its landing remainder, a 350ms wind-up and 6.1-second travel. Ease with 1-(1-p)^3(1+3p): stronger sustained momentum followed by zero endpoint velocity. Grinder intensity follows p(1-p)^2 normalized by 4/27. First spin retains five turns, 650ms wind-up and its original curve. Keep total duration 6.45 seconds and the landing angle unchanged so reward timing remains synchronized.

### Beveled Super wheel, banked multipliers
The isolated reward playtest reuses the first wheel's original Spline segments, bevels, label transforms and prismatic/LED finish for Super. Do not replace it with a flat overlay disc. Swap labels and panel colors in place; preserve wheel center, pointer, fire, grinder sparks and Super momentum. Warm the alternate labels before the transition.

Twelve equal wedges clockwise use `[2,1,1,5,1,1,10,1,1,20,1,1]`. Special wedges are 90 degrees apart. Multipliers apply to the banked first-wheel payout: 1× retains it, 2×/5×/10×/20× boost it. Thus a banked 750 becomes 750/1,500/3,750/7,500/15,000. Eight 1× wedges imply 66.67%; each special wedge is 8.33%. The playtest scripts the 20× result and clearly remains simulated. Server-backed production reward rules are unchanged.

Reuse receipt: the already licensed, locally tested Spline geometry and existing label material pipeline provide matching depth without new downloads or assets. Validate all five settlements and duplicate settlement protection, inspect pointer/label agreement, both wheel transitions and desktop/phone layout before delivery.

### Approved Dark Energy Super palette
Approved September 25, 2026 after review in the playable preview. Super's 1× faces alternate near-black `#09051c` and dark plum `#170c29`. Boost faces are 2× violet `#813bf5`, 5× hot pink `#ff3cba`, 10× cyan `#59f5ff`, 20× lime `#c9eb00`. Keep bright outlined numerals, physical sheen and animated prismatic bevels. This changes Super faces only; preserve first-wheel colors and the independently randomized crystal loadout.

Maintain this multiplier-to-color mapping across captures and runtime rebuilds. Color supplements the numeric labels; it must never replace them or alter payout odds. The source mapping is in `hub/client/public/wheel-lab/native.js`, applied to every material in each wedge group. Reuse existing Spline geometry and licensed effects; no additional asset files are needed.


## Current presentation pass — September 25, 2026

- Invitation copy: “wXTM lock-up trivia game!”, “Answer 1 Q”, “Bank your W”, “Spin for Boost”. Remove the redundant multiplier subtitle. Recipe disclosure says “Riff this Game ↗”.
- Next Drop is a compact right-aligned HUD; omit “A fresh vault every day”. Test again is a small corner control.
- Wallet toggle is compact/translucent purple when disconnected and lime when showing staked wXTM. Header uses AI Agents and two-line Creator Stack with matching raised navigation treatment.
- Audio is temporarily disabled in DailyTrivia.enableSound. Procedural cues remain editable but were rejected as thin/tinny; do not present them as approved audio. Wheel messages validate origin and source; wallet arrival triggers payout cues without modifying balances.
- User approved the replacement direction: GameChestAudio Jackpot Win, https://elements.envato.com/jackpot-win-MM4STKG (six variations). Opened in Chrome for the user to download through their account. Licensed files have not been supplied or integrated. Resume by importing supplied files with provenance and auditioning in-game; do not infer listening quality from automated tests.
- The original easy question pool and three original playtest questions are active for presentation. Harder scenarios are preserved inactive; see ../hub/CREATOR_TRIVIA.md.

These current settings supersede earlier audio/default-copy instructions above.
