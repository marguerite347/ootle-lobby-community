---
name: tari-network-reference
description: Resolve Ootle versions and network-scoped identifiers without borrowing tutorial addresses. Use when selecting an endpoint or network, interpreting component, resource or template addresses, or moving an app between environments.
---

# Network reference

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Task and inputs

Use whenever selecting an endpoint, interpreting an address or moving an app between environments. Require a network name, wallet/indexer versions, SDK versions and source of each address. `component_`, `resource_`, template identifiers and user-facing wallet addresses are different types. A versioned substate address is not interchangeable with an unversioned component identifier.

## Resolve the environment

- This library inspects Ootle development revision recorded in `../sources.json`; that source checkout identifies workspace 0.41.0 and template library 0.32.0. A development revision is not proof of a deployed release.
- The example pins released Rust crates and a Cargo.lock. Check the lock before reproducing; do not replace with latest silently.
- The official setup guide documents Esmeralda, the `esme` wallet flag, and a default local UI on port 5100. These are configuration defaults, not endpoints guaranteed to exist on the user's machine.
- Read `wallet.get_info` using the configured client; its response includes `version`, `network`, `network_byte`. Compare against the intended environment before composing a transaction.

## Example evidence record

Record network name, reported network byte, wallet version, indexer URL, package lock hash, template address, component address, and observation time in a project-local deployment record. Leave unknown fields null. Do not populate addresses from a guide's example output. No usable public deployment addresses ship in this library.

## Verification and failures

A syntactically valid address can still refer to the wrong network or an absent object. Read its ABI/state through the intended network and check the expected template before using it. For connection refused, first check whether the configured local daemon is running and listening on that port; browser-extension unlock does not start a wallet daemon. Do not expose a local wallet service to the internet to repair connectivity.

Native Ootle identifiers are not Ethereum 20-byte contract addresses or chain IDs. See [wXTM](../wxtm-ethereum/SKILL.md) for that separate environment.

## Primary sources

- [Pinned source: clients/wallet_daemon_client/src/types.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/clients/wallet_daemon_client/src/types.rs)
- [Pinned source: crates/common_types/src/substate_address.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/common_types/src/substate_address.rs)
- [Pinned source: docs/developer-docs/src/content/docs/guides/setup-a-wallet.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/setup-a-wallet.mdx)
