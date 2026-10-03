# PROVENANCE — Lobby Vault Disc

| Field | Value |
| --- | --- |
| data-art / id | `authored-lobby-vault-disc` |
| Date | 2026-09-24 (v4 art pass) |
| Author | Claude Code for the Ootle Lobby team; generated SVG from `hub/scripts/daily-spark-art/generate.py` |
| Stock / Envato / Y6 | **No** |
| Font | Poppins 800 (SIL OFL, `@fontsource/poppins` 5.2.7), outlined into paths |
| Odds labels (exact) | `1×, 2×, 1×, 3×, 2×, 5×`, matching `MULTIPLIERS` in `hub/server/dailyTrivia.mjs` |
| Rim | cool foil silver/lavender — **not** muddy gold `#c7a476`/`#efcc87` |
| Hub | Vault Charge `vault-charge-hero` at 34% of the disc |
| Review | Not yet reviewed by CD/AD; direction proposal, not production ACCEPT |

## v4 art pass
- Face: tiers read by shape and size as well as colour — 1× plain, 2× one pip, 3× two lime pips, 5× lime sunburst wedge with ink label and spark. Labels run radially so the landed wedge reads upright under the pointer. Foil spokes with rivets, marquee dots, sheen and vignette.
- Rim: foil band with specular, 27 lavender marquee bulbs in an ink channel, notches aligned with the face spokes, and the fused lime **5× · SUPER PATH** plaque centred on the 5× wedge (330°) with lime bulbs at each end.
- Pointer: now points down into the disc (the v3 plate pointed up); faceted lime blade under a foil cap.
- Gateway badge: cutout ticket with a perforated spark stub.
- Vault Charge hero: faceted crystal lit from the top-left, blurred lime energy core and filament, orbit ring, foil plinth with a lime light ring, sparkles.

## Rebuild
From `creator-hub/hub` after `npm ci`: `python3 scripts/daily-spark-art/generate.py client/public/daily-spark/vault-disc`, copy `vault-charge-hero.svg` into `../vault-charge/`, then `node scripts/daily-spark-art/export-png.mjs` (needs Playwright + Chromium). Update the SHA256 constants below and in `src/components/vaultChargeArt.ts`.

## Files
- vault-disc-face.svg + png + @2x png
- vault-disc-rim.svg + png + @2x png
- vault-pointer-lime.svg + png
- vault-gateway-badge.svg + png
- vault-charge-hero.svg/png (copy of `../vault-charge/`)

## SHA256
```
73f9b6bc0a242f49a80d907e0a83f4b8fb9a4d900c3cb03bded0b96c01928236  vault-disc-face@2x.png
4ba1f365e79d58048742c3c4e68b2b7065534971ae3349e03bb3256c99542c8f  vault-disc-face.svg
9321083acb9ccd4aaedc58b088e38197e3d95cc7c1c0d73d9fa8fe4d04d3182c  vault-disc-rim@2x.png
f038205b9a4522665cd3c4f66a37e6aed0478ce826e51d622a27d62bd293b076  vault-charge-hero.png
```
