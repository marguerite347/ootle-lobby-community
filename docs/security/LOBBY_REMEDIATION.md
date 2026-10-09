# Lobby security remediation

Source baseline: b241b9b, public marguerite347/ootle-lobby-community/main. Supplied audit is evidence to verify, not permission to override the owner's open-contributor policy. On 2026-10-09 the owner explicitly approved closing enrollment, enforcing review/checks in both repos, retrying visual checks and deploying Lobby to production.

Selection receipt: reuse Express's existing public entry-point middleware, Node HTTP fixtures, committed content validators, pinned skill bundles, npm lockfiles, Vite build and existing Vercel deployment. Baseline trial: all 19 root tests and content/integration-gap validation passed. No new database is necessary to close inactive public write surfaces; the audit explicitly permits read-only operation until durable authenticated services exist. The supplied external security-analysis guide returns 404 through both web and authenticated GitHub lookup.

## Tasks and acceptance

- [x] L1 Critical enrollment/repo controls: resolve conflict with owner's current access policy; inspect actual enrollment, collaborators, branch protections and deployment connection. Do not revoke an existing contributor based only on a finding in an attachment.
- [x] L2 Feed integrity: use deployment-bundled approved content by default; any remote refresh must match configured revision and digest. Field-specific host allowlists and visible external destinations. Prove changed/unpinned content is rejected.
- [x] L3 Public write boundary: allow only bounded stateless exports and reviewed bundled downloads; all persistent anonymous writes fail before body parsing. Cover chat, reports, rooms, skills/profiles, learning, engagement, analytics and unused Workbench/trivia routes through public HTTP tests.
- [x] L4 State/abuse: public chat/community writes read-only until shared durable authenticated storage exists. Disable unused trivia server endpoint and production reset; preserve the actual browser practice game. No GET creates Blob records. No public outbound HF drafting/search or private growth data. Explain capabilities in UI.
- [x] L5 Links/headers: HTTPS external URLs, escaped blog slugs, CSP/HSTS/frame/referrer/nosniff headers, no Express banner. Verify server and static responses and real desktop/mobile app with CSP.
- [x] L6 Dependencies/build: align root and server Express, update Vite/Vitest and Remotion, lifecycle-disabled installs, exact lockfile audits and tests. Report remaining advisories without suppressing them.
- [x] L7 Smaller findings: generic errors, constant-time skill-key comparison, cryptographic client IDs, used contest content hashes, explicit credential variables, truthful monitoring state, safe Git ref and local Host validation.
- [x] L8 Delivery: final tests/build, exact revision/checksums, reviewed deployment and live browser/API acceptance. No Git auto-deploy connection before access policy is settled. Secret names/scopes only, never secret values in reports.

Application remediation is merged; production delivery and visual acceptance are recorded separately below. Historical checkpoints retain their original status. Read-only public surfaces are containment, not a claim that legacy local storage gained identity, durable moderation or retention. Existing Blob data must not be deleted without a reviewed retention/migration decision.

## Validation checkpoint

Root regression suite: 25 passed. Required server suite: 48 passed, including cross-instance trivia conditional writes, origin checks and public containment. Full client suite: 164 passed in 45 files. Production TypeScript/Vite build passed. Video tooling: 17 tests plus TypeScript passed after updating all Remotion packages to 4.0.534. Fresh root, Hub and video npm audits each report zero vulnerabilities (raw JSON alongside this report). Counts are registry matches, not claims of comprehensive exploit absence.

The Mac rejected the new native Rollup loader; use the official platform-independent @rollup/wasm-node 4.63.4 drop-in (https://rollupjs.org/migration/). Its real Vite build and Vitest suite passed. A newly installed esbuild executable was also stopped by macOS. For local validation only, ESBUILD_BINARY_PATH pointed to a preinstalled 0.25.12 executable after exact SHA-256 equality with the locked package. Linux CI uses the normal clean install; no OS security setting was changed. A stale mixed-major npm install was replaced with a clean resolver run, leaving one consistent Vite 6.4.4 tree.

Public skill delivery is limited to 196 committed file sets, each verified against shared/reviewedSkills.json. One inherited Hugging Face bundle refers to a missing .env.example; it is excluded from the public library instead of serving an incomplete ZIP. This manifest binds bytes from the existing published library, not a new claim that every third-party instruction is safe or technically validated. Runtime-authored lessons/profiles never enter the public index.

Access observations: ENROLLMENT_OPEN remains true; the Lobby collaborator API currently lists only marguerite347. Existing main branch protection blocks force-push/deletion but has no required checks/reviews. Vercel project link is null (no Git auto-deploy). Only a Blob credential is configured; no growth/provider/subscription credential is configured. Values were not printed or written to the repo. The owner policy choice remains pending.

Chrome verification is currently blocked by the extension's local service failing to start. No rendered desktop/mobile acceptance is claimed at this checkpoint. Build, test and HTTP results do not substitute for that acceptance.


## Finding disposition

| Audit item | Implementation / remaining boundary |
| --- | --- |
| Critical 1, enrollment and review | Enrollment closed and invitation-service secret removed. Required checks/reviews apply to collaborators; the explicitly authorized owner/owner-agent administrator exception is recorded below. No Vercel Git connection. |
| High 2, mutable feed | Deployment snapshot by default; optional revision plus digest pin; field-specific URL hosts; visible destinations. |
| High 3, anonymous agent instructions | Persistent writes denied, runtime-authored listings excluded, complete bundled file sets verified by digest; official profile names reserved. Enrollment is closed under the subsequent owner-approved policy below. |
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


## Delivery record — 2026-10-09

- Implementation source: `ac1f320bc7e29302d19e1bd79e7e9c8808b6afeb`, merged in [PR #33](https://github.com/marguerite347/ootle-lobby-community/pull/33) as `f4cec6156a1dead0ad7ad93164b8601bce4395ed`. Trees match.
- [Clean PR CI](https://github.com/marguerite347/ootle-lobby-community/actions/runs/37988890602) passed both Validate content and Validate website. Pages publishing correctly skipped on the PR.
- Vercel built source `ac1f320` successfully as deployment `dpl_8e9P8uDNfRD4M7P6kXG2byBgerq5`: [protected preview](https://ootle-lobby-preview-m664b3yq8-peekaboo4.vercel.app). The actual app TypeScript/Vite build passed. Vercel's separate function packager printed type-resolution diagnostics for copied Remotion and skill-example TSX files that are not installed as function dependencies; it nevertheless completed and marked the deployment Ready. No claim that every copied example typechecks is made.
- Production has not been changed in this delivery. Promotion is awaiting the owner's answer to the explicit production question; the deployment skill requires an explicit production request.
- Rendered desktop/mobile and real-input checks remain blocked: Chrome's selected instance returns `failed to start codex app-server: No such file or directory (os error 2)`. No alternate browser/runtime was used. Preview runtime/API acceptance is not claimed from build readiness alone.
- Open-contributor policy remains unchanged pending the earlier question. Until that decision is made, Critical 1 is still open even though mutable-feed and anonymous-runtime instruction paths are contained.


## Wheel regression follow-up — 2026-10-09

The user's screenshot exposed a real startup failure in the protected preview. The frozen Spline scene uses bevel/process geometry; the runtime defaults fetch those WASM modules from unpkg.com and cdn.spline.design, which `connect-src 'self'` rejects. Reproduced that rejection with the actual pinned geometry loader. Configure Application.wasmPath to the already-restored same-origin vendor directory; retain the CSP unchanged. Both actual geometry WASM modules initialize successfully with all external requests denied, and the website CI now repeats this check after restoring the verified runtime.

Selection receipt: reuse the existing pinned Spline 2.0.57 files and its wasmPath option; no new dependency, CDN exception or replacement wheel. Browser rendering remains unverified because the authorized Chrome instance still cannot start its local app-server. Static asset responses confirm the original preview has the expected scene and CSP; they do not prove WebGPU rendering.


## Owner-approved access transition and production release

The owner explicitly instructed: close automatic enrollment, enforce reviews/checks in both repos, retry visual verification, fix regressions, then deploy Lobby to production. This supersedes the previous open-write policy and the unanswered-decision notes above.

Configuration sequence: disable enrollment and remove its stored credential first; update the stale policy documents and CODEOWNERS; then enforce product-branch protections. These owner-authorized setup commits establish the new policy. Subsequent changes require reviewed PRs. Required checks are Lobby `Validate content` and `Validate website`, and Workbench `ide`, `tari`, `dependency-audit`, bound to the GitHub Actions app. Require an approving review, code-owner approval on sensitive paths, stale-review dismissal, independent latest-push approval and conversation resolution; enforce for administrators and deny force-push/deletion. Only the owner was listed as collaborator; no pending invitations required cancellation. The underlying owner GitHub credential is not claimed globally revoked: its invitation-service secret was deleted.

Selection receipt: reuse the existing GitHub controller stop switch, existing successful Actions jobs, GitHub branch-protection API, CODEOWNERS and the existing Vercel project. No new invitation or deployment system. The controller's nine unit tests and closed entry-point trial pass without making permission changes.

Chrome retry still fails with `failed to start codex app-server: No such file or directory (os error 2)`. Desktop/mobile visual layout, navigation clicks, project-link interaction, full Daily Spark spin flow and browser download interaction could not be exercised. The selected-tab text loads normally but is not proof of those interactions. Production release validation will check exact revision, HTTP security boundaries, packaged skill hashes and the same-origin wheel dependencies; visual acceptance remains an explicitly open limitation.


### Subsequent owner-agent exception

After the release, the owner requested that their agents be the exception to review/check gates. GitHub administrator enforcement is now disabled on both product branches; `marguerite347` is the only current administrator, so the owner and agents using that authorized identity can push/merge directly. Normal collaborators retain required reviews, status checks and sensitive-path CODEOWNERS. Enrollment remains closed. This supersedes the administrator-enforcement and owner-needs-independent-review notes above; it does not claim to distinguish a human from an agent sharing the same GitHub identity.

## Completed browser acceptance and final release — 2026-10-09

This record supersedes the earlier browser-blocked checkpoints. Reused the existing Chrome control tool, CSP middleware, pinned Spline runtime, GitHub CI and Vercel project. Browser control was tested with real navigation and screenshots before continuing. No new browser or deployment pipeline was introduced.

Real Chrome checks covered 1440×1000 desktop and 390×844 mobile rendering with no horizontal overflow, contest navigation, the Templates/Skills pages and search, a community project link opening its matching Tari forum post, and the Lobby/Workbench round trip. The skill download button returned the page's completed-download confirmation; the browser runner did not return a local saved-file path, so filesystem completion is not claimed. Independently, the live bundled download API returned content matching every reported file digest.

Both normal Daily Ritual and `?rewardPlaytest=1` completed from real answer input through the 5× multiplier, 20× super wheel, 15,000 practice-point result and Play again. Desktop keyboard submission also worked. These are browser-only practice points, not financial awards.

The browser checks found two CSP regressions: GLTF's ImageBitmapLoader fetches embedded textures through `blob:` URLs, and Spline fetches two fixed font assets as ArrayBuffers. [PR #35](https://github.com/marguerite347/ootle-lobby-community/pull/35) permits browser-local blobs and only those two exact Google Fonts paths in both static and Express policies. The corrected preview returned HTTP 200 for both fonts with no application CSP errors. The live production page needed a hard refresh to discard the previously cached policy; fresh document headers and successful blob/font responses confirmed the corrected policy in Chrome.

Final application source: `1f978a2d2ffc447fb4790adc5822f59f9dd14571`, identical tree to validated PR source `65a8330012ce9b608d1f5ff99d28d374e1fb5c88`. [Final main CI](https://github.com/marguerite347/ootle-lobby-community/actions/runs/37997443104) passed content and website validation, client/server tests, dependency audits and real same-origin wheel WASM initialization. The existing nonblocking Vercel diagnostics about copied skill-example/video TSX remain as documented above; the actual application build passes.

Production deployment `dpl_A5eMcV2pqiCbhjHm1CdU5DP3q7ks` is Ready at [Ootle Lobby](https://ootle-lobby-preview.vercel.app/). The public build.json reports the exact application revision above. Nineteen live HTTP checks passed, including matching static/API CSP, blocked public writes/private endpoints, reviewed content counts, skill-file digests, wheel assets and the deployment integrity manifest's server-policy hash. The follow-up documentation commit records this release without changing deployed application code.

Public community writes remain intentionally read-only. Durable identity, moderation and retention are still prerequisites to reopening them. This completes Lobby release acceptance, not a claim that the separate Workbench dependency-advisory backlog is resolved.
