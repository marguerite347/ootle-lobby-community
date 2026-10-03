---
name: tariskills
description: Route native Tari/Ootle tasks to locally validated skills with explicit scope and source versions. Use when building or reviewing native Tari/Ootle templates, wallets, transactions or protocol integrations; read start-here and catalog.json for draft topics.
---

# TariSkills

Current Tari knowledge for people and agents building together.

Only verified entries appear here. Verification is limited to the stated scope; local engine tests do not establish testnet deployment. For researched drafts and outstanding network checks see [the catalog](catalog.json). Keep the directory layout when installing.

- [Developer setup](developer-setup/SKILL.md): Locked local Rust/WASM setup on the recorded macOS host; no wallet setup validated.
- [Economy design and simulation](economy-simulation/SKILL.md): Offline integer-ledger simulation and four conservation/input tests; no on-chain settlement or economic forecast.
- [Templates and composability](templates-composability/SKILL.md): Counter component construction, owner write/public read, unrelated-signer rejection and rollback in the local engine. Cross-component/resource workflows remain untested.
- [Testing and debugging](testing-debugging/SKILL.md): Two real WASM engine tests on pinned 0.32.0/0.41.0 dependencies; no live-network claims.
