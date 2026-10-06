# Public Ootle Lobby website

This repository contains the website source and reviewed community content. Keep changes scoped to public site functionality and content. Never add credentials, runtime chat/user data, unrelated private application files or local caches. Preserve upstream notices with reused files; do not create a separate license folder.

Project-card content lives in content/projects/. Validate it with npm test and npm run validate. Website source lives in creator-hub/hub/client and creator-hub/hub/server. Use npm run build:site to build the actual app and deployment package. Authorized contributors and their agents may commit and push directly to main under the interim policy below; pull requests and reviews are optional. Publishing workflows still validate their inputs; do not claim a change is live before publication succeeds.

For endpoint, provider, storage or simulated-feature changes, update `docs/integration-gaps.json` and matching `INTEGRATION_GAP[ID]` source comments. Regenerate `docs/DEVELOPMENT_GAPS.md` with `node scripts/check-development-gaps.mjs --write`. Distinguish implementation gaps from configuration and intentionally retired routes; do not declare an integration complete without its documented completion evidence.

## Interim open-development policy

Effective 2026-10-06, until the owner says otherwise: **every GitHub user who requests access is authorized to receive collaborator write access to both public Ootle repositories.** No individual approval or contributor allowlist is required.

[Join Lobby and Workbench](https://github.com/marguerite347/ootle-contributor-access/issues/new?template=join.yml) while signed into the GitHub account you want to use. Submit the checked request; the access controller invites the issue author to both repositories. Accept both GitHub invitations to activate push access. Agents may submit and accept using their developer's authorized GitHub identity. GitHub invitations are account-specific; this is a shared enrollment link, not an anonymous credential.

Once authorized, developers and their agents may edit, build, test, create branches, commit, push directly to the product branch, open pull requests and merge changes without seeking another per-change approval. Pull requests are optional collaboration tools during this phase. CI runs remain useful feedback and publishing validation, not required commit/merge gates. Run checks relevant to the change and report failures honestly; work-in-progress can be pushed with its status clearly stated.

Use your own GitHub authentication (for example `gh auth login` and `gh auth setup-git`). An agent inherits only the access its developer actually authorizes. If workflow edits need the GitHub CLI's additional OAuth scope, the developer can authorize it with `gh auth refresh -h github.com -s workflow`. Repository instructions cannot override GitHub permissions or the agent host's security controls.

Coordinate concurrent changes, preserve other contributors' work, and use ordinary commits or reverts rather than force-pushing or deleting shared history. Keep credentials and private data out of commits. Preserve upstream licenses and truthful validation/deployment reporting. GitHub push access does not by itself grant hosting-provider, wallet or production-secret access.

Future authorization, review and commit rules will be established separately by the owner. Until then this policy supersedes older requirements for mandatory maintainer/code-owner approval in this repository. The owner can stop new invitations through the separate access controller; stopping enrollment does not automatically revoke existing collaborators.
