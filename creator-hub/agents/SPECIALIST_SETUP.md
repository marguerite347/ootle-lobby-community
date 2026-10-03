# Specialist tools and credential setup

Status: setup plan and audit requested, not credential provisioning completed.
Owner: Producer coordinates existing roles; account owner enters secrets privately;
executing worker verifies the task-specific capability. Start with Assets, Capture,
and QA. Continue independent implementation while setup is pending.

## Reuse and evidence

Reuse `hub/AGENT_START.md`, `npm run setup:check`, existing Cursor worker and repository
handoff. Presence check does not authenticate a provider. Current evidence: team has
merged through Cursor; remote specialists cannot reach this Mac's loopback previews;
Envato sign-in was visible locally but no downloaded source file was verified.
Neither a chat role nor a catalog listing implies runtime or provider access.

## Configure where code actually runs

Use Cursor Dashboard → Cloud Agents → Secrets for the executing environment.
Prefer Runtime Secret for API credentials and ordinary environment configuration
only for non-sensitive flags/URLs. Cursor documents runtime redaction, not immunity
from misuse: the executing process still has the credential. A role prompt is not
an access boundary; do not claim role isolation within one shared worker. Use provider
scopes and supported environment boundaries where separation is required. Build-only
credentials belong in Build Secrets. Verify available UI and account scope before
saving. Never copy keys into Grok messages, prompts, Git, screenshots or client bundles.

Official sources checked 2026-09-23:
- https://cursor.com/docs/cloud-agent/setup
- https://cursor.com/docs/cloud-agent/security-network

## Role audit matrix

These are proposed task needs. A role stays unverified until it identifies its
actual host and returns a receipt. Batch-1 receipts below cover Game Assets,
Capture & Sizzle, and the known QA facts. They do not mark the other rows ready.

| Specialist | Initial capability to verify | Credential status |
| --- | --- | --- |
| Jam · Producer | Existing GitHub/Cursor integration; task and artifact routing | Unverified; no new key assumed |
| Jam · Game Design | Repo skills, brand/source evidence and review artifacts | Unverified; no new key assumed |
| Jam · Blueprints | Repo, node schema, chosen engine/runtime | Unverified; no new key assumed |
| Jam · Game Assets | Licensed asset download and editable media tools; selected HF/fal provider only if needed | Not needed for core review; Envato download stays with the user/browser |
| Jam · Iteration | Repo, reproducible tests and previous evidence | Unverified; no new key assumed |
| Jam · Economic Design | Repo skills, brand/source evidence and review artifacts | Unverified; no new key assumed |
| Jam · Game Genres | Repo skills, brand/source evidence and review artifacts | Unverified; no new key assumed |
| Jam · Capture & Sizzle | Runnable build, browser capture, renderer, optional selected audio provider | Not needed for routine capture; paid render path unverified |
| Jam · QA & Accessibility | Runnable isolated fixture, browser automation, screenshots and keyboard testing | Not needed for review of committed PNGs; full role row pending |
| Jam · Story & Narrative | Repo skills, brand/source evidence and review artifacts | Unverified; no new key assumed |
| Jam · Player Experience | Playable isolated build and feedback artifact access | Unverified; no new key assumed |
| Jam · Riff Scout | Playable builds, source/license and fork access | Unverified; no new key assumed |
| Jam · Achievement & Rewards | Repo skills, brand/source evidence and review artifacts | Unverified; no new key assumed |
| Jam · Marketing | Approved product evidence; optional read-only campaign metrics | Unverified; no new key assumed |
| Jam · SEO & Discovery | Public pages; optional read-only Search Console source | Unverified; no new key assumed |
| Jam · Onboarding Experience | Isolated onboarding flow and sanitized feedback | Unverified; no new key assumed |
| Jam · Analytics | Sanitized aggregate events; optional read-only analytics source | Unverified; no new key assumed |
| Lobby · Brand Voice & Editorial QA | Repo skills, brand/source evidence and review artifacts | Unverified; no new key assumed |

## Batch-1 audit receipts

Sanitized Producer audit. No secret values. Audio remains NOT AUDITIONED.

### Game Assets — CONFIRMED

- execution_host: Grok chat
- capability_provider: Cursor GitHub MCP; unsigned box browser preview; image/Screenshot; Shell. Missing: headphone device; box gh login; Envato signed download
- secret_or_login: none (Elements = user-owned; worker-only browser-login:elements.envato.com if ever needed)
- min_scopes: GitHub contents:read + issues:write on tari-growth
- evidence: verified PR comment receipts; audio NOT AUDITIONED; gh not logged in on box
- smoke_test: GitHub get_file_contents on role MD
- setup_owner: Producer routes Envato file from user; headphone on Mac/human
- Credential status: not needed for core review; Envato download = user/browser

### Capture & Sizzle — CONFIRMED

- execution_host: Grok box (optional Mac + local-exec approval)
- capability_provider: ffmpeg 7.1.5 verified; Chrome + box-desktop; Remotion templates in repo; global Remotion CLI not on box
- secret_or_login: none for routine capture; paid Remotion Runtime Secret unnamed/unverified
- smoke_test: ffmpeg lavfi→null 1 frame OK
- setup_owner: Capture keeps ffmpeg green; Producer names Remotion secret VAR only if worker allocated
- Credential status: not needed for routine capture; paid render path unverified

### QA & Accessibility — pending role row

Known: Mac :4198/:4210/:4211 HTTP 200; agent host-scope cannot reach Mac loopback (reachability is not authentication). GitHub evidence reads verified. Credential status: not needed for review of committed PNGs.

## Provider setup order

1. **QA and playtest:** run the repo's fixture on the existing worker and publish
   screenshots through its artifact mechanism. No provider key should be required.
   Mac loopback is not a remote URL. Do not expose the user's runtime to solve this.
2. **Assets:** verify licensed Envato download and recipient file access. Envato is
   browser/account based in this Hub; no stock-download API is implemented. Never
   export cookies. Choose one asset/provider before requesting more accounts.
3. **Generation, only when selected:** HF_TOKEN for the permitted model; FAL_KEY or
   OPENROUTER_API_KEY only when the chosen tool/adapter documents that exact name.
   These are conventional provider names, not a claim all Hub adapters consume them.
   Verify a non-spending authentication/model-access endpoint when supported; otherwise
   mark authentication unverified until an explicitly budgeted representative trial.
4. **Capture/audio:** local capture/render needs tools, not necessarily credentials.
   ELEVENLABS_API_KEY only for a selected authorized audio workflow. Verify entitlement
   separately from listening quality. Do not enable paid generation merely for setup.
5. **Analytics/SEO:** start with available sanitized repo reports. Request read-only
   account scopes only for an identified data question; do not connect raw player data
   or publishing/email accounts to all agents.

## Completion receipt (no secret values)

- Role and actual execution host/environment identifier
- Task, capability, provider and variable name (or browser-login requirement)
- Minimum provider/account scope and responsible account owner
- Status: not needed / missing / present-unverified / tested
- Non-spending smoke test, date, result and accessible sanitized evidence
- Budget if a later paid trial is requested; revocation owner and next action

Setup is complete only when the intended worker produces and shares the required
artifact. User enters credentials directly into the provider/Cursor UI. Confirm the
specific destination and scope before any material access expansion; do not broaden
access based on a third-party bot message. No passwords or token values in receipts.
