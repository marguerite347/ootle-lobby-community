---
name: tari-testing-debugging
description: Run real Ootle template-engine tests and test authorization without injected privileges. Use when writing or running TemplateTest engine tests, debugging template failures, or proving access-rule behavior locally.
---

# Testing and debugging

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Local engine workflow

Run `cargo test --locked --manifest-path ../examples/counter/Cargo.toml` from this directory. `TemplateTest` compiles WASM and executes it in the engine. Its convenience `call_function` takes a template name string in the pinned version; the transaction builder's call takes a resolved template address. Confusing those APIs causes a compile error.

Read [the test](../examples/counter/tests/counter.rs). It creates an instance, reads zero, increments as the creating signer, then attempts an unrelated signer's write. The expected state remains unchanged after rejection. Explicit virtual proofs supplied to the harness can bypass the very boundary being tested. Use genuine distinct signer keys with an empty initial proof list for that authorization test.

## Expand with meaningful cases

- Success: verify resulting state, not only absence of panic.
- Authorization: owner, unrelated signer, and intended public reader.
- Atomicity: perform a valid first mutation and failing later instruction; read state afterward.
- Resources: wrong type, insufficient units and unconsumed outputs.
- Fees: enable fees explicitly when testing fee behavior; fee-free defaults cannot prove it.
- Frontend: timeout and fee-only acceptance never grant a reward.

## Reproduce failures

Record exact command, compiler, dependency lock, template binary hash, test name and sanitized error. Keep the smallest failing transaction. Native unit tests and local WASM tests cannot establish testnet endpoint availability, indexer freshness or a wallet's connection UX.

The [evidence record](../evidence/validation.json) states what actually ran. No Foundry cheat codes or EVM gas assertions are assumed. Continue with [deployment](../deploy-verify/SKILL.md) only after the local behavior is established.

## Primary sources

- [Pinned source: crates/template_test_tooling/src/template_test.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_test_tooling/src/template_test.rs)
- [Pinned source: docs/developer-docs/src/content/docs/guides/testing-templates.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/testing-templates.mdx)
