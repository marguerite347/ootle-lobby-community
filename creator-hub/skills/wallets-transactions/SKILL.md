---
name: tari-wallets-transactions
description: Integrate the Ootle wallet lifecycle, scoped credentials and terminal transaction outcomes. Use when calling a wallet daemon, building or submitting transactions, provisioning scoped credentials, or handling Pending, Accepted, Rejected and OnlyFeeAccepted outcomes.
---

# Wallets and transactions

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Before calling

Get the configured endpoint and verify its network/version. A browser wallet connection and a running daemon are different capabilities. Never assume `127.0.0.1:5100` is reachable because an extension is unlocked. Keep long-lived daemon API keys out of frontend bundles and logs; provision scoped credentials through the wallet's supported interactive flow.

## Native request contract

At the pinned source revision, `TransactionSubmitManifestRequest` contains `manifest`, string-valued `variables`, optional `seal_signer_key_id`, `signing_key_ids`, `max_fee`, `dry_run`, and `blobs`. Older guides show `signing_key_id`; check the implementation before copying it. Dry-run responses may contain `required_fees` and an execution result. A submitted transaction ID is not success.

`transactions.get_result` returns transaction ID, status and an optional finalize result. `transactions.wait_result` also reports `timed_out` and final fee. Handle the actual statuses: New, DryRun, DryRunFailed, Pending, Accepted, Rejected, InvalidTransaction, OnlyFeeAccepted.

## Workflow

1. Connect and read environment information.
2. Construct the operation and show its fee/resource effects in the app.
3. Simulate using the matched API where supported.
4. Submit within the user's authorized scope, preserving the transaction ID.
5. Poll that ID after a timeout instead of blindly resubmitting.
6. Require an accepted main result and the intended state change before granting the app-side outcome.

## Runnable boundary example

[transaction-state.mjs](../examples/transaction-state.mjs) implements conservative result classification for the pinned JSON result shape. Its tests include fee-only acceptance, missing result and timeout. These are offline fixtures, not a daemon integration test.

## Failure and privacy

Expired/revoked/out-of-scope credentials are access failures, not reasons to ask for a seed phrase. Use the correct credential mechanism; do not have users paste secrets into shared issues. A failed main intent may still pay fees. See [native fees](../native-fees/SKILL.md). Native signing and manifests are not MetaMask/EIP-1193 flows.

## Primary sources

- [Pinned source: clients/wallet_daemon_client/src/types.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/clients/wallet_daemon_client/src/types.rs)
- [Pinned source: crates/wallet/sdk/src/models/wallet_transaction.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/wallet/sdk/src/models/wallet_transaction.rs)
- [Pinned source: docs/developer-docs/src/content/docs/guides/agent-api-keys.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/agent-api-keys.mdx)
