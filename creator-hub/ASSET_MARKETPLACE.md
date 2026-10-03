# Discoverable asset library and marketplace seeding

Implementation update, 2026-09-22. The local Ootle Lobby now provides `/create/assets` with searchable, paginated individual assets, packs and creation workflows. Full Poly Haven and ambientCG metadata catalogs and individual Kenney packs are indexed. Community uploads support editable free/fixed-price listing drafts and optional NFT designs. The user selected **build the flow first; connect a network later**. No wallet, deployed marketplace, minting, checkout or paid delivery is connected. Licensing review is deferred to a separate pass and is not an upload gate.

See [implementation and contributor handoff](hub/ASSET_STORE_HANDOFF.md) for code paths, revision history, tests and the network connection checklist. The sections below describe the broader target architecture; unimplemented filters and integration requirements are future work.

## What creators see

Searchable preview cards for models, materials, HDRIs, sprites, animations, UI, icons, fonts and audio. Filter by style, asset type, format, resolution, file size, animation/rigging, engine compatibility and license. Distinguish free download, commercial-use permission, attribution obligations and permission to redistribute; these are separate fields.

Each detail shows creator/provider credit, canonical source, license and terms link, available variants, prerequisites, last checked date and verified example projects. Prefer direct provider download links initially. Show “Add to project manifest” for a saved selection; do not imply a file was downloaded or tested. Optional import adapters can follow once validated.

## Sources and initial seeding

The current repository contains source inventories and design references, not a curated set of game asset binaries. Mine its existing Godot, GDevelop, Luanti, modding and awesome-list links for individual asset candidates. Do not publish an entire game's assets just because its code is public. The Godot collection already illustrates separate code and noncommercial asset licenses.

1. **Poly Haven:** first API candidate for models, materials and HDRIs. The [current API page](https://polyhaven.com/our-api) and [service terms](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md) permit commercial API use, require an identifying User-Agent and visible provider credit. Assets are CC0; service conditions remain separate. Keep attribution even when not required by the asset license.
2. **ambientCG:** [documented API](https://docs.ambientcg.com/api/) and [CC0 resource license](https://docs.ambientcg.com/license/). Validate the selected API version, pagination, service constraints and metadata coverage before collection; its docs warn about service reliability.
3. **Kenney:** curate individual free asset packs under its [asset-page CC0 policy](https://kenney.nl/support), useful for 2D/3D/UI/audio. No public bulk API was verified. Start with pack manifests and source links.
4. **Blendkit, formerly BlenderKit:** optional discovery links initially. Its [licenses](https://www.blendkit.com/docs/licenses/) distinguish CC0 and Royalty Free assets; the latter must not be assumed eligible for redistribution as marketplace assets. Confirm API access, preview rights, free-tier access and individual permissions before automated ingestion.

Blender is the creation/import application, not a single universal remote asset catalog. Treat a future Blender Asset Browser/add-on workflow as an import/export adapter over approved providers and project manifests. It is not a prerequisite for browsing or using assets.

The [provider registry](resources/asset-providers.json) is a machine-readable starting point, not proof of integration.

## Record and pipeline design

Extend CH-018 with asset and asset-variant records: provider ID plus upstream asset ID, canonical URL, author, title, type/tags, license/version/source, independent rights for thumbnails and files, price/access requirements, format, dimensions, byte size, checksums, dependencies, source timestamps, tested engine versions and provenance. Unknown permissions stay unknown. Track pack membership and derivatives without collapsing files with different licenses.

Bootstrap metadata -> normalize -> validate rights and required fields -> index approved records -> serve cached search. Incrementally reconcile changes, withdrawn content and broken downloads. Separate automatic metadata refresh from editorial tags. Use documented rate limits, conditional requests where supported, backoff and last-good snapshots with visible freshness. Frontend search should not fan out to every external API on each keystroke.

Keep manifests and connector code in Git. Store licensed cached previews/binaries in object storage only when needed and allowed; avoid filling Git with large packs. Link to original files by default. Record checksums and transformation lineage for generated variants. Validate GLB/glTF as a web-friendly target where available; do not claim automatic conversion of every Blender material, animation or rig. Never execute embedded scripts on import; preview/conversion workers need isolation and size limits.

## A useful first release

Propose 100 reviewed listings across environment models, materials/lighting, 2D sprites/UI and audio. This is a target, not an existing inventory. Prioritize coherence over count: assemble small matching collections for a deckbuilder, a simple 3D scene and a polished web launch page, linked to tested template recipes. Start with provider-hosted downloads and one validated API connector; add other providers incrementally.

Acceptance: useful filters and previews, original credit/license on every listing, working source/download links, a saved project manifest, one successful example import, no duplicate records on replay and correct handling of source removal/failure. Test provider terms, preview permissions, malformed files and incompatible variants. Measure successful asset-to-template use, failed downloads, license coverage and source freshness; clicks alone are not completed builds.

No paid marketplace, checkout, revenue-sharing arrangement or provider partnership is assumed.

## Creator-owned assets for sale

[Tari Market assessment](resources/tari-market.md) evaluates an existing Ootle testnet marketplace as a reference for seller profiles and commerce. Digital asset licensing, private file delivery, entitlements, recovery and refunds require additional design and validation. Free-source discovery remains usable without a wallet.
