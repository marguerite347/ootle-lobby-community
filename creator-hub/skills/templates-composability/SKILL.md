---
name: tari-templates-composability
description: Author native Rust/WASM templates and connect component calls using verified interfaces. Use when writing or changing a template module, component constructor, method access rules or cross-component calls.
---

# Templates and composability

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Core model

A `#[template]` module exposes template functions and component methods. A constructor creates persistent component state with `Component::new(...).create()`. Publishing code does not itself instantiate every component or grant method access. The bundled Counter deliberately makes `value` public and denies other methods by default while preserving the component owner's authority.

## Work from the runnable example

Read [counter source](../examples/counter/src/lib.rs) and [engine tests](../examples/counter/tests/counter.rs). Change the increment rule and the expected state together, then run the locked test command in [setup](../developer-setup/SKILL.md).

For a composition:

1. Identify the called component and template ABI on the target network. Pin the component identity and expected interface.
2. Choose whether the transaction invokes both components or one template calls another through `ComponentManager`. Read the exact call argument encoding in the selected library version.
3. Pass resources using buckets and consume/deposit outputs. Do not emulate resource transfer by editing a display balance.
4. Test the combined operation, including a failing second call, unauthorized caller, wrong resource, and stale expected application state.

## Expected results

The example demonstrates state change, unauthorized rejection and public reads under the local engine. Cross-component composition needs its own executable test before being described as supported by this library. A shared template interface does not establish semantic compatibility between arbitrary community components.

## Failure modes and replaced assumptions

Do not paste Solidity calls, ERC allowances or EVM address casts into Rust templates. Methods with the same name may accept different encoded arguments. Authorization covers the component caller and proofs in scope; a successful call from the deployer's key does not demonstrate public access. Constructor address allocations support transaction composition, but use the actual ABI rather than assuming an allocation parameter exists. Continue with [resources](../resources-state/SKILL.md).

## Primary sources

- [Pinned source: crates/template_lib/src/component/manager.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_lib/src/component/manager.rs)
- [Pinned source: docs/developer-docs/src/content/docs/guides/template-overview.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/template-overview.mdx)
- [Pinned source: crates/template_test_tooling/src/template_test.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_test_tooling/src/template_test.rs)
