---
name: tari-wxtm-ethereum
description: Scope wrapped Tari integrations to verified Ethereum contracts and keep Ootle identifiers separate. Use when a task mentions wXTM, bridging or Ethereum-side Tari tokens; draft only, with no verified contract address or ABI.
---

# wXTM on Ethereum

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Explicit research boundary

This library has not established an authoritative current wXTM contract address, ABI, wrapping/redemption mechanism or deployment/network evidence. No transfer, approval or bridge code is supplied. This skill remains draft until those inputs are sourced and tested.

## Required inputs before implementation

Obtain the official issuer/project contract reference, Ethereum chain ID, deployed bytecode/verified source, ABI, token decimals, relevant implementation/proxy addresses, privileged controls, custody/redemption assumptions and supported wallet path. A ticker search or community message is insufficient to choose a contract.

Then verify a read-only contract query on that chain, compare source and deployment, and document how wrapped supply relates to the underlying asset. Native Ootle resource identifiers cannot substitute for Ethereum contract addresses. Native privacy guarantees do not automatically extend to public Ethereum token transfers.

## Measurement boundary

Define whether a growth metric means token transfer notional, actual trading volume, bridge activity or another agreed measure. Specify pricing source/time, decimals and deduplication. Self-transfers, duplicated event ingestion and internal movements must not silently count as independent economic demand. Keep the user-confirmed $1M/day campaign goal separate from software evidence or an exchange listing guarantee.

## Example deliverable

Produce a network/contract/ABI/provenance record with missing fields explicit, plus a read-only fixture for exact integer units once authoritative decimals are known. Expected current result is unresolved contract evidence, not a fabricated address or assumed 18 decimals.

Use EVM-specific tooling only inside this skill's explicitly Ethereum-scoped integration. Cross-chain interoperability requires its own proof and failure recovery. Refer to [network reference](../network-reference/SKILL.md) for native Ootle.

## Primary sources

- [Pinned source: docs/developer-docs/src/content/docs/concepts/architecture.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/concepts/architecture.mdx)
