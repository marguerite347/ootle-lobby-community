# Ootle Lobby · community edits

**Help creators tell their story accurately.**

[Visit the live Lobby](https://ootle-lobby-preview.vercel.app) · [Review proposed edits](https://github.com/marguerite347/ootle-lobby-content/pulls) · [Report a correction](https://github.com/marguerite347/ootle-lobby-content/issues/new/choose)

This is the public content companion to the live Ootle Lobby. It contains the September project titles, descriptions and source-linked “Built with” labels shown on the site. The application code is maintained separately.

## Suggest an edit

1. Sign into GitHub and choose a project below, or use **Suggest an edit** on its live card.
2. Change the title, summary or technology labels. Keep the JSON structure and project id.
3. Select **Propose changes** and open a pull request. Include a short reason and public source links.
4. Discuss the visible before/after changes with the community. The editor can request improvements, accept, or close the proposal with an explanation.
5. After approval and merge, the publishing workflow updates the content feed. The live Lobby picks up the accepted version on refresh, normally within a few minutes of a successful publish.

You do not need to install anything. GitHub may first prompt you to fork the repository. Your proposal stays separate from the live version until it is accepted. The PR and commit history retain contributor credit.

| Project | Suggest an edit |
| --- | --- |
| Bounties powered by Threshold | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/threshold-bounties.json) |
| Caravel | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/caravel.json) |
| Outruna | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/outruna.json) |
| WunschSwap | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/wunschswap.json) |
| Threshold | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/threshold.json) |
| Tari L1 Web Wallet | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/tari-l1-web-wallet.json) |
| Ootle Surveys | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/ootle-surveys.json) |
| Sapient | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/sapient.json) |
| Legacy Vault | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/legacy-vault.json) |
| ShadowTix | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/shadowtix.json) |
| Ootle Pay | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/ootle-pay.json) |
| Signal Vault | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/signal-vault.json) |
| Private Ballot | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/private-ballot.json) |
| TariOrg | [Edit](https://github.com/marguerite347/ootle-lobby-content/edit/main/content/projects/tariorg.json) |

## What can change here?

- Project titles and plain-text descriptions.
- The names of templates/Tari components used, with HTTPS links to public source evidence.

Creator attribution, contest rules/prizes/deadlines, submission dates, cover artwork and automatically collected GitHub/forum metrics are outside this first editing surface. Use an issue to request a correction to those. Do not replace source dates or popularity counts with guesses.

## Review and publishing

The default branch requires the **Validate content** check and an approving code-owner review. New commits dismiss older approvals; unresolved review conversations must be resolved. `@marguerite347` is the initial editor. Administrators can manage repository policy, but normal publishing goes through reviewed pull requests. Add another trusted editor to CODEOWNERS before expecting the initial editor’s own proposals to receive an independent approval.

A pull request shows its exact diff and discussion publicly. Automated checks validate the complete content set. A failed check cannot publish. Only a push to `main` after merge deploys the accepted JSON feed through GitHub Pages. The application validates that feed again and retains its last good content if retrieval or validation fails. The feed records the source commit so an accepted edit can be traced back to its review.

## Run locally

Node.js 22 or newer, no dependencies:

```sh
npm test
npm run validate
npm run build
```

`dist/content.json` is the generated feed. `dist/index.html` links back to the Lobby and repository. Never edit generated files. See [CONTRIBUTING.md](CONTRIBUTING.md) for review and rollback details.

## Rights and attribution

Project names, descriptions and source references describe independently created community work. Their presence here does not relicense upstream projects, artwork or trademarks. Only contribute text you have the right to share publicly and allow the Lobby to display. Preserve the original project attribution.
