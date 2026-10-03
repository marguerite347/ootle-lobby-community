---
name: tari-deploy-verify
description: Publish a tested Ootle WASM artifact and verify its template, component and transaction evidence. Use when publishing a template to an Ootle network or checking deployment evidence; requires explicit authorization for the network write.
---

# Deploy and verify

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Preconditions

Require a passing locked local test run, compiled WASM hash, intended network, configured wallet, funded fee account and authorization for the network write. This library contains no deployment address and does not infer mainnet readiness from testnet success.

## Publication path

Build using the command in [setup](../developer-setup/SKILL.md). The official wallet UI workflow selects a fee account, uploads the WASM, estimates a fee and publishes. Recheck the selected network and the binary before submitting. An installed CLI can publish too, but match its version/configuration and inspect help rather than copying an untested command with guessed flags.

After submission, retain the transaction ID and inspect the terminal main result. Retrieve the published template on the same network and inspect its ABI. Instantiate a component through the supported wallet/SDK flow, retain that transaction ID, then perform a known method call and read the resulting state. Publication and instantiation are separate evidence.

## Deployment receipt

Record artifact SHA-256, template address, component address, network, wallet/indexer versions, publish/instantiate/call transaction IDs, terminal outcomes and verification time. Do not store credentials or wallet secrets. Use null for anything missing. A browser URL and source commit can accompany this record but cannot replace it.

## Failure recovery

If a submission times out, query the existing transaction before retrying. If the main intent fails but fees commit, report that separately. If an indexer cannot yet see a template, distinguish stale indexing from rejection. Do not promote the workflow to verified while that evidence is absent.

This skill is an actionable source-reviewed testnet runbook; network execution remains outstanding. It replaces EVM deployment assumptions with native template publication and component instantiation. See [network reference](../network-reference/SKILL.md).

## Primary sources

- [Pinned source: docs/developer-docs/src/content/docs/guides/publishing-templates.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/publishing-templates.mdx)
- [Pinned source: clients/wallet_daemon_client/src/types.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/clients/wallet_daemon_client/src/types.rs)
