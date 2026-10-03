# VaultSpinner

The one-spin multiplier disc shown after a correct answer, with a payout preview and the spin button.

Static rendition of `SparkVault` / `VaultDisc` / `PayoutStrip` in `components/DailyTrivia.tsx`, stacked with the Daily Spark art plates (`Daily Spark/` assets). The consumer supplies `multipliers` (server order `1×, 2×, 1×, 3×, 2×, 5×`), the rotation to the server's result, the beat (`idle · press · wind · travel · land`) and the base for the preview.

- Plates: rim at 100% and face at 82% rotate together inside `.vault-spin` (3.4s ease-out); the pointer sits fixed at the top; the Vault Charge hub covers the centre at 34%. When a plate loads, `has-pack-*` hides its CSS fallback layer.
- The landed wedge must equal the server result. A 5× landing adds the lime glow and ring (`is-land-5x`) and opens the Super path; nothing else earns that treatment.
- The preview strip shows what each outcome keeps, so no one commits blind. The spin button is flat lime with ink text; "Skip to the result" is always offered while spinning.
- Reduced motion snaps straight to the result (`is-snapped`).
