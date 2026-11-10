# Ootle network classification and launch-day check

Owner request, November 10, 2026: provide a near-top Mainnet section and distinguish deployed mainnet projects from testnet-only work, including newly discovered projects. The user named Veil (`explorer.tari.mw`), AT Protocol identity (`atproto.tari.mw`) and Skydrop (`skydrop.tari.mw`); all three already have catalog listings and media. Reuse those identities and recordings.

## November 11 target and recurring schedule

The existing consolidated daily automation starts at **08:00 America/New_York on November 11**, targeting a verified mainnet classification update by **09:00 Eastern**. This replaces that date's 09:00 run; do not create a second scheduler or same-day retry. After saving the November 11 date marker, use the Automations action to restore this same automation's usual daily 09:00 schedule, preserving its notification policy and other scope. If the launch-day run is missed, restore the ordinary cadence on recovery and record the missed target honestly. Local host availability and source access limit timing; no guaranteed cloud execution is implied.

## Sources and evidence

Enumerate all existing canonical project/tool records from the normal catalogs, current contests, community projects and held discovery queue, then read the current submission feeds and authorized announcement sources for new launches. Record an outcome for every project reviewed. Prioritize announced migrations, usable apps, wallets, explorers and reusable deployed components ahead of general tutorials. Tari L1 mainnet and Ootle mainnet are different networks; never place an L1 utility in this Ootle mainnet list solely because it says mainnet.

Check current creator announcements, original forum replies, app/network metadata and public mainnet deployment receipts where safely accessible. A launch date, countdown, planned migration, repository merge or still-responsive testnet URL is not evidence of a live mainnet deployment. Do not connect wallets, send funds or execute third-party software. Preserve the existing untrusted-content safety rules; use source text/metadata and approved read-only review methods. Record conflicts or inaccessible evidence as unconfirmed or held rather than promoting by assumption.

On November 10, Veil still showed tTARI and announced a mainnet switch. Its separate `testnet-explorer.tari.mw` destination was subsequently confirmed by the creator announcement and a trusted text read showing tTARI, receipts and recent transactions; use that hostname for Testnet links now. Its stated launch time differed from the latest first-party launch-config snapshot; this work does not modify the countdown or treat that announcement as deployment proof. AT Protocol's current guide identifies Esmeralda. Skydrop's creator thread says testnet-only; the app text extractor returned no content, so no fresh runtime reachability claim was made.

## Publish through existing identities

`content/network-status.json` is the reviewed network-status projection, not another project catalog. References resolve to existing ecosystem/September project IDs, `community:<slug>` or `<contest-id>:<slug>`. `NetworkProjects.tsx` reuses their titles, short summaries, attribution and detail destinations, including current `content/projects` overrides for September entries. Add new projects through the existing catalog/recording workflow before referencing them here. Never create a duplicate listing just to move one into Mainnet.

- `mainnet`: current Ootle mainnet deployment confirmed; requires `mainnetUrl` and `deploymentEvidence` containing a public URL, actual observation time and concise supporting fact.
- `testnet`: currently supported only by testnet evidence; requires `testnetUrl`. A future `mainnetPlan` does not change this state.
- `both`: mainnet and testnet destinations are available; requires both URLs and the same mainnet deployment evidence.
- `unconfirmed`: network/deployment cannot yet be established. It is excluded from both confirmed groups.

Every entry requires `checkedAt`, `evidenceUrl` and a factual evidence note. Preserve previous evidence privately on revisions. Update the existing card summary/status, destination and detailed source notes together when a project migrates; do not leave a mainnet card describing testnet-only behavior. Keep archived footage dated and accurate about the network it actually shows; record new footage if a material change makes it misleading. Documentation can accompany a deployed tool, but a guide alone does not establish a deployed mainnet project.

Run content/network validation and relevant tests, publish through the owner PR/merge workflow, deploy the exact merged SHA, and verify production network membership, URLs, nonduplicated identities, mobile layout and applicable media. Check the near-top Mainnet section, Testnet filter and any unconfirmed entries. Save the dated found/confirmed/testnet/held outcomes and production revision in the existing maintenance handoff. Keep network classifications current in subsequent daily runs alongside new project and creator submissions. Do not erase unfinished general maintenance to claim completion.
