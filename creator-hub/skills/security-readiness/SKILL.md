---
name: tari-security-readiness
description: Review Ootle templates and integrations against native authorization, fee and privacy boundaries. Use before release or when reviewing a template or integration change for access rules, owner authority, fee handling and data exposure.
---

# Security and readiness

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Review the actual change

Identify the template revision, library/engine versions, network, exposed functions, components, resource actions and off-chain services. Trace who may call each method and who can update its access rule. Include owner authority even when a default method rule denies public access.

## Native checks

- Authorization: unrelated signer tests with no injected owner proof; public read methods do not expose unintended state.
- Resources: correct resource identity, integer bounds, conservation, bucket consumption, mint/burn privileges and recall/freeze powers.
- Composition: verify called component and ABI; rejected downstream calls do not grant off-chain effects.
- Fees: distinguish rejected main intent from fee-only acceptance; apply the intended fee ceiling.
- Client: no daemon secrets in browser assets; retries reconcile existing transaction IDs.
- Privacy: public fields/events/telemetry never contain the values the app promises to hide.
- Dependencies: record lockfile and artifact hash; generated template code and external engine assets have separate licenses.

## Example evidence

The [counter test](../examples/counter/tests/counter.rs) exercises a genuine second signer and verifies state after rejection. Add tests for the application's own resource and composability boundaries rather than treating that one example as coverage of every contract.

## Triage and output

Report a concrete trigger, affected code, impact and reproducible test for each finding. State what was not tested, especially network behavior, privacy proof construction and operational key custody. Separate a local prototype, a tested release and a formal independent audit. Passing this checklist does not constitute the last of those.

This replaces a generic Solidity vulnerability checklist with the native Ootle execution/authorization model. Continue with [testing](../testing-debugging/SKILL.md) and [deployment](../deploy-verify/SKILL.md).

## Primary sources

- [Pinned source: docs/developer-docs/src/content/docs/guides/authorization-and-access.mdx](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/developer-docs/src/content/docs/guides/authorization-and-access.mdx)
- [Pinned source: crates/engine_types/src/commit_result.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/engine_types/src/commit_result.rs)
- [Pinned source: crates/engine/tests/templates/access_rules/src/lib.rs](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/crates/engine/tests/templates/access_rules/src/lib.rs)
