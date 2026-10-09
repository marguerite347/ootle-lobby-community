# Lobby security remediation

Source baseline: b241b9b, public marguerite347/ootle-lobby-community/main. Supplied audit is evidence to verify, not permission to override the owner's open-contributor policy. The policy decision for both repositories is pending an explicit answer.

Selection receipt: reuse Express's existing public entry-point middleware, Node HTTP fixtures, committed content validators, pinned skill bundles, npm lockfiles, Vite build and existing Vercel deployment. Baseline trial: all 19 root tests and content/integration-gap validation passed. No new database is necessary to close inactive public write surfaces; the audit explicitly permits read-only operation until durable authenticated services exist. The supplied external security-analysis guide returns 404 through both web and authenticated GitHub lookup.

## Tasks and acceptance

- [ ] L1 Critical enrollment/repo controls: resolve conflict with owner's current access policy; inspect actual enrollment, collaborators, branch protections and deployment connection. Do not revoke an existing contributor based only on a finding in an attachment.
- [x] L2 Feed integrity: use deployment-bundled approved content by default; any remote refresh must match configured revision and digest. Field-specific host allowlists and visible external destinations. Prove changed/unpinned content is rejected.
- [x] L3 Public write boundary: allow only bounded stateless exports and reviewed bundled downloads; all persistent anonymous writes fail before body parsing. Cover chat, reports, rooms, skills/profiles, learning, engagement, analytics and unused Workbench/trivia routes through public HTTP tests.
- [x] L4 State/abuse: public chat/community writes read-only until shared durable authenticated storage exists. Disable unused trivia server endpoint and production reset; preserve the actual browser practice game. No GET creates Blob records. No public outbound HF drafting/search or private growth data. Explain capabilities in UI.
- [ ] L5 Links/headers: HTTPS external URLs, escaped blog slugs, CSP/HSTS/frame/referrer/nosniff headers, no Express banner. Verify server and static responses and real desktop/mobile app with CSP.
- [x] L6 Dependencies/build: align root and server Express, update Vite/Vitest and Remotion, lifecycle-disabled installs, exact lockfile audits and tests. Report remaining advisories without suppressing them.
- [x] L7 Smaller findings: generic errors, constant-time skill-key comparison, cryptographic client IDs, used contest content hashes, explicit credential variables, truthful monitoring state, safe Git ref and local Host validation.
- [ ] L8 Delivery: final tests/build, exact revision/checksums, reviewed deployment and live browser/API acceptance. No Git auto-deploy connection before access policy is settled. Secret names/scopes only, never secret values in reports.

This list is in progress. Read-only public surfaces are containment, not a claim that legacy local storage gained identity, durable moderation or retention. Existing Blob data must not be deleted without a reviewed retention/migration decision.

## Validation checkpoint

Root regression suite: 25 passed. Required server suite: 48 passed, including cross-instance trivia conditional writes, origin checks and public containment. Full client suite: 164 passed in 45 files. Production TypeScript/Vite build passed. Video tooling: 17 tests plus TypeScript passed after updating all Remotion packages to 4.0.534. Fresh root, Hub and video npm audits each report zero vulnerabilities (raw JSON alongside this report). Counts are registry matches, not claims of comprehensive exploit absence.

The Mac rejected the new native Rollup loader; use the official platform-independent @rollup/wasm-node 4.63.4 drop-in (https://rollupjs.org/migration/). Its real Vite build and Vitest suite passed. A newly installed esbuild executable was also stopped by macOS. For local validation only, ESBUILD_BINARY_PATH pointed to a preinstalled 0.25.12 executable after exact SHA-256 equality with the locked package. Linux CI uses the normal clean install; no OS security setting was changed. A stale mixed-major npm install was replaced with a clean resolver run, leaving one consistent Vite 6.4.4 tree.

Public skill delivery is limited to 196 committed file sets, each verified against shared/reviewedSkills.json. One inherited Hugging Face bundle refers to a missing .env.example; it is excluded from the public library instead of serving an incomplete ZIP. This manifest binds bytes from the existing published library, not a new claim that every third-party instruction is safe or technically validated. Runtime-authored lessons/profiles never enter the public index.

Access observations: ENROLLMENT_OPEN remains true; the Lobby collaborator API currently lists only marguerite347. Existing main branch protection blocks force-push/deletion but has no required checks/reviews. Vercel project link is null (no Git auto-deploy). Only a Blob credential is configured; no growth/provider/subscription credential is configured. Values were not printed or written to the repo. The owner policy choice remains pending.

Chrome verification is currently blocked by the extension's local service failing to start. No rendered desktop/mobile acceptance is claimed at this checkpoint. Build, test and HTTP results do not substitute for that acceptance.


## Finding disposition

| Audit item | Implementation / remaining boundary |
| --- | --- |
| Critical 1, enrollment and review | Owner decision pending. No access controller or collaborator changes; no Vercel Git connection. Open GitHub write policy remains a material integrity risk. |
| High 2, mutable feed | Deployment snapshot by default; optional revision plus digest pin; field-specific URL hosts; visible destinations. |
| High 3, anonymous agent instructions | Persistent writes denied, runtime-authored listings excluded, complete bundled file sets verified by digest; official profile names reserved. Enrollment documentation remains unchanged pending the policy decision. |
| Medium 4, limits | Trusted Vercel proxy configured. Public write/provider surfaces closed, so they do not rely on per-instance rate limits. Durable rate limiting remains a prerequisite to reopening them. |
| Medium 5, Blob churn | Public trivia disabled; GET never registers; first POST/start registers only in retained local/test service. Global quota and TTL sweep are not implemented and are required before reopening. Existing records are untouched. |
| Medium 6, Sybil moderation | Reports, room creation and moderation writes disabled publicly. Server identities, moderation queue/restore and actor audit records remain prerequisites to reopening chat. |
| Medium 7, temporary state | Audit's read-only option implemented. No claim of a durable community database. Source monitoring already reports disabled when no schedule is running. |
| Medium 8, unbounded writes | Default-deny mutation boundary, with bounded stateless validation/exports and digest-bound downloads only. Unknown future writes are denied too. |
| Medium 9, private growth | Public API and export path disabled; hosting has no growth credential. |
| Medium 10, Remotion | Updated together to 4.0.534; tests/typecheck and fresh audit pass. |
| Medium 11, reset farming | Production reset flag removed and public server trivia closed; browser game remains explicitly practice only. No financial awards are connected. |
| Headers / links / blog | CSP, same-origin frame restrictions, HSTS, no-referrer, nosniff and removed Express banner; strict slugs and safe URL handling. Exact script hashes support reviewed import maps and the settings-only guessing preview. Arbitrary saved HTML games require local execution. |
| Dependency mismatch / dev advisories | Runtime Express aligned to 4.22.3; Vite/Vitest and associated dependencies updated; clean lockfiles and lifecycle-disabled installs. |
| Raw errors / anonymous outbound calls | Generic public errors; HF reads/drafts and Workbench mutations rejected before body parsing/provider work. |
| Blob bearer identifiers / staff / comparison | Hashed Blob keys; public staff impersonation/mutation surface closed; reserved official profile names; constant-time skill key comparison. Moderation history is not newly implemented. |
| Contest hash / env alias / decoding / IDs | Content hash participates in review decision; removed Github alias, documented local HF model variable; canonical write route checks; crypto.randomUUID client identifiers. |
| Self-hosted Git / Host | HEAD or hexadecimal revision only before git invocation; local Host allowlist. |

Full server sweep: 270/278 passed. The eight failures reproduce on the application-identical baseline (52cf568; b241b9b changes only contribution docs): missing private growth/calendar fixtures, missing Hugging Face .env.example bundle file, stale endpoint contract and preview expectations. They are recorded as pre-existing failures, not suppressed. Required server checks pass. Capture tooling adds four passing tests.

The Blob credential was verified as Production-only. Builds record exact revision and SHA-256 package hashes; CI audits root, Hub and Remotion and runs the full client suite. Integrity artifacts are uploaded only for non-PR runs with revision-specific names. Build hashes establish package identity, not provenance against a malicious repository writer.
