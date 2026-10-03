# Tari Market: creator asset sales reference

Reviewed upstream README and licensing notice on 2026-09-19 at revision `a39bb1714f1e58db66923c13318912badf97b2f5`. This is a source assessment, not a runtime test, security audit or approved production integration.

- [Repository](https://github.com/johnnysessa/Tari-Market)
- [README at reviewed revision](https://github.com/johnnysessa/Tari-Market/blob/a39bb1714f1e58db66923c13318912badf97b2f5/README.md)
- [Licensing notice](https://github.com/johnnysessa/Tari-Market/blob/a39bb1714f1e58db66923c13318912badf97b2f5/LICENSING.md)
- [Upstream security review](https://github.com/johnnysessa/Tari-Market/blob/a39bb1714f1e58db66923c13318912badf97b2f5/SECURITY_REVIEW.md)

## Fit

Potential native Ootle commerce reference for creator-owned sounds, models, sprites, templates and asset packs. Upstream describes listings, seller profiles, wallet checkout, escrow, order history, disputes and reviews. Current implementation is an Esmeralda tTari prototype with no real monetary value. Its shipping and receipt workflow is not a finished digital-download entitlement system.

Use the catalog experience as inspiration and evaluate selected contract/wallet/order patterns. Do not make free asset discovery depend on wallet connection or a purchase. A listing card can distinguish **Free external resource**, **Creator free download**, and **Creator paid asset**, with the same descriptive facets but different fulfillment.

## What a creator-assets adaptation needs

1. Seller uploads a versioned pack, preview and explicit buyer license. Record ownership/permission evidence and rights for all included files. Separate code, art, audio, model and generation-provider terms.
2. Validate file types, size and archive paths; scan uploads and isolate previews. Store private source files outside Git and publish only approved previews.
3. Buyer sees contents, compatible engines, version, price/network, license, update entitlement and refund terms before signing. Asset purchase does not transfer copyright by default.
4. Confirm the actual purchase outcome against the intended network/contract. Wallet approval or fee-only acceptance is not payment success. Persist an idempotent purchase identifier and reconcile unknown outcomes before retrying.
5. Grant account-linked entitlement to the purchased version and issue short-lived download URLs. Support purchase recovery on another device and an authenticated re-download library. On-chain state can evidence payment; large files remain off-chain.
6. Decide digital-delivery/refund rules explicitly instead of carrying over physical shipping confirmations or escrow timers. Define what happens to access after refunds and how disputes affect already-downloaded files; revocation cannot erase a downloaded copy.
7. Export credits and licenses with the asset into project manifests and Capture & Promote. Measure preview → purchase → successful download → project use separately, without publishing private wallet behavior.

First pilot: one creator-owned test asset, distinct buyer/seller test wallets, Esmeralda-only purchase, confirmed delivery, repeat download, lost-response recovery and refund scenario. No production funds or production-ready claim until independent validation and deployment decisions are complete.

## Reuse decision

Current release is **AGPL-3.0-only**, not MIT. Earlier MIT versions retain their original permissions, but the legacy MIT file does not license new AGPL code. Review the scope of corresponding-source obligations before incorporating modified code into the private hub or a hosted service. Keeping an adapter separate is not by itself a guarantee about licensing obligations. Linking to or independently learning from the project is the lowest-coupling starting point.

The pasted incremental/gacha reference is ideation, not a verified asset inventory. It does not establish reuse rights for proprietary game art, private-server assets or unspecified repositories. Select exact licensed source records before inclusion.

Related implementation scope: [CH-019 asset discovery](https://github.com/marguerite347/tari-growth/issues/41), [asset marketplace design](../ASSET_MARKETPLACE.md), [template marketplace](../TEMPLATE_MARKETPLACE.md). Creator sales is a separate proposed increment, not delivered by the existing free-source connector.
