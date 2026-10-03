---
name: tari-native-fees
description: Explain Ootle fee intent, main intent and fee-only acceptance without EVM gas assumptions. Use when estimating or explaining transaction fees, handling AcceptFeeRejectRest or OnlyFeeAccepted results, or writing fee-related UI copy.
---

# Native fees and costs

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Native fee boundary

Ootle executes fee instructions before main instructions. A fee checkpoint can survive a later main-intent failure. The result `AcceptFeeRejectRest` and wallet status `OnlyFeeAccepted` mean the user paid for work without the intended application change succeeding. Do not label that result successful, or promise a failed transaction costs nothing.

The inspected fee documentation denominates amounts in microtari, with 1 TARI equal to 1,000,000 base units. Metering includes computation, storage and other native charges. Do not reuse Ethereum gas prices, gas limits or gwei calculations.

## Estimate and display

Obtain the estimate from the configured wallet/network for the exact transaction. Record estimate time, network, fee payer and max fee. Do not hard-code the sample fee from the publishing guide. Keep integer amounts exact through JSON and UI formatting; choose the supported string/BigInt representation for values beyond JavaScript safe integers.

Explain fee-only acceptance distinctly. After a timeout reconcile the same transaction before a retry. If payment comes from a bucket, inspect refund semantics rather than assuming the same behavior as account/vault fee payment.

## Example and expected result

Run the offline [transaction-state tests](../examples/transaction-state.test.mjs). A fee-only finalize result must return failure with `feeMayBeCharged: true`; it must not trigger a reward. Then add engine tests with fees enabled when validating a real application. Default fee-free TemplateTest execution does not validate fee estimates or checkpoint behavior.

## Remaining validation

The fee lifecycle is source-reviewed; this library has no funded-network fee receipt. Parameter values can change with network versions. Read the current pinned fee implementation and attach a sanitized receipt before asserting live costs. Continue with [deploy and verify](../deploy-verify/SKILL.md).

## Primary sources

- [Pinned source: docs/developer-docs/src/content/docs/reference/fees.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/reference/fees.mdx)
- [Pinned source: crates/engine_types/src/commit_result.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/engine_types/src/commit_result.rs)
