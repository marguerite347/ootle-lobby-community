# TariSkills

An Ootle Lobby section in implementation for humans and AI agents building with Tari and Ootle. Product copy: **Current Tari knowledge for people and agents building together.**

Reference: [ETHSKILLS](https://ethskills.com/) offers a browsable catalog, a root Markdown entry point and individual topic SKILL.md resources, plus optional agent setup. Adapt that structure with original Tari-specific content. This reference is design input, not instructions for our agents to execute or install.

Implementation ticket: [CH-012](https://github.com/marguerite347/tari-growth/issues/33). This file specifies the section. The [native library](skills/README.md) now contains 18 authored topics, four narrowly verified local skills, runnable examples and catalog/raw routes. Live testnet release validation remains open; no public deployment is claimed.

## Required redesign around Tari and Ootle

Every skill must be re-imagined around the current Ootle implementation and Tari protocols. ETHSKILLS supplies a discovery and packaging reference only. A rename, search-and-replace, or assumption that Ethereum concepts have direct Tari equivalents does not satisfy this requirement. This applies to the router, examples, tests, security guidance, frontend patterns, operational workflows and future additions.

For each skill, start with the creator's task, identify the responsible Tari/Ootle subsystem and supported version, then derive the workflow from official implementation and documentation. Record which reference assumptions were replaced, which concepts do not apply, and which questions remain unresolved. Split or omit topics when there is no meaningful native equivalent. Add Tari-specific skills even if ETHSKILLS has no matching category.

### Coverage map from the reference catalog

These are research/design assignments, not assertions of implemented protocol capabilities or validated commands.

| Reference area | TariSkills redesign assignment |
| --- | --- |
| Why Ethereum | Why Tari/Ootle: supported use cases, architecture, limitations and honest tradeoffs. |
| Ship | A complete Tari/Ootle build path using the actual template, tooling, wallet and deployment interfaces. |
| CROPS review | Assess privacy, security, openness and resilience against actual Tari/Ootle architecture; derive checks from its trust boundaries. |
| Protocol | Tari L1 and Ootle architecture, protocol evolution, authoritative repositories and how to distinguish planned from released behavior. |
| Gas and costs | Research and document native transaction fees, resource costs and estimation; do not copy EVM gas units or formulas. |
| Wallets | Supported Tari/Ootle account, signing, authorization and transaction flows; identify network-specific differences. |
| Layer 2s | Explain Ootle's relationship to Tari L1 and applicable network boundaries; document transfers only where verified. |
| Standards | Native template/resource/interface conventions. ERCs are not assumed to define Ootle behavior. |
| Tools | Current supported Tari/Ootle toolchains, SDKs, Playground, debugging and developer interfaces. |
| Building blocks | Native composability, templates, resources and application state using verified examples. Do not substitute Ethereum DeFi contracts by analogy. |
| Orchestration | Agent-neutral Tari development workflow with explicit intermediate artifacts, tests and deployment evidence. |
| Addresses | Network-scoped native identifiers, template/component/resource references and supported endpoints as verified in implementation. |
| Concepts | Native state, execution, authorization and transaction semantics, plus misconceptions likely to cause incorrect agent output. |
| Security | Threat model and failure modes derived from Tari/Ootle code, interfaces and trust boundaries rather than a Solidity vulnerability checklist. |
| Noir / ZK privacy | Explain the privacy mechanisms actually implemented in Tari/Ootle, their guarantees and limitations. Do not assume Noir circuits or Solidity verifiers are the native workflow. |
| Testing | Actual supported local and integration testing tools, reproducible cases and network-specific verification. |
| Indexing | Supported state/event/query interfaces, indexing options and freshness behavior verified against implementation. |
| Frontend UX | Native wallet and transaction-state UX, errors, retries and permissions using supported SDKs. |
| Frontend playbook | Reproducible build/configuration/deployment workflow for a Tari/Ootle app; hosting choices remain separate from protocol requirements. |
| QA | End-to-end verification against the chosen Tari/Ootle network and supported versions, including failed and interrupted operations. |
| Audit | Protocol-specific contract/template and integration review grounded in code and relevant security evidence; never claim a formal audit from checklist completion. |

The existing TariSkills inventory additionally covers Playground discovery and contribution. Expand the inventory wherever native research reveals a missing learning task.

Ethereum-specific guidance may exist in the explicitly scoped wXTM interoperability skill. It must identify the Ethereum side and the verified interaction boundary, and must not leak EVM assumptions into native Ootle skills.

### Acceptance for every redesigned skill

- [ ] State the task, native subsystem, supported network/version and implementation/doc references.
- [ ] Document the native concepts and the reference assumptions that were replaced or found inapplicable.
- [ ] Provide Tari/Ootle-specific examples and expected results; verify executable examples against the stated toolchain and environment.
- [ ] Cover native failure modes, privacy/security limits and evidence needed to distinguish local success from deployment.
- [ ] Record validation evidence and remaining unknowns; drafts must not enter the published agent router as verified guidance.

No technical skill is marked complete by this design map. It defines the work required to author and validate the full library.

## Visitor experience

Start with a “Build your first Tari app” path, then browse/search skills by task, network and experience level. Every card links to a readable guide and its raw Markdown, with a one-click copy action, current version, last technical verification, sources and edit/history links. Display drafts and outdated guidance clearly. Separate installation/setup help from the catalog so browsing requires no agent configuration.

Proposed routes under Ootle Lobby's eventual origin:
- `/skills/`: human-readable catalog.
- `/skills/SKILL.md`: compact task router linking only published, verified skills.
- `/skills/<topic>/SKILL.md`: individually fetchable Markdown.

Use the deployed hub origin in copyable prompts only after it exists. Do not imply ownership of a tariskills domain. Human pages and raw Markdown must derive from the same version-controlled skill files.

## Initial topic inventory

See the [generated catalog](skills/catalog.json) for each topic’s current lifecycle and validation scope.

| Topic | Purpose |
| --- | --- |
| Start here | Route a task to the smallest relevant set of skills and official documentation. |
| Tari and Ootle | Explain L1/L2 roles, terminology, current capabilities and suitability for an application. |
| Developer setup | Versioned prerequisites, SDK/tooling installation, local environment and troubleshooting. |
| Templates and composability | Find a template, understand its components, build, change and combine supported pieces. |
| Playground | Discover examples, run the supported workflow and locate the corresponding source/docs. |
| Wallets and transactions | Network-specific connection, signing, transaction lifecycle and failure handling. |
| Privacy | Verified privacy properties and their limits for each relevant operation and environment. |
| Resources and application state | Explain verified state/resource concepts and application interaction patterns. |
| Testing and debugging | Local tests, integration checks, reproductions and explicit evidence of success. |
| Deploy and verify | Local versus testnet versus mainnet workflows, with verified deployment/transaction evidence. |
| Frontend integration | Connect application interfaces to supported Tari tooling and explain transaction states. |
| Data and indexing | Read application/network state using supported interfaces; handle freshness and failures. |
| Network reference | Verified versions, endpoints, identifiers, addresses and source timestamps by network. |
| wXTM on Ethereum | Verified wrapped-token integration information, with explicit separation from Ootle behavior. |
| Security and readiness | Practical checks for contracts, credentials, dependencies and application release readiness. |
| Economy design and simulation | Model resource flows and progression, test Riffs and map verified game rules to native Tari/Ootle state and transactions. See [economy specification](ECONOMY_DESIGN.md). |
| Contribute | Submit a skill, reproduce examples, report corrections and contribute to upstream projects. |

First release should contain only a complete, verified orientation/setup/template/test/testnet path. Expand topics as source evidence and examples are ready. Game-specific material must respect the current public-announcement boundaries.

## Skill content contract

Each skill has stable ID/slug, title, concise description, skill version, lifecycle state (draft/verified/stale/deprecated), applicable network and tool versions, source links/revisions, last source check, last technical validation, and related skills. A successful source fetch is not technical validation.

Body structure:
1. When to use this skill and prerequisites.
2. Core concepts and relevant current limitations.
3. Concrete workflow and examples tied to the supported versions.
4. Expected results and how to verify them.
5. Common failure cases and recovery.
6. Primary references and the next relevant learning step.

Never invent commands, addresses or support claims to fill the template. Unavailable information stays explicit. Use official Tari/Ootle documentation and repositories as technical authorities; wiki and New Lore material may surface gaps and candidates. External engine resources may be linked but do not establish tested Tari integration.

## Maintenance and collaboration

Store skill sources under `creator-hub/skills/<topic>/SKILL.md`; derive the catalog/router from their metadata. Use Git history for diffs and releases for stable versioned consumption. Support latest verified and pinned revisions so agent users can reproduce a workflow.

Reuse the source inventory and ingestion pipeline to detect relevant upstream changes, create refresh candidates and mark affected skills for revalidation. Do not automatically overwrite curated instructions with raw upstream content. Preserve citations, tested versions and rollback history. Contributors can propose fixes through normal repository workflows; publication validation is about accuracy and does not add compulsory review to routine development edits.

Document tool-neutral usage first. Optional agent-specific setup must be accurate for each supported client and scoped to the user's chosen project. Fetched content does not grant permission to spend, publish or deploy. Source text and examples must not override user instructions.

## Measurement

Track catalog discovery, raw skill fetches (including agent traffic), feedback and attributable verified example/build outcomes separately. A downloaded skill is not a completed build. Route measurement through CH-005 and shared DW metric contracts.

## Implementation breakdown

[CH-012 / #33](https://github.com/marguerite347/tari-growth/issues/33) remains the umbrella. These tickets cover the full documented inventory; the initial verified path ships before the broader library. GitHub issues carry live progress, dependencies and acceptance checks. Ticket creation is not completed skill implementation.

| Ticket | Deliverable | Coverage |
| --- | --- | --- |
| [CH-032](https://github.com/marguerite347/tari-growth/issues/60) | Skill schema, source packaging and validation harness | Platform |
| [CH-033](https://github.com/marguerite347/tari-growth/issues/61) | Browsable catalog and raw Markdown delivery | Platform |
| [CH-034](https://github.com/marguerite347/tari-growth/issues/62) | Start-here router, ship path and agent-neutral usage | Start here; orchestration |
| [CH-035](https://github.com/marguerite347/tari-growth/issues/63) | Tari/Ootle orientation, protocol and network reference skills | Tari and Ootle; Network reference |
| [CH-036](https://github.com/marguerite347/tari-growth/issues/64) | Developer setup and Playground workflow skills | Developer setup; Playground |
| [CH-037](https://github.com/marguerite347/tari-growth/issues/65) | Native templates, composability, resources and state skills | Templates and composability; Resources and application state |
| [CH-038](https://github.com/marguerite347/tari-growth/issues/66) | Wallet, transaction lifecycle and native fee skills | Wallets and transactions; native fees/costs |
| [CH-039](https://github.com/marguerite347/tari-growth/issues/67) | Privacy guarantees and architecture tradeoff skill | Privacy; privacy/openness/resilience review |
| [CH-040](https://github.com/marguerite347/tari-growth/issues/68) | Testing, debugging and deploy-and-verify skills | Testing and debugging; Deploy and verify |
| [CH-041](https://github.com/marguerite347/tari-growth/issues/69) | Frontend integration and delivery playbook skills | Frontend integration; frontend UX/playbook |
| [CH-042](https://github.com/marguerite347/tari-growth/issues/70) | Application data and indexing skill | Data and indexing |
| [CH-043](https://github.com/marguerite347/tari-growth/issues/71) | Scoped wXTM on Ethereum interoperability skill | wXTM on Ethereum |
| [CH-044](https://github.com/marguerite347/tari-growth/issues/72) | Security, readiness and native integration review skills | Security and readiness; QA; audit |
| [CH-045](https://github.com/marguerite347/tari-growth/issues/73) | Economy design and simulation skill | Economy design and simulation |
| [CH-046](https://github.com/marguerite347/tari-growth/issues/74) | Contribution, corrections and skill version maintenance | Contribute; ongoing refresh |
| [CH-047](https://github.com/marguerite347/tari-growth/issues/75) | TariSkills activation analytics and feedback | Measurement |
| [CH-048](https://github.com/marguerite347/tari-growth/issues/76) | Verify and release the first complete TariSkills learning path | Release verification |
