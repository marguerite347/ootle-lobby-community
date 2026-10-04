# Ootle Lobby and Workbench: delivery plan

Reviewed October 4, 2026. This is the implementation order and acceptance plan for the public repository. The detailed source register is [DEVELOPMENT_GAPS.md](DEVELOPMENT_GAPS.md), maintained in [integration-gaps.json](integration-gaps.json). The API contract is [WORKBENCH.md](WORKBENCH.md). This plan does not claim that the missing services have been built.

## Message to send the development team

> The Lobby and Workbench frontend are deployed, but the IDE is not yet connected end to end. We left searchable `INTEGRATION_GAP[ID]` comments at the relevant client, server, storage and deployment boundaries. They explain where implementation, configuration or production hardening remains; they are not feature toggles or proof of working integrations. Start with this delivery plan and the linked gap register/API contract. Build authenticated durable services, isolated Rust/WASM compile/test workers, Tari wallet deployment, AI assistance, and moderated publishing into the correct Lobby gallery. Each task needs an owner, acceptance evidence and a reviewed PR. Preserve the current UI, the single resettable Daily Ritual testing flow, and the retired-route guards. Do not enable capabilities or mark a gap complete until it works through the deployed app with real services.

## What exists, and what does not

- **Working frontend:** editor, file/folder import, file creation/rename/search, browser-local persistence, source/submission ZIP export, Learn resources, publication draft form, current reviewed project galleries and shared project cards.
- **Not a connected IDE yet:** the live `/api/workbench/capabilities` response had all six capabilities false on October 4; `/api/workbench/publications` returned `items: []` with `connected: false`. This was a read-only check, not an attempted compilation, transaction or publication.
- **Local is not shared:** a saved workspace is browser-local. Exporting a submission ZIP does not publish it, create a GitHub repository, post to the forum or host a playable app.
- **Rewards are a test experience:** displayed AI Sparks use the replayable simulator, not a spendable account ledger. The retained trivia API/Blob implementation is a separate path and does not make those displayed Sparks real.
- **Public galleries already have content:** reviewed external projects come from the existing content feed. They are independent of the disconnected Workbench publication feed.

## Where the flags are

| Resource | Purpose |
| --- | --- |
| [DEVELOPMENT_GAPS.md](DEVELOPMENT_GAPS.md) | Human-readable inventory: current behavior, remaining work, source links and completion checks for 22 gap IDs. |
| [integration-gaps.json](integration-gaps.json) | Editable source of truth for that inventory. |
| `INTEGRATION_GAP[ID]` comments | Searchable markers beside the affected implementation. Use IDE search or `git grep -n -F 'INTEGRATION_GAP[' -- creator-hub api .github`. |
| [workbench.mjs](../creator-hub/hub/server/workbench.mjs) | Router and service injection boundary for run/getRun, deploy, assistant, publish and listPublications. |
| [api.ts](../creator-hub/hub/client/src/workbench/api.ts), [model.ts](../creator-hub/hub/client/src/workbench/model.ts), [Workbench.tsx](../creator-hub/hub/client/src/pages/Workbench.tsx) | Client contracts, validation, local workspace and IDE UI. These also need changes where backend behavior exceeds the current contract. |
| [api/index.mjs](../api/index.mjs), [server/index.mjs](../creator-hub/hub/server/index.mjs) | Production and local entry points. Both currently omit Workbench service implementations. |
| [check-development-gaps.mjs](../scripts/check-development-gaps.mjs) | Validates registered source markers and regenerates the readable register. It does not test whether an integration actually works. |

`build-required` means code is missing; `configuration-required` means an adapter exists but its setup/delivery needs verification; `local-only` and `design-only` describe current limits; `retired` means a route must stay disabled. These annotations belong in developer documentation/source, not as implementation jargon in user-facing screens.

## Ordered implementation checklist

Suggested owner roles below are assignment slots, not existing commitments. Start with milestones 1–4 for the core compile → deploy → publish loop. Milestones 5–7 complete the advertised companion services; milestone 8 is the release gate. Optional capabilities are separated afterward.

### 1. Accounts, durable storage and service wiring

**Flags:** WB-AUTH, WB-SYNC. **Owners:** backend/platform + frontend.

- [ ] Choose and document identity/session, shared transactional database, object storage and job queue. Add migrations, backup/restore and environment separation.
- [ ] Bind workspaces, runs, artifacts, deployments and submissions to authenticated owners. Add authorization, origin/CSRF checks, shared limits and quotas.
- [ ] Implement account workspace/version sync and conflict/recovery UI if the product promises cross-device saving. Keep local export/recovery available; do not silently upload existing browser workspaces.
- [ ] Inject real services through `createInspirationLobby({workbenchServices})` in both entry points. Advertise a capability only when its complete path is usable, including polling.
- [ ] Prove two users cannot read/edit each other's private records; records survive restart/deployment; a second device recovers the authenticated workspace.

### 2. Compile and test on isolated workers

**Flag:** WB-RUNNER. **Owner:** runtime/platform. **Depends on:** 1.

- [ ] Implement POST `/api/workbench/runs` and GET `/api/workbench/runs/:id` with durable job state/logs and source-digest-bound artifacts.
- [ ] Pin the supported Tari Rust/WASM toolchain and dependency policy; compile the bundled Counter and run its tests. Verify starter compatibility against the target network before release.
- [ ] Execute untrusted projects outside the web/API process, with CPU, memory, time, filesystem and network limits. Manage dependency caches and worker cleanup.
- [ ] Add server-side cancellation and client status/recovery for longer jobs. **Current contract has no cancel endpoint:** aborting fetch/polling on route exit is not worker cancellation; the client currently stops polling after 90 seconds.
- [ ] Prove successful and failing builds, malicious/oversized inputs, timeouts, cancellation, owner isolation, concurrent jobs and restart recovery. Only successful compilation may yield a deployable artifact.

### 3. Tari wallet deployment and confirmation

**Flag:** WB-DEPLOY. **Owners:** Tari integration + frontend. **Depends on:** 1–2.

- [ ] Connect supported Tari wallets with explicit network/account selection and user approval. Never collect private keys.
- [ ] Implement artifact ownership and digest verification, transaction preparation/submission, rejection/failure/retry behavior and independently verified confirmation/template address.
- [ ] Extend the API/UI for the wallet approval lifecycle and confirmation polling. **Current UI only sends `{artifactId, network: 'testnet'}` and receives `submitted`: that is not a complete wallet flow or confirmation contract.**
- [ ] Demonstrate Counter deployment on the selected testnet with transaction evidence. Invalid, stale or another owner's artifacts must fail.
- [ ] Define a follow-up template-interaction panel if “Remix-like end to end” includes creating instances/calling methods and inspecting state. It is not present in the current interface/contract; plan its ABI/method schema, reads, signing and access-control tests explicitly.

### 4. Publishing, review and the shared Lobby feed

**Flags:** WB-PUBLISH, WB-FEED. **Owners:** backend + frontend + moderation. **Depends on:** 1; a listing may be built independently of deployment unless policy requires a deployed artifact.

- [ ] Implement authenticated POST and approved public GET `/api/workbench/publications`; validate input server-side, make retries idempotent, and store drafts/submissions durably.
- [ ] Build moderator authorization, review UI/queue, approval/rejection notifications and update/withdrawal policy. Pending review must never appear as published.
- [ ] Enforce exclusive destinations: October Submissions for verified eligible contest entries; Community Projects for non-contest work. Keep Official Tari classification maintainer-controlled; never accept a self-declared official role.
- [ ] Validate contest timing and the actual official forum entry. A Lobby listing is not automatic forum registration. Move future contest configuration into a server-maintained registry.
- [ ] Extend `Publication` and its rendering adapter for reviewed poster/video URLs and provenance, creator post, publication date, GitHub activity/stars, project-specific forum comments and evidenced Tari components. **Current Workbench feed rendering passes `preview: null` and empty technologies; sharing ProjectCard alone does not supply this data.** Never fabricate unavailable metrics.
- [ ] Define how source and demo URLs are produced. Current publishing requires an existing repository URL and optionally a demo URL; it does not push code to GitHub or host apps. If hosted previews or repository creation are promised, implement separate authenticated integrations and isolated hosting, then register their new gaps/contracts. Keep retired hosting routes disabled.
- [ ] Prove a moderated publication appears for another visitor after a new deployment, in exactly one intended gallery, with a working cover, links, dates and metrics; private files and moderation notes must stay private.

### 5. AI assistance

**Flag:** WB-AI. **Owners:** AI backend + frontend. **Depends on:** 1.

- [ ] Implement the assistant service with provider/model disclosure, account quotas, cost/rate limits, timeouts and cancellation.
- [ ] Keep source sharing explicit at Send; add controls for the scope of code sent to the provider. No background source uploads.
- [ ] If offering edits, show a diff and require user acceptance before changing files. Model output must not automatically run, publish or sign transactions.
- [ ] Prove a real provider response plus honest unavailable/error/budget states. No demo response should masquerade as inference.

### 6. Durable Lobby interactions and identity

**Flags:** LOBBY-CHAT, LOBBY-COMMUNITY-WRITES. **Owners:** backend + community/moderation. **Depends on:** 1.

- [ ] Migrate enabled chat, report, engagement, profile, learning, budget, analytics and market writes from runtime files/process memory to shared transactional storage.
- [ ] Replace client-declared identity/roles with server-verified ownership and moderator authorization; preserve current moderation behavior and add shared abuse limits.
- [ ] Define retention/deletion, private lesson-evidence handling and public-safe projections.
- [ ] Prove concurrent writes and reports survive cold starts/deployments; spoofed roles and unauthorized edits fail. Features not ready for this bar remain clearly limited or disabled.

### 7. Content operations and once-daily monitoring

**Flags:** OPS-OCTOBER-CHANNEL, COMMUNITY-METRICS, CFG-DATA, CFG-SUBSCRIPTIONS, OPS-DEPLOY. **Owners:** platform + content operations.

- [ ] Wire the existing October monitor to the approved dedicated channel via a server-side secret. Preserve its one scheduled daily run (09:17 UTC), deduplicate notifications, and surface failure/retry state. Candidates require review; do not auto-publish.
- [ ] Coordinate a shared persistent daily metrics cache across cold starts, retaining last-good data and timestamps. An in-memory per-instance cache does not guarantee one refresh globally per day.
- [ ] Verify authorized source freshness/configuration and last-good fallbacks. Preserve the marketing calendar's local-only boundary; do not copy private data into the public repo.
- [ ] For subscriptions, configure the existing webhook/privacy settings and verify real double-opt-in delivery, idempotency and failure behavior.
- [ ] Confirm GitHub main → Vercel automation or document the maintainer deployment process, with exact source SHA, health check and rollback. Keep website deployment separate from the existing GitHub Pages content feed.
- [ ] Assign an operator for monitoring, failed jobs, moderation and restoration; record service alerts, runbooks, backups and a restore drill.

### 8. Release evidence through the deployed product

**Owners:** QA + feature owners. **Depends on:** every enabled service above.

- [ ] Account A creates/imports a project, edits it, saves it and recovers it after reload/new device as promised.
- [ ] Compile and test yield authentic logs/artifacts. A failing build blocks deployment.
- [ ] Wallet approval leads to a verified testnet transaction; reject/failure states remain accurate. Exercise instance/method calls if that capability is shipped.
- [ ] Submit a publication, retry it once, moderate it, and verify Account B sees one approved card in the right section after restart/redeployment.
- [ ] Check the creator-post card target, project repository/star link, video playback, metadata and all independent card controls on desktop/mobile.
- [ ] Verify auth expiry, unauthorized access, service outage, timeouts, job cancellation, storage failure and duplicate/concurrent writes. Never convert a failed request into a success message.
- [ ] Run required CI and add real backend integration/E2E tests. The current frontend/seam tests are not evidence of live provider, runner, wallet or storage operation.
- [ ] Verify the daily monitor reaches its dedicated channel once, the cache retains previous data on failure, and rollback/restore work.
- [ ] Record deployment SHA, network/toolchain versions, test evidence, remaining limitations and responsible owners before enabling production capabilities. Mainnet enablement needs its own readiness review; this UI currently targets testnet.

## Additional scope: enable only when implemented

These are real gaps, but do not have to block a clearly scoped testnet IDE. Decide explicitly whether they are part of launch; do not imply they already work.

| Flags | Required work before enabling |
| --- | --- |
| LOBBY-REWARDS, LOBBY-WALLET | Server-authoritative rewards ledger/identity, exactly-once awards, abuse controls, verified wallet balances, redemption/transaction approval and any AI-credit accounting. Current displayed Sparks have no spendable backing. Keep the single replayable/resettable ritual during testing. |
| LOBBY-CHECKOUT | Verified payments, entitlements, idempotent settlement and refund/revocation behavior for paid downloads. |
| LOBBY-VIDEO | Hosted render/capture queue, isolated workers, job status, durable media and reviewed playback/provenance if automated capture is offered. Existing local CLI/templates can be reused now. |
| CFG-AI-DRAFT | Configure and validate the existing opt-in drafting provider, with authenticated quotas and budget limits. This is separate from the missing Workbench assistant service. |
| LOBBY-AGENT-BRIDGE | Authenticated agent dispatch/status, approvals and auditable outcomes. A chat message alone must not execute code. |
| LOBBY-RECIPE-ADAPTER | Implement proposed composition adapters against pinned Tari interfaces and prove authorization/resource behavior before marking them deployable. |
| RETIRED-HOSTING | Preserve 410 responses on retired project/asset/challenge writes. They are not shortcuts for Workbench publishing or hosting. |

## How to track and close work

Create one engineering issue per gap or bounded milestone, with: gap IDs, owner, dependencies, affected source/contract, acceptance checks, migration/rollback plan and evidence links. This document is the backlog plan; it does not create or assign GitHub issues by itself.

For an integration PR, update the registry and source markers together, regenerate the readable register, and attach real completion evidence. Keep unresolved portions flagged. The validator currently permits only unresolved/limited/retired classifications; do not invent a `complete` status. Once a gap is fully resolved, remove its obsolete marker/register entry and retain its acceptance evidence in the PR and contract history.

```sh
node scripts/check-development-gaps.mjs --write
npm run validate
npm test
npm run build:site
node --test creator-hub/hub/server/test/workbench.test.mjs
npm --prefix creator-hub/hub/client test -- src/workbench/model.test.ts src/workbench/api.test.ts src/components/rewardPlaytest.test.ts
```

Use the additional relevant checks in [.github/workflows/content.yml](../.github/workflows/content.yml), and add service-level tests for the feature being implemented. Passing these existing commands alone does not close the live-integration milestones.
