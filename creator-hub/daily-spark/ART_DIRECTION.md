# Daily Spark art direction and game-feel brief

Written 2026-09-24 for the Lobby Vault v4 plates (merged in #239) and the game-feel pass that follows them. This is the brief `create-game-assets` asks for, filled in after the fact for v4 and used as the contract for later changes. Machine-readable records live in [`asset-manifest.json`](asset-manifest.json).

The Daily Spark plates and their usage rules are recorded in the design system: [`design-system/assets/Daily Spark/README.md`](../design-system/assets/Daily%20Spark/README.md), with the [VaultSpinner](../design-system/components/VaultSpinner/README.md), [DailySparkCard](../design-system/components/DailySparkCard/README.md) and [SparkRewardReveal](../design-system/components/SparkRewardReveal/README.md) guidelines.

## Skill receipt

| Skill or guide (path) | Applied decision |
| --- | --- |
| `.agents/skills/resource-first-workflow/SKILL.md` | Reused the existing plate geometry, `canvas-confetti`, reveal tiers and CSS layers. No new package. The trial was one disc at native scale before the family export. |
| `.agents/skills/tari-game-development/SKILL.md` | Routed to the vendored disciplines below. The client is React/Vite, not a game engine, so the engine-neutral patterns were translated into CSS and React state. |
| `.agents/skills/gacha-reward-experience/SKILL.md` + `references/mobile-gacha-research.md` | Odds labels match `MULTIPLIERS`. Presentation is scaled to the real outcome. The settled ledger stays the source of truth. No pity, paid currency or fake rarity. |
| `skills/vendor/gamedev/skills/disciplines/create-game-assets/SKILL.md` (+ `references/art-direction.md`, `provenance.md`) | This brief and the manifest. The plates were judged at the 304px and 280px disc sizes against the real page. `asset_report.py` and `build_preview_sheet.py` were run on every PNG. |
| `skills/vendor/gamedev/skills/disciplines/game-feel/SKILL.md` (+ `references/feedback-recipes.md`) | Three importance tiers (tick / pop / gateway). Eased overshoot for the pop and ease-out for the settle. Every effect returns to rest. Nothing blocks input, and the skip control stays live. |
| `skills/vendor/gamedev/skills/disciplines/game-ui-ux/SKILL.md` (+ `references/layout-and-flow.md`) | Protected bounds for copy (the hero no longer spills onto the rules). One primary action per state. Focus moves to the next action after each beat. |
| `skills/vendor/game-design/game-design-peak-end-audit/SKILL.md` | Audit below: the remembered peak is the landing, and the ending is the counted-up ledger. |
| `creator-hub/agents/CREATIVE_OPERATING_RULES.md`, `BRAND.md` | Recorded unfilled `BUILD_PLAN.md` requests (see the manifest). Reviewed reveal and quiet settled states at desktop and 390px. Approved copy is unchanged apart from the bonus detail line. |

## Game frame

- **Player fantasy:** crack today's vault. You earn the base by knowing the answer, then gamble a single spin for the multiplier.
- **Core verbs:** answer, spin, watch it land, bank.
- **Engine and renderer:** React 18 DOM + CSS transforms. Plates are `<img>` layers (SVG and PNG). The confetti canvas is bundled.
- **Target platforms:** desktop and mobile web, from 390px width upward.
- **Camera/view:** flat, front-on disc. The hero crystal is shown at three-quarter view.
- **Native size:** the disc is `min(304px, 100%)` (280px on phones). The face is 82% of the disc and the hub 34%. The hero in the reactor is 255px tall (220px on phones), and the hub crops to its core at 250%.

## Visual system

- **Shape language:** a round, mechanical disc read as a prize wheel. The crystal is angular. Tiers differ by shape: 1× plain, 2× one pip, 3× two lime pips, 5× a sunburst wedge with a spark.
- **Silhouette priority:** the landed wedge and the pointer tip must read at 280px. The labels are radial so the landed one is upright.
- **Value structure:** dark ink ground; lavender and purple mid values; lime reserved for the top outcome and the pointer.
- **Palette roles:** ink `#040723` (ground, outlines); cloud `#ECEEFF` (labels, foil highlight); purple `#813BF5` family (wedges, crystal); lime `#C9EB00` (5× only, pointer, energy core); foil `#c3c9ee`→`#5f6aa3` (rim, spokes). No gold anywhere on the disc.
- **Materials:** cool silver/lavender foil, glass-like wedges with an outer bevel, a crystal with a blurred lime core, lit marquee bulbs.
- **Edges:** crisp vector edges. Ink outlines on labels and the pointer; foil strokes on the rim and spokes.
- **Lighting:** from the top-left on every plate (sheen, facets, foil gradients).
- **Detail density:** highest on the rim and the landed area; the hub is simple so the core reads.
- **Motion character:** snappy mechanical travel (3.4s ease-out), then one decisive pop and a settle. See the tiers below.
- **Exclusions:** gold casino chips, photoreal humans, text beyond odds labels, copied game UI, near-miss teasing, permanent particle fog over the ledger.

## Feedback tiers (game-feel)

| Tier | Event | Feedback | Duration |
| --- | --- | --- | --- |
| tick | 1× landing, correct answer (quiet reveal) | Pointer dip, "Answer locked." quiet overlay | 420ms dip · 1.3s hold |
| pop | 2× / 3× landing | Pointer dip, 4% disc pop, lavender flash on the landed wedge, then the mid reveal (28 confetti) and a banked count-up | 520ms land beat · 2.2s reveal · 700ms count |
| gateway | 5× landing | Existing lime ring and glow on the rim, hold for the Super choice | Until the player chooses |
| top | Super ≥50× only | Existing coin rain, 64 confetti, "NO SHOT." | 2.2s |

Every tier respects `prefers-reduced-motion` and `data-hub-effects="off"`: animation is removed, the result shows immediately, and the ledger shows the final total. Skip cancels the land beat. Audio remains opt-in and has **NOT BEEN AUDITIONED** in this pass.

## Peak-end audit (recorded round, 2026-09-24)

Two real rounds were captured frame by frame at 1280px (a 2× and a 3× landing) and one after the changes (1×).

- **Positive peak before:** the payout overlay. However, it covered the wheel the instant it stopped, so the player never saw the wheel decide.
- **Missed peak:** a correct answer went straight to the wheel with no beat. The existing `base` reveal was never triggered.
- **Negative note:** the reveal read "+300 · Base × multiplier = banked" while the ledger said 450. The strongest moment contradicted the ending.
- **Ending before:** a static ledger; the spin button during travel looked disabled (grey-olive).
- **Remembered story before:** "The wheel spun and a number flashed."
- **Changes:** a quiet correct-answer beat; a 520ms landing hold with a tiered pop; a truthful bonus line ("3× landed · bonus on top of your base."); a live "Spinning…" control; the banked total counts up from the base after the overlay clears.
- **Remembered story target:** "I got it right, watched it land on 3×, and saw my loot climb."

## Directions considered

- **v3 authored pack (baseline):** flat purple wedges, upright labels, a pointer aimed away from the disc. Compared side by side with v4 at native disc size.
- **v4 arcade marquee (chosen, merged):** foil rim with lit bulbs, tier shapes and a downward pointer. It was chosen because it adds the loot-culture craft `BRAND.md` asks for without leaving the palette, and it reads at 280px.
- **Not explored:** holographic trading-card foil and a minimal neon-vector wheel. They are recorded here so a later pass can test them against v4 at the same scale; they are not rejected on evidence.

## Visual target and approval

- **Target:** the v4 plates at 304px in the live page (see `asset-manifest.json` for paths and hashes).
- **Human approval:** the requesting user approved merging without CD/AD review. Aesthetic acceptance by the art directors is still **open**.
