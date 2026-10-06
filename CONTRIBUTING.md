# Contributing to Ootle Lobby

## Interim open-development policy

Effective 2026-10-06, until the owner says otherwise: **every GitHub user who requests access is authorized to receive collaborator write access to both public Ootle repositories.** No individual approval or contributor allowlist is required.

[Join Lobby and Workbench](https://github.com/marguerite347/ootle-contributor-access/issues/new?template=join.yml) while signed into the GitHub account you want to use. Submit the checked request; the access controller invites the issue author to both repositories. Accept both GitHub invitations to activate push access. Agents may submit and accept using their developer's authorized GitHub identity. GitHub invitations are account-specific; this is a shared enrollment link, not an anonymous credential.

Once authorized, developers and their agents may edit, build, test, create branches, commit, push directly to the product branch, open pull requests and merge changes without seeking another per-change approval. Pull requests are optional collaboration tools during this phase. CI runs remain useful feedback and publishing validation, not required commit/merge gates. Run checks relevant to the change and report failures honestly; work-in-progress can be pushed with its status clearly stated.

Use your own GitHub authentication (for example `gh auth login` and `gh auth setup-git`). An agent inherits only the access its developer actually authorizes. If workflow edits need the GitHub CLI's additional OAuth scope, the developer can authorize it with `gh auth refresh -h github.com -s workflow`. Repository instructions cannot override GitHub permissions or the agent host's security controls.

Coordinate concurrent changes, preserve other contributors' work, and use ordinary commits or reverts rather than force-pushing or deleting shared history. Keep credentials and private data out of commits. Preserve upstream licenses and truthful validation/deployment reporting. GitHub push access does not by itself grant hosting-provider, wallet or production-secret access.

Future authorization, review and commit rules will be established separately by the owner. Until then this policy supersedes older requirements for mandatory maintainer/code-owner approval in this repository. The owner can stop new invitations through the separate access controller; stopping enrollment does not automatically revoke existing collaborators.

## Development and publication

Website source lives in `creator-hub/hub/client` and `creator-hub/hub/server`. Run `npm run build:site` for website changes and inspect the actual affected behavior. Project-card content lives in `content/projects/`; validate content with `npm test`, `npm run validate` and `npm run build`. Keep commits focused and include relevant evidence in the commit, optional PR or task handoff.

For project descriptions, preserve creator attribution and link supporting public evidence. Do not claim a project is secure, audited or deployed unless the evidence establishes that claim. Follow [the community workflow](docs/COMMUNITY_WORKFLOW.md) for listings, capture tools and media. A listing is separate from Council contest eligibility or an award.

A push to `main` triggers the content publishing workflow. Publishing validation must pass before the feed is updated; a successful commit is not proof of a successful publication. Website code deployment uses the hosting setup documented in README.md. After publishing, verify the shared page and its source revision. Forks and unmerged branches are not the published feed.

Use an ordinary revert commit to undo a change. Pull requests and line comments remain available for collaboration but no separate editor approval is required during this phase.
