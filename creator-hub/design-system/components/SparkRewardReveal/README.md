# SparkRewardReveal

The settled result: a BASE × MULTIPLIER = BANKED ledger, plus the tiered celebration overlay that plays over it.

Static rendition of `VaultReveal` and `VaultLedger` in `components/DailyTrivia.tsx` (settled ledger shown; the overlay fades after 3s live). The consumer supplies the confirmed base, multiplier and banked total from the server, and the reveal tier.

- Tiers scale with the real outcome: `quiet` (no ring, smaller number) for a 1× keep, `mid` (purple ring) for 2×–3×, `top` (lime ring, coin rain, "NO SHOT.") only for the top path. Never render an ordinary result like the jackpot.
- The ledger's banked value is 32px `tari-green`; labels are 8px caps. Show it only after the server confirms settlement.
- "Replay the celebration" is visual only and says so ("no extra points").
- Under reduced motion or effects off the overlay stays static, with no ring or coins.

## Accepted next crystal treatment

Use [AI Spark crystal and sparkle orbit](../AISparkCrystal/README.md) for the accepted September 24 visual direction. It is an isolated accepted proof, not yet integrated into this component. Preserve the confirmed ledger, outcome tiers, skip/replay semantics and accessibility requirements above when integrating.
