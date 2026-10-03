# Ootle Lobby · community website

**Help creators tell their story accurately.**

[Visit the live Lobby](https://ootle-lobby-preview.vercel.app) · [Review proposed edits](https://github.com/marguerite347/ootle-lobby-community/pulls) · [Report a correction](https://github.com/marguerite347/ootle-lobby-community/issues/new/choose)

This repository contains the public website source and the community content shown on the live Ootle Lobby. It includes the React frontend, Express server, styles, public artwork, runtime dependencies and a review workflow. Private repository history, credentials, unrelated business data and local user/chat state are excluded.

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

Website changes use the same public pull-request discussion and review process. The required **Validate website** check builds the actual site. See [CONTRIBUTING.md](CONTRIBUTING.md) for review details.

### Run the website

```sh
npm ci
npm run build:site
npm run start:site
```

Open http://localhost:4180. Node.js 22 is the deployment version. Runtime writes go into ignored `work/runtime`; do not commit personal data. The Vercel adapter preserves the preview's temporary storage behavior for chat and game state. Public editable content is durable in Git history.

`npm run build:site` produces the static site in `public/` and the serverless dependency package in `server-content/`. Both are generated and ignored. The cloud deployment builds from these sources; no connection to a contributor’s computer is needed.

### Deployment status

Daily Ritual POST requests validate the browser Origin against `PUBLIC_SITE_URL`
when configured, falling back to the direct request origin for local development.
The Vercel adapter pins this to `https://ootle-lobby-preview.vercel.app` because
TLS terminates upstream of Express. Keep it aligned with the public URL when
moving the deployment. Forwarded headers do not authorize a different origin,
and the `X-Hub-Trivia` header remains required. The website check includes the
proxy regression test through start, answer, spin, settlement and reload.

The full source was built and deployed to the live Vercel site on October 3, 2026. Content edits merged to `main` publish automatically through GitHub Pages and are consumed by the live site. Website code changes currently require a maintainer Vercel deployment. Automatic Git deployments are pending the Vercel account owner connecting GitHub under **Account Settings → Authentication → Login Connections**; the CLI reported that this login connection is required. After connecting the account, link this repository to the existing `ootle-lobby-preview` Vercel project with production branch `main`.

## Suggest an edit

1. Sign into GitHub and choose a project below, or use **Suggest an edit** on its live card.
2. Change the title, summary or technology labels. Keep the JSON structure and project id.
3. Select **Propose changes** and open a pull request. Include a short reason and public source links.
4. Discuss the visible before/after changes with the community. The editor can request improvements, accept, or close the proposal with an explanation.
5. After approval and merge, the publishing workflow updates the content feed. The live Lobby picks up the accepted version on refresh, normally within a few minutes of a successful publish.

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

Creator attribution, contest rules/prizes/deadlines, submission dates, cover artwork and automatically collected GitHub/forum metrics are outside this first editing surface. Use an issue to request a correction to those. Do not replace source dates or popularity counts with guesses.

## Review and publishing

The default branch requires the **Validate content** and **Validate website** checks and an approving code-owner review. New commits dismiss older approvals; unresolved review conversations must be resolved. `@marguerite347` is the initial editor. Administrators can manage repository policy, but normal publishing goes through reviewed pull requests. Add another trusted editor to CODEOWNERS before expecting the initial editor’s own proposals to receive an independent approval.

A pull request shows its exact diff and discussion publicly. Automated checks validate the complete content set. A failed check cannot publish. Only a push to `main` after merge deploys the accepted JSON feed through GitHub Pages. The application validates that feed again and retains its last good content if retrieval or validation fails. The feed records the source commit so an accepted edit can be traced back to its review.

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
