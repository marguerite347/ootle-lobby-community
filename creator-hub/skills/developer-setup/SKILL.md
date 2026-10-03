---
name: tari-developer-setup
description: Build the pinned Tari template example and diagnose native toolchain mismatches. Use when setting up Rust/WASM tooling for Tari templates or when a template build fails on toolchain, target or dependency errors.
---

# Developer setup

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Prerequisites

Use a Rust toolchain supporting edition 2024, Cargo, a C/C++ build toolchain for native dependencies, and the `wasm32-unknown-unknown` target. The evidence file records the exact host/toolchain actually tested. Other operating systems remain untested until reproduced.

## Reproduce the local example

From this skill directory:

```sh
rustc --version
cargo --version
rustup target list --installed
# If absent, install the WASM compilation target:
rustup target add wasm32-unknown-unknown
cargo test --locked --manifest-path ../examples/counter/Cargo.toml
cargo build --locked --release --target wasm32-unknown-unknown --manifest-path ../examples/counter/Cargo.toml
```

Expected output is passing engine-backed tests and `../examples/counter/target/wasm32-unknown-unknown/release/tariskills_counter.wasm` when CARGO_TARGET_DIR is unset. No wallet or funded account is required for this local example.

## Starting another template

The official CLI guide documents the `tari-ootle-cli` package and its `tari` binary, with `create`, `add`, and `publish` commands. Check the installed binary's version and help before using them. Prefer copying the small pinned example for this validated path rather than silently installing the newest CLI and generating against a moving upstream branch.

## Failure recovery

Missing WASM target: install that target, then retry the same command. Dependency/API errors: inspect exact Cargo.lock and package versions; do not hide the problem with unlocked updates. Ootle 0.40-era Wasmer workarounds must not be applied blindly to this 0.41 example. Template-test compilation may take several minutes on a clean machine. Test output proving host Rust compilation alone is insufficient: inspect whether the WASM engine test executed.

This replaces an EVM toolchain setup with native Rust/WASM. Continue with [templates](../templates-composability/SKILL.md).

## Primary sources

- [Pinned source: crates/template_lib/Cargo.toml](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_lib/Cargo.toml)
- [Pinned source: crates/template_test_tooling/Cargo.toml](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/template_test_tooling/Cargo.toml)
- [Pinned source: docs/developer-docs/src/content/docs/guides/cli.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/cli.mdx)
