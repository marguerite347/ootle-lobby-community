---
name: tari-privacy
description: Assess which Tari/Ootle application data remains visible and which native privacy mechanism applies. Use when handling amounts, ownership, transaction arguments, analytics or other data that users may expect to be private, or when choosing confidential or stealth resources.
---

# Privacy boundaries

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Start with a disclosure map

List the datum, who supplies it, where it is stored, which parties can observe it and the mechanism meant to protect it. Include amounts, ownership, component fields, transaction arguments, fees, events, logs, IP metadata, timing and analytics identifiers.

The inspected documentation distinguishes confidential amounts in vaults from stealth outputs using one-time ownership addresses. These primitives do not make arbitrary application execution or ordinary component state secret. Interaction with public components and external services can link activity even if a transfer uses a private asset representation.

## Apply to a game

A hidden answer, deck order or player identity must not be written into public component fields or event metadata on the assumption that the L2 encrypts everything. Evaluate an application-specific protocol before collecting stakes or promising secrecy. A commitment/reveal design requires tests for non-reveal, replay, predictable inputs and timing; naming a field `commitment` does not prove privacy.

Review wallet/client telemetry as part of the boundary. Never put a viewing key, secret seed, proof witness or full private payload into analytics. Separate voluntary public achievement sharing from private transaction data.

## Expected artifact

Produce a table for each action: public fields, concealed fields, trusted parties, linking risks, and test evidence. Example: the bundled Counter value is public and the skill makes no claim that it hides player behavior. Demonstrate public readability as the control case.

## Limits and replacements

This is a source-grounded threat-model workflow, not a cryptographic audit. No Noir circuit, Solidity verifier or universal ZK-rollup privacy guarantee is assumed. Changes to resource type alone do not establish end-to-end anonymity. Privacy claims stay draft until the concrete flow and disclosure surface are reviewed and exercised. See [security](../security-readiness/SKILL.md).

## Primary sources

- [Pinned source: docs/developer-docs/src/content/docs/concepts/privacy.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/concepts/privacy.mdx)
- [Pinned source: docs/developer-docs/src/content/docs/concepts/privacy-in-applications.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/concepts/privacy-in-applications.mdx)
- [Pinned source: crates/wallet/crypto/src/kdfs.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/wallet/crypto/src/kdfs.rs)
