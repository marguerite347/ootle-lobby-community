---
name: tari-economy-simulation
description: Model game resource flows and test purchases before mapping economic actions onto Ootle. Use when designing game currencies, rewards, sinks or prices, or simulating an economy before any on-chain integration.
---

# Economy design and simulation

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Define the economy before token integration

List starting balances, reward sources, resource sinks, transfers, price rules, player policies and unit precision. A payment to another player's vault is a transfer, not destruction of supply. Keep soft currency, on-chain resources and Ethereum wrapped assets in separate ledgers unless a verified conversion exists.

There is no universal 1.2x progression rule or guaranteed ideal surplus. Treat scaling factors and spending policies as hypotheses. Compare cohorts and seeds; report distribution and failure rates as well as averages.

## Run the example

From this directory:

```sh
python3 ../examples/economy.py
python3 -m unittest discover -s ../examples -p 'test_economy.py'
```

The example runs an eight-round integer-currency model. Purchases are rejected if unaffordable, reroll prices increase within a shop and reset next round, and the ledger conserves starting currency plus generated units minus destroyed units. This is a deterministic illustrative policy, not observed player behavior or a recommendation for cash rewards.

## Map onto Ootle

Decide which actions must settle atomically as resource movement, which are pure game state, and which stay client-side. Use a native vault/bucket flow for an asset purchase rather than decrementing a frontend number. Test a rejected transaction before delivering an item off-chain. Keep economic simulation independent so balance iterations do not require network transactions.

## Verification and limits

Tests cover insufficient funds, invalid prices, rejected-action invariance and total conservation. They do not model liquidity, real player demand, sybil behavior or financial returns. Adding redeemable rewards or paid chance mechanics requires a separate product/legal assessment, not a claim that this simulation establishes eligibility. See [resources](../resources-state/SKILL.md).

## Primary sources

- [Pinned source: crates/template_lib/src/resource/builder/mod.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_lib/src/resource/builder/mod.rs)
- [Pinned source: docs/developer-docs/src/content/docs/guides/resources.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/resources.mdx)
