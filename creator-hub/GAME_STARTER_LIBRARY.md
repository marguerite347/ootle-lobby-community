# Game-type starter discovery

Implemented 2026-09-21 in Create and `/create/starters`.

The journey is genre → source/demo and setup → save selected starter in a project →
reference Tari building blocks → test and share a version. This is discovery and
project configuration, not an automatic source-code fork, editor or deployed game.

## Included

The canonical catalog supplies existing GDevelop examples, Luanti games/mods,
PlayCanvas engine/examples and native Tari starters. Six additional curated records
cover The Modding Tree, A Dark Forest, Godot Deckbuilder Framework, a Balatro-style
Godot reference candidate, SMODS and official Godot demos. GitHub Topics is a further
discovery link, not a feed that certifies every result as reusable.

Ten overlapping genre categories, text search, engine and kind filters, pagination,
source/demo links, setup details and resource-to-project links are implemented.
Unknown licenses remain unknown. SMODS requires Balatro; the standalone Balatro
reference has no discovered license and is not offered as a reusable base. No new
external game was executed or certified as compatible with Ootle.

## Maintenance and handoff

- Add reviewed entries to `resources/game-starters.json`; keep sources and setup facts.
- The `game-starters` connector writes canonical records through normal ingestion.
- Genre/kind/engine classification is a search projection in `hub/server/gameLibrary.mjs`.
- Read `hub/README.md` for refresh commands and runtime-cache behavior.
- Further work: richer verified gameplay previews, additional complete deckbuilder
  foundations, source-revision pinning at project creation, automated upstream activity
  checks, tested engine-to-Ootle adapters and optional authenticated source forking.

Validation: backend library classification and canonical-link HTTP tests, existing
hub tests and client production build. Browser check: Cards category → Deckbuilder
Framework → project form retains selected base. Responsive layout inspected at
390px width. No public deployment; local preview uses port 4189.
