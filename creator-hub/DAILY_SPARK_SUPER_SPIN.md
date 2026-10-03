# Daily Spark — Preferred Super Spin

Locked 2026-09-23 for PR #186. Stage-1 stays the current equal wheel. Super Spin is an optional second stage after a 5× wedge. Sparks are not TARI. No paid spin, pity counter, or cash redemption.

## Source distinction

- YouTube `https://youtu.be/TsiGe9qY4Q8` is a **card-carousel feel reference only**. The viewed clip shows Blast Points cards at 300, 500, 750, and 1100, and lands on 300. It does not show Super Spin, multipliers, or odds. Do not copy those point values.
- The CoinMarketCap Blast article (`https://coinmarketcap.com/academy/article/what-is-layer-2-blast`) is a **historical metaphor**: Super Spin was described as about 10× a normal reward. Exact Blast odds were not published. Do not invent Blast odds or treat that article as our probability table.
- The Super Spin table below is **ours**.

Rejected imports: deposits, lockdrop, referrals, squads, tweet-for-spin, token airdrop, paid spins, cash or TARI redemption, wagering, pity, and a primary wheel of 25× / 100× / 1000×.

## Stage-1 (unchanged)

Equal slots `[1, 2, 1, 3, 2, 5]`, each with probability 1/6. The spin adds `base × (multiplier − 1)`. The base is banked on a correct answer. A 1× wedge keeps the base. One trivia attempt and at most one stage-1 spin per UTC day. Non-5× results close the vault. This is the path a local stage-1 playtest must still see.

## Super Spin (preferred)

Eligibility is a stage-1 5× (probability 1/6). The 5× total is banked before the offer. Decline or skip keeps `base × 5`. Taking the Super Spin is optional, once per UTC day.

Conditional chances, shown before the spin. They sum to 100%.

| S | Chance | Effective multiplier | Final credit |
| --- | --- | --- | --- |
| 1 | 60% | 5× | `base × 5` (no extra) |
| 2 | 25% | 10× | `base × 10` |
| 5 | 12% | 25× | `base × 25` |
| 10 | 3% | 50× | `base × 50` |

Final credit when Super is taken: `base × 5 × S`. The 50× path is stage-1 5× and then S=10. Overall chance of that maximum is `(1/6) × 3% = 0.50%`. Stage-1 ceilings stay 750 at a 150 base and 500 at a 100 base. Super ceilings are 7,500 and 5,000. Limits: one trivia attempt, at most one stage-1 spin, and at most one Super Spin per UTC day.

## Settlement

The server saves the outcome before the client animates. A retry, reload, or skip uses that saved total. Decline and an interrupted offer keep the banked 5×. Reduced motion and Skip reach the same balance as the full animation. Unequal Super chances use unequal wedge arcs and a published percent line. The stage-1 wheel stays six equal arcs.
