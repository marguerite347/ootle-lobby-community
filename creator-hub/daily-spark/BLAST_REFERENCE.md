# Daily Spark: Blast wheel reference and jackpot direction

User direction, 2026-09-23: the current 5x maximum is too tame; create a much wilder multiplier with a genuine opportunity for a large soft-point win. Grok retains design/implementation ownership; Codex coordinates resources, review and preview.

## Existing repository source

`docs/reference/marketing-plan-v2-import.md` links these references at lines 274 and 1069:

- https://youtu.be/TsiGe9qY4Q8 — **Taking a Spin on the Blast Points Wheel - Ethereum Layer Two - Crypto Point Farming - ETH L2 by Blur**. Title resolved via web on 2026-09-23. Video motion/audio has not been inspected by Codex in this review; do not invent a shot-by-shot description.
- https://coinmarketcap.com/academy/article/what-is-layer-2-blast — historical case study. Its rewards section describes a Super Spin paying 10x normal rewards, along with deposit/referral mechanics. It does not establish exact wheel probabilities or current Blast behavior. Deposit/referral/airdrop design is not part of this Daily Spark request.

## Current baseline and requested proposal

PR186 at c76b810 uses six equally likely slots [1,2,1,3,2,5], 100/150 base, max750, expected multiplier7/3. Base is already banked; spin credits only the additional amount. Daily Spark uses nonredeemable Sparks, separate from TARI.

Producer was asked to coordinate Economy, Rewards, Design and presentation specialists on two transparent weighted jackpot options and a possible rare second-stage boost. Report probabilities, expected issuance, max payout for both bases, once-per-day rules and idempotency. Preserve a correct settled result; no fake near-misses or equal-wedge implication for unequal odds. Dramatic payoff should scale by actual win tier, with skip/reduced-motion alternatives. 25x/100x/1000x are exploratory values, not approved final parameters. Grok must choose and justify the final art/interaction direction. No new paid media or worker was launched by this reference recovery.
