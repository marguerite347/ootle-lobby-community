# Asset store implementation handoff

Updated 2026-09-22. User decision: **build the flow first; connect a network later**. Licensing review is deferred, not an upload prerequisite.

## Available now

Open `/create/assets`, also linked from Create and each saved project. Search and paginate individual assets, packs and creation tools, filter by source or free/download vs sale draft. Provider images are real source previews. Download links open original sources; the hub does not mirror thousands of asset binaries.

The checked snapshot contains 2,380 Poly Haven assets, 2,892 ambientCG assets and 215 Kenney packs. Alongside existing tools and provider directories the asset library has 5,505 entries. Counts are observations, not fixed limits. Freesound, OpenGameArt, Sonniss GDC, Incompetech and Pixabay music/SFX are discovery directories, not API integrations.

Creators can upload PNG/JPEG/WebP/GIF, WAV/MP3/OGG, GLB, ZIP or JSON (10 MB max), select free or fixed-price draft distribution, and prepare an optional NFT design. Six editable presets cover collectibles, equipment, consumables, achievements, access passes and custom resources. Configure supply, mint/update authorities, transfer/burn options and per-attribute mutability. Saving does not mint, list on-chain, charge or purchase anything.

From an existing project's asset link, Add to project saves the resource into its component manifest and editable workflow. The source file is not automatically downloaded into the game engine.

## Implementation and history

- `client/src/pages/Assets.tsx` and `Assets.css`: library, pagination, uploads, draft editing and project attachment.
- `client/src/pages/AssetCommerceEditor.tsx`: editable sale/NFT configuration.
- `shared/assetCommerce.mjs`: validated canonical configuration, presets and pinned upstream references.
- `server/assets.mjs`: upload storage, filtering, optimistic draft revisions, export.
- `server/app.mjs`: POST `/api/assets`, GET `/api/assets`, PUT/GET `/api/assets/:id/commerce`, GET `/api/assets/:id/file`.
- Upload files and initial metadata live under the runtime data directory's `assets/upload-<uuid>/`. Later edits append full revisions to `commerce-history.json`; stale saves return 409. These private runtime files are gitignored and need host backup, just like project data.
- Export Ootle plan returns JSON with file checksum, configuration, revision, pinned template references and explicit null network/deployment fields.

This replaces the previous 18-item Poly Haven sample and license/rights checkbox gate. It adds full provider ingestion, search/pagination and authoring without inventing on-chain completion. Uploaded sale-draft files remain accessible in the shared hub: there is no paid-delivery entitlement or authenticated seller boundary yet.

## Sources and refresh

- Poly Haven: `server/connectors/polyHaven.mjs`, full public metadata map.
- ambientCG: `server/connectors/ambientCG.mjs`, [v3 assets API](https://docs.ambientcg.com/api/v3/assets/), 500-item pages with completeness/duplicate checks.
- Kenney: `server/connectors/kenney.mjs`, paginated [asset directory](https://kenney.nl/assets), individual pack metadata and previews.
- Other directories: `../resources/asset-providers.json`.

Refresh from the hub folder:

```sh
node --input-type=module -e "import {ingest,writeSnapshot} from './server/ingest.mjs'; writeSnapshot(await ingest({only:['polyhaven','ambientcg','kenney-packs','asset-providers'],enrich:false}),{seed:true});"
```

Only commit the public seed when intentionally updating it. Runtime cache is hot-reloaded. Ingestion retains last-good records on source failure and marks stale sources. The existing in-process hourly task currently watches wiki/forum apps, **not these asset catalogs**. Schedule asset refresh through the same sequential ingestion job when adding hosted maintenance; do not run independent concurrent snapshot writers. No daily refresh service is claimed here.

## Ootle foundations and remaining connection checklist

The exported plan references [Tari Market](https://github.com/johnnysessa/Tari-Market) at `30a989d5c68d0dc30da8078ef0ae6e35946388dd` (`contracts/xtm_market/src/lib.rs`) and the [native Ootle NFT example](https://github.com/tari-project/tari-ootle/blob/8034f10b412ade1703cb830b8f08dee494c6b0c1/crates/engine/tests/templates/nft/basic_nft/src/lib.rs). These are reference inputs, not deployed components. Tari Market currently models physical shipping; the NFT example has permissive test access rules.

- [ ] Adapt and test Tari Market for digital delivery, cancellation, inventory and entitlement recovery; remove shipping dependencies.
- [ ] Translate each NFT design into native resource metadata and enforced authority rules, including supply caps, immutable traits, transfer and burn controls. Compile and test against a pinned Ootle toolchain.
- [ ] Add seller identity and authorization, storage quotas, backup and paid-file entitlement checks before operating a public marketplace.
- [ ] Choose network, native payment resource, wallet interface and deployed component addresses. A currency label is not a token address.
- [ ] Implement wallet-approved mint/list/buy/cancel requests with pending, rejected, failed and finalized receipts. Never infer success from a draft save.
- [ ] Reconcile chain state into the catalog and verify balances, NFT ownership and digital delivery end to end.
- [ ] Complete the user's separately requested licensing pass later.

## Verification

`npm test`: 113 server tests and 25 client tests pass with the expanded seed. Coverage includes pagination, incomplete provider batches, preset independence, invalid prices/authorities, byte-exact upload/download, HTTP draft update/export, revision conflicts and null deployment fields. `npm run build` passes. Browser inspection verified library search, provider previews, optional NFT controls, changing to equipment attributes and fixed-price fields on the local 4189 build.
