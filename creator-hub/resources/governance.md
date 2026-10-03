# Community governance and game balancing

## Private Ballot

[Private Ballot](https://github.com/GSXRspartan/private-ballot) by GSXRspartan is an independent desktop voting project with optional Tari Ootle anchoring. Indexed for education, community-app discovery and potential game-design workflows.

**Source check:** 2026-09-19, main revision `5f88f1892ff9c20af2fc55a0d756c22c76ed48af`. Repository not archived; latest observed push 2026-09-10. Documentation reviewed; no local execution, security audit or deployment verification performed.

Upstream describes an alpha for non-binding governance pilots on Esmeralda testnet. It uses Triptych-style eligibility proofs, Tor transport and independently verifiable offline archives. Optional organizer-side anchoring publishes aggregate evidence rather than individual votes; the archive remains authoritative. Privacy depends on transport and organizer practices. Upstream excludes binding governance, treasury, charter, employment and legal decisions. The project is independent of Tari Labs. Source license is MIT OR Apache-2.0, with separate third-party licenses.

- [Setup and prerequisites](https://github.com/GSXRspartan/private-ballot/blob/main/docs/OPERATOR_SETUP.md)
- [Security guidance](https://github.com/GSXRspartan/private-ballot/blob/main/SECURITY.md)
- [Archive verifier](https://github.com/GSXRspartan/private-ballot/blob/main/docs/INDEPENDENT_VECTOR_VERIFIER.md)
- [Ootle anchor template and runbook](https://github.com/GSXRspartan/private-ballot/tree/main/templates/ootle-anchor-event-template-v2)
- [Releases](https://github.com/GSXRspartan/private-ballot/releases) and [license](https://github.com/GSXRspartan/private-ballot/blob/main/LICENSE)

## Proposed creator uses

These are our proposed applications, not verified features or deployed integrations:

- Poll a community on game asset stats and proposed balance changes.
- Compare game-design alternatives and select changes for a playtest.
- Gather preferences on decentralized project priorities and community direction.
- Explore private participation and verifiable outcomes through a non-binding pilot.

Example learning recipe: define several versioned stat configurations, explain their tradeoffs using the [economy/balancing tools](../ECONOMY_DESIGN.md), run a pilot ballot, verify its result, then submit the preferred configuration for a reviewed playtest. Link the resulting configuration back to its [template version](../TEMPLATE_MARKETPLACE.md). Ballot results do not automatically alter released game assets, execute contracts or establish technical network consensus.

## Maintenance and integration follow-up

Keep the canonical repository URL as the resource identity; follow README, releases, operator guidance, security notices and anchor-template changes. Record source revisions and separate upstream claims from tests performed by hub contributors. Inventory work belongs with [CH-001](https://github.com/marguerite347/tari-growth/issues/21); source refresh design belongs with [CH-006](https://github.com/marguerite347/tari-growth/issues/27).

Before advertising a working recipe, validate a reproducible pilot, current Ootle/network prerequisites, the eligibility and privacy model, archive verification and the explicit handoff from a result to a proposed configuration change. No hosted ballot service, automatic configuration executor or governance integration is implemented by this resource addition.
