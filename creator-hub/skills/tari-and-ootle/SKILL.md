---
name: tari-tari-and-ootle
description: Explain native Tari layer roles and choose a suitable application boundary. Use when deciding what runs on Ootle versus off-chain, or explaining validators, indexers, wallet daemons and the base layer.
---

# Tari and Ootle

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Task and subsystem

Use this before designing an application boundary. In the inspected Ootle implementation, validators execute transactions and participate in consensus; indexers serve queries; the wallet daemon manages signing and submits through an indexer. Base-layer information supplies validator registration/epoch data. An indexer response is a view of consensus state, not independent finality.

A template is published code. A component is a persistent instance of that code. Resources define assets; vaults hold them; buckets move them during execution. Components with public state do not become private merely by running on Ootle.

## Design workflow

1. List state that must be authoritative, such as resource ownership or an achievement claim. Separate rendering, input and audio from those transitions.
2. Identify the template/component/resource types needed. Treat cross-component calls as protocol interactions, not HTTP calls from a contract.
3. Record network and package versions from the [network reference](../network-reference/SKILL.md).
4. Test the smallest state change with [templates](../templates-composability/SKILL.md). Add external services only when the app actually needs them.

## Example and expected result

A creator's game displays an achievement locally, while an Ootle component enforces whether a claim may change its state. Draw the client, wallet, indexer and validator boundaries. The diagram should identify who signs, who executes, and which displayed fields are merely cached. A browser animation must never be the proof that an on-chain reward was delivered.

## Limits and recovery

This source review does not certify throughput, production readiness or privacy for any deployed network. If documentation and a running node differ, record its version and reproduce the difference before choosing an API. Do not describe Ootle as an EVM rollup or infer ERC semantics from the phrase L2. Consult [privacy](../privacy/SKILL.md) before making confidentiality claims.

## Primary sources

- [Pinned source: docs/developer-docs/src/content/docs/concepts/architecture.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/concepts/architecture.mdx)
- [Pinned source: docs/developer-docs/src/content/docs/concepts/state-and-execution.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/concepts/state-and-execution.mdx)
