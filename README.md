# Ootle Lobby · community website

**Contributions:** automatic enrollment is closed. Contribute through a fork and pull request; individual collaborator access is owner-approved. Reviews and passing checks are required. See [CONTRIBUTING.md](CONTRIBUTING.md).

**Help creators tell their story accurately.**

[Visit the live Lobby](https://ootle-lobby-preview.vercel.app) · [Review proposed edits](https://github.com/marguerite347/ootle-lobby-community/pulls) · [Report a correction](https://github.com/marguerite347/ootle-lobby-community/issues/new/choose)

This repository contains the public website source and the community content shown on the live Ootle Lobby. It includes the React frontend, Express server, styles, public artwork, runtime dependencies and a contribution workflow. Private repository history, credentials, unrelated business data and local user/chat state are excluded.

## Community submissions and recordings

[Contributor workflow](docs/COMMUNITY_WORKFLOW.md) · [Shared video library](docs/MEDIA_LIBRARY.md) · [October listings](content/submissions/october-2026/) · [Capture tool](creator-hub/capture/README.md) · [Editable video templates](creator-hub/video-templates/README.md)

The October gallery reads reviewed entries from the shared content feed. Add one JSON file per new project; accepted listings are shared with every visitor. The read-only monitor detects new and edited official forum posts. Its scheduled GitHub workflow begins after merge to `main`; it never publishes entries automatically. Browser-local Workbench drafts and exported Riffs are not public GitHub submissions. Legacy hosted project writes are retired.

## Developer integration handoff

[End-to-end developer delivery plan](docs/DEVELOPER_HANDOFF.md) · [Development gaps for Lobby and Workbench](docs/DEVELOPMENT_GAPS.md) · [Workbench API contract](docs/WORKBENCH.md)

Missing services, configuration requirements, browser-only features and retired routes are explicitly flagged in source with `INTEGRATION_GAP[ID]`. The register includes implementation requirements and completion checks; validation catches stale markers. The Workbench editor/import/export are usable locally; compile, test, deploy, AI and public publishing need backend services before they are enabled.

## Website source

| What to change | Location |
| --- | --- |
| Homepage and route layouts | `creator-hub/hub/client/src/pages/` |
| Navbar and shared layout | `creator-hub/hub/client/src/Layout.tsx` |
| Contest cards and visual components | `creator-hub/hub/client/src/components/` |
| Styles and motion | `creator-hub/hub/client/src/Seasonal.css` and component CSS |
| Public artwork and game assets | `creator-hub/hub/client/public/` |
| API and server behavior | `creator-hub/hub/server/` |
| Community project descriptions and labels | `content/projects/` |
| Hosting configuration | `vercel.json`, `api/`, `scripts/prepare-site.mjs` |

Contributors submit website changes through pull requests. **Validate content** and **Validate website** are required merge checks. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Run the website

```sh
npm ci
npm run build:site
npm run start:site
```

Open http://localhost:4180. Node.js 22 is the deployment version. The public Lobby and local discovery entry point are read-only for community state. Project content changes are stored in Git. Daily Ritual remains a browser-only practice simulator, with no redeemable balance or prizes.

`npm run build:site` produces static assets in `public/` and the serverless dependency package in `server-content/`. Generated files are ignored. `public/build.json` records the source revision; `public/artifact-sha256.json` records package file hashes. Builds and installs disable dependency lifecycle scripts.

### Security and deployment status

The remediated entry point rejects anonymous persistent writes before body parsing. Chat, reports, room creation, creator profiles, skill publishing, engagement, analytics and subscriptions require authenticated durable services before re-enablement. Public skill downloads include only committed file sets that match the recorded digest manifest. Existing local service implementations and tests are not evidence that those public capabilities are available.

The unused server trivia API, private growth data and outbound Hugging Face endpoints return 410 on the public Lobby. Cookie-less trivia reads no longer register players even in retained test/local implementations, and production reset is disabled. Existing Blob records are preserved. Before enabling server trivia, implement a durable global creation quota, retention sweep and authenticated award policy; hashing cookie-based storage keys does not migrate existing records or replace identity.

The current hosting project has no Git auto-deploy connection. **Do not connect one while the open-contributor policy remains unresolved.** Keep runtime credentials scoped to Production; the existing Blob credential is already Production-only. Do not place secrets in builds, source or artifacts.

Content is now bundled with each reviewed deployment. Publishing to GitHub Pages does not change the running Lobby. An optional remote feed requires both `COMMUNITY_CONTENT_REVISION` (full 40-character revision) and `COMMUNITY_CONTENT_SHA256` (SHA-256 of `JSON.stringify(feed)`); changed or unapproved feeds retain the bundled/last approved snapshot. New external destination hosts also require a committed allowlist update.

Local provider tooling uses documented `GITHUB_TOKEN`, `GH_TOKEN` or `GITHUB_PAT`; the ambiguous `Github` alias was removed. Retained local video drafting uses `HF_DRAFT_ENABLED=1`, `HF_TOKEN` or `HUGGINGFACE_TOKEN`, and optional `HF_DRAFT_MODEL` (default `meta-llama/Llama-3.1-8B-Instruct`). This does not enable the public drafting route.

See [the remediation report](docs/security/LOBBY_REMEDIATION.md) for validation, delivery evidence and open policy decisions. Production/render verification must be recorded separately from a passing build.

## Suggest an edit without direct access

The fork-and-pull-request path is open without joining. Collaborators also use reviewed pull requests.

1. Sign into GitHub and choose a project below, or use **Suggest an edit** on its live card.
2. Change the title, summary or technology labels. Keep the JSON structure and project id.
3. Select **Propose changes** and open a pull request. Include a short reason and public source links.
4. Discuss the visible before/after changes with the community. The editor can request improvements, accept, or close the proposal with an explanation.
5. After a change reaches main, the publishing workflow updates the content feed. A reviewed Lobby deployment is required to include that content on the live site.

You do not need to install anything. GitHub may first prompt you to fork the repository. Your proposal stays separate from the live version until it is accepted. The PR and commit history retain contributor credit.

| Project | Suggest an edit |
| --- | --- |
| Bounties powered by Threshold | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/threshold-bounties.json) |
| Caravel | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/caravel.json) |
| Outruna | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/outruna.json) |
| WunschSwap | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/wunschswap.json) |
| Threshold | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/threshold.json) |
| Tari L1 Web Wallet | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/tari-l1-web-wallet.json) |
| Ootle Surveys | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/ootle-surveys.json) |
| Sapient | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/sapient.json) |
| Legacy Vault | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/legacy-vault.json) |
| ShadowTix | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/shadowtix.json) |
| Ootle Pay | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/ootle-pay.json) |
| Signal Vault | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/signal-vault.json) |
| Private Ballot | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/private-ballot.json) |
| TariOrg | [Edit](https://github.com/marguerite347/ootle-lobby-community/edit/main/content/projects/tariorg.json) |

## What can change here?

- Project titles and plain-text descriptions.
- The names of templates/Tari components used, with HTTPS links to public source evidence.

For September cards, creator attribution, submission dates, cover artwork and collected metrics use the reviewed registry and media workflow; request corrections with public evidence. New October listings include verified creator/date/source fields and optional credited recordings through the contributor workflow above. Contest rules, prizes and deadlines remain authoritative on the forum. Do not replace source dates or popularity counts with guesses.

## Review and publishing

The product branch requires passing validation checks, an independent approving review, CODEOWNERS review for sensitive paths and resolved review conversations. These requirements also apply to administrators. Force pushes and branch deletion are blocked.

A pull request shows its exact diff and discussion publicly. Automated checks validate the complete content set. A failed check cannot publish. A push to `main`, directly or after merge, triggers publication of the JSON feed through GitHub Pages. The application validates that feed again and retains its last good content if retrieval or validation fails. The feed records the source commit so a published edit can be traced back to its commit.

## Run locally

The content validator uses Node.js 22 and no additional dependencies:

```sh
npm test
npm run validate
npm run build
```

`dist/content.json` is the generated feed. `dist/index.html` links back to the Lobby and repository. Never edit generated files. See [CONTRIBUTING.md](CONTRIBUTING.md) for review and rollback details.

## Rights and attribution

Project names, descriptions and source references describe independently created community work. Their presence here does not relicense upstream projects, artwork or trademarks. Only contribute text you have the right to share publicly and allow the Lobby to display. Preserve the original project attribution.

## Current Daily Ritual testing flow

Daily Ritual now has one client flow: trivia → 3D first wheel → Super wheel,
with simulated, replayable Sparks. **Test again ↻** clears the playtest and
starts fresh. The retired 2D renderer, its animation handlers, the alternate
client API path and the hostname/query/session selector have been removed.
`rewardPlaytest=0` and stale browser preferences cannot restore the old flow.
Authored Riffs use the same renderer with their own isolated request source.
The existing private server records are separate from these simulated rewards.

Selection receipt: the shared page showed the retired “Let the wheel cook”
state because only localhost selected the current preview. At the user's
request, remove the alternate client flow entirely and reuse the existing 3D
renderer, simulator and replay control. The current-flow tests are included in
required website CI. Keep server data intact; no player records are deleted.
