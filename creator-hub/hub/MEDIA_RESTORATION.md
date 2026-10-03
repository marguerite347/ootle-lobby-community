# Resource media restoration — 2026-09-22

The isolated preview instance had its catalog but no runtime media library. Restored
existing approved artwork/captures rather than generating replacements. A second
bug loaded seed posters after the library, overriding four app videos. Seed now
loads first. Mobile percentage widths on the max-content carousel track expanded
cards to roughly 9000px once images loaded; viewport-bounded widths fix that. Detail
media now uses the same 16:9 crop as cards.

## Resource selection

Reuse: existing reviewed preview indexes, `previewFor`, `ResourceCardMedia`, and the
resource-specific video policy. These already cover homepage, discovery and detail;
no new renderer or provider was needed. Imported 171 eligible entries, skipped five
missing/unreviewed entries; approval metadata and byte hashes are preserved. This
restores existing approvals, not a new visual certification of every artifact.

## Verification

- 10 focused importer/resolver/policy/serving tests passed.
- Client build and 40 client tests passed.
- Live media audit: 30 distinct homepage resources with video, matching home/search/
  detail selections and valid local media responses; no featured failures.
- Browser inspected the Ootle, GDevelop and popular shelves and a 360 Platformer
  detail. Visible videos decoded and advanced; offscreen videos paused.
- 390px and 1440px viewports: cards stayed 298px inside borders, no page overflow.
- Full catalog: 161 of 5671 records resolve video. The 5510 remaining records are
  outstanding coverage, including newly imported resources; not completed artwork.

## Operations

Use `npm run media:import -- <approved-library>` with the serving runtime directory,
then `npm run media:check -- <origin>`. Server startup warns on missing featured
videos. `--all` after the origin makes uncovered full-catalog resources fail the
check as well. The local restored library is kept outside the temporary checkout;
future instances should use a persistent `CREATOR_HUB_PREVIEWS_DIR` or import it.
Media stays out of Git. These changes are locally verified, not deployed.
