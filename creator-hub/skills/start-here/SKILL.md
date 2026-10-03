---
name: tari-start-here
description: Choose a minimal Tari/Ootle learning path and distinguish local execution from network deployment. Use when starting any native Tari/Ootle project or when unsure which TariSkills topic applies.
---

# Start here

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

Use this library when building a native Ootle application or reviewing its integration. For engine-only work use the separate game-development catalog. Read the task's repository instructions first.

## Choose a path

- First template: [orientation](../tari-and-ootle/SKILL.md) → [setup](../developer-setup/SKILL.md) → [templates](../templates-composability/SKILL.md) → [testing](../testing-debugging/SKILL.md) → [deployment](../deploy-verify/SKILL.md).
- App connection: [wallets](../wallets-transactions/SKILL.md), [fees](../native-fees/SKILL.md), [frontend](../frontend-integration/SKILL.md).
- Asset mechanics: [state/resources](../resources-state/SKILL.md), [privacy](../privacy/SKILL.md), [economy](../economy-simulation/SKILL.md).
- Existing network data: [network reference](../network-reference/SKILL.md), [indexing](../data-indexing/SKILL.md).
- Ethereum wrapped assets: [wXTM](../wxtm-ethereum/SKILL.md), explicitly outside native Ootle execution.

## Working agreement

Read each topic's metadata before relying on it. `draft` is researched working guidance, not a validated release. `verified` applies only to its recorded validation scope and version. The generated root router lists verified topics only. This authored start page describes the intended full path, including unfinished network validation.

Make a small change and produce a repeatable test before adding UI or asset complexity. Keep the deliverables separate: source, compiled WASM, engine tests, network receipt, observed state, and deployment URL. A source URL or template hash copied from a tutorial proves none of the later stages.

## Example and expected result

Ask the agent to run the bundled counter locally, change the increment from 1 to 2, update the assertion, and run it again. Expected: an owner can change state, an unrelated signer cannot, and read access remains public. Do not submit a network transaction to satisfy this local task.

## Reference assumptions replaced

There is no Hardhat/Foundry requirement or Solidity deployment address here. The native path uses Rust templates, WASM, components and Ootle transactions. The official upstream agent guides are useful inputs but their example versions and request fields must be checked against the pinned implementation.

## Primary sources

- [Pinned source: docs/skills/README.md](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/skills/README.md)
