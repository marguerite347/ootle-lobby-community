---
name: tari-frontend-integration
description: Connect a game UI to native Ootle wallet and transaction states without exposing daemon credentials. Use when wiring a browser or game frontend to an Ootle wallet, showing transaction status, or deciding where wallet credentials live.
---

# Frontend integration

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Boundaries

Keep rendering/input loops separate from authoritative state changes. A connected wallet permits interaction, not an automatic purchase. Browser wallet/provider integrations and a server-held daemon API key are different deployment choices. Never put a daemon secret in Vite environment variables delivered to the client.

## Integration workflow

1. Pin the chosen Tari TypeScript package versions and preserve the lockfile. The official wasm-template starter demonstrates package choices, but a range in its package.json is not proof that every newer release works.
2. Show disconnected, wrong-network, awaiting user action, pending, accepted, rejected, fee-only failure and unknown/timeout states.
3. Preserve transaction IDs across reloads within the appropriate user session. Reconcile them with the wallet/indexer rather than replaying purchases.
4. On accepted main execution, refresh the authoritative resource/state that the UI displays. Optimistic animation may run earlier, but label it pending.
5. Clear account-specific caches when account/network changes. Do not display a previous account's balances during reconnect.

## Runnable example

Use [transaction-state.mjs](../examples/transaction-state.mjs) as a small outcome adapter and run its tests. It requires both an accepted status and an accepted finalize result before it returns success. It is not a full browser wallet connector; validate the actual SDK adapter separately.

## Delivery checks

Test wallet rejection, lost connection after submit, refresh while pending, fee-only acceptance and stale indexer data. Check mobile layouts and readable error recovery. Keep hosting URL, wallet endpoint and network config distinct. Do not make a remotely hosted browser app depend on your laptop's localhost endpoint.

No EIP-1193 provider, Ethereum account format or token approval workflow is assumed. Use [wallets](../wallets-transactions/SKILL.md) and [indexing](../data-indexing/SKILL.md) for the native contracts.

## Primary sources

- [Pinned source: clients/wallet_daemon_client/src/types.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/clients/wallet_daemon_client/src/types.rs)
- [Pinned source: crates/wallet/sdk/src/models/wallet_transaction.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/wallet/sdk/src/models/wallet_transaction.rs)
