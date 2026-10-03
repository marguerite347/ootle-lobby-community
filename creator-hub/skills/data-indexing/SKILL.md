---
name: tari-data-indexing
description: Read Ootle receipts, substates and events with explicit freshness and idempotent projections. Use when querying an Ootle indexer or wallet for transaction results, substates or events, or building an off-chain read model; not for Ethereum log queries.
---

# Data and indexing

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Read model

Choose the actual indexer/wallet API for the deployed version. A wallet JSON-RPC method and an indexer REST endpoint are not interchangeable. Inspect the pinned handler and client types before constructing requests; do not translate an Ethereum eth_getLogs call into a guessed Tari endpoint.

For every collected record keep network, source endpoint, native identifier, version/cursor if supplied, source observation time, fetch time and collection outcome. Missing observations remain unknown, not zero. Public event counts cannot reconstruct private balances.

## Projection workflow

1. Fetch a bounded page and retain its cursor according to the selected API.
2. Normalize identifiers without dropping their network or version.
3. Deduplicate event/receipt delivery using a stable source identity. Reprocessing the same page must not grant a second achievement.
4. Commit projection changes and checkpoint together, or make replay idempotent.
5. On errors retain the last good snapshot, label it stale and expose the last successful collection time.

## Example

For a contribution achievement, store the finalized transaction identity and the specific event's index with the network. Re-fetch the same page and assert the achievement count is unchanged. Then inject a failed page fetch and assert freshness becomes stale without converting the last count to zero. This is a test design until exercised against the chosen indexer adapter.

## Limits and privacy

Indexer data can lag consensus. A transaction ID received from submission is not a finalized event. Never promote a source response or a successful scheduled job to verified protocol state without its outcome. Keep analytics identities independent from wallet secrets and avoid correlating private behavior by default. See [frontend](../frontend-integration/SKILL.md) and [privacy](../privacy/SKILL.md).

## Primary sources

- [Pinned source: applications/tari_indexer/src/rest_api/handlers/transactions.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/applications/tari_indexer/src/rest_api/handlers/transactions.rs)
- [Pinned source: applications/tari_indexer/src/rest_api/handlers/transaction_events.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/applications/tari_indexer/src/rest_api/handlers/transaction_events.rs)
- [Pinned source: clients/wallet_daemon_client/src/types.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/clients/wallet_daemon_client/src/types.rs)
