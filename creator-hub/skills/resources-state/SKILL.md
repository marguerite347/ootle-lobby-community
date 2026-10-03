---
name: tari-resources-state
description: Design Ootle assets, vaults, buckets and authorization as separate native concerns. Use when modelling tokens, NFTs or in-game items on Ootle, choosing resource types, or separating component state from asset balances.
---

# Resources and application state

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Native concepts

A resource defines an asset type; a vault holds one resource persistently; a bucket temporarily carries that resource during execution. The inspected implementation distinguishes public fungible, non-fungible, confidential and stealth resources. A component's ordinary fields are application state, not automatically asset balances or confidential storage.

Resource actions and the permission to update their rules are separate. Inspect mint, burn, withdraw, deposit, recall, freeze and metadata/data update rules. Locking an update rule has different consequences from denying today's action. Do not infer security from the resource's name or token symbol.

## Design a creator item

Write down whether an item is ordinary game configuration, a fungible balance, or an individually identified resource. Specify who creates it, who may mutate it, what is transferable, and how a rejected purchase leaves state. Choose integer base units and record divisibility.

Build a test that withdraws payment into a bucket, invokes the purchase, deposits the output, and verifies both holdings. Add wrong-resource, insufficient-funds and unconsumed-bucket cases. An unconsumed bucket makes the transaction invalid; storing its ID in a JSON field is not persistence.

## Example and validation

The bundled counter is a component-state example only. It intentionally does not claim to exercise resource minting or private transfers. For a resource example, derive the API from the linked builder source and official resource guide, then attach engine test evidence before promoting this skill from draft.

## Non-equivalents and limits

A vault is not an ERC-20 allowance mapping. A component ID is not a token ID. Burning is not the same as moving currency to another holder. Resource-level privacy does not hide public game fields, event metadata or client analytics. See [privacy](../privacy/SKILL.md) and [economy](../economy-simulation/SKILL.md).

## Primary sources

- [Pinned source: crates/template_lib/src/resource/builder/mod.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_lib/src/resource/builder/mod.rs)
- [Pinned source: docs/developer-docs/src/content/docs/guides/resources.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/resources.mdx)
- [Pinned source: docs/developer-docs/src/content/docs/guides/authorization-and-access.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/authorization-and-access.mdx)
