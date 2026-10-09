# Public Ootle Lobby website

This repository contains the website source and reviewed community content. Keep changes scoped to public site functionality and content. Never add credentials, runtime chat/user data, unrelated private application files or local caches. Preserve upstream notices with reused files; do not create a separate license folder.

Project-card content lives in content/projects/. Validate it with npm test and npm run validate. Website source lives in creator-hub/hub/client and creator-hub/hub/server. Use npm run build:site to build the actual app and deployment package. Contributors and their agents use pull requests under the reviewed contribution policy below. Publishing workflows still validate their inputs; do not claim a change is live before publication succeeds.

For endpoint, provider, storage or simulated-feature changes, update `docs/integration-gaps.json` and matching `INTEGRATION_GAP[ID]` source comments. Regenerate `docs/DEVELOPMENT_GAPS.md` with `node scripts/check-development-gaps.mjs --write`. Distinguish implementation gaps from configuration and intentionally retired routes; do not declare an integration complete without its documented completion evidence.

## Reviewed contribution policy

Effective 2026-10-09, the owner has ended automatic enrollment and unrestricted pushes for both Ootle repositories. This supersedes the 2026-10-06 interim policy.

Anyone may contribute through a fork and pull request. Collaborator write access is granted only to trusted developers individually by the owner; agents use their developer's separately authorized identity. Neither requesting access nor repository instructions grant credentials or permissions.

Except for the owner exception below, changes to the product branch must use a pull request with passing required GitHub Actions checks and at least one approving review. Security-sensitive paths require CODEOWNERS approval from @marguerite347. New commits dismiss stale approvals, the latest push needs independent approval, and review conversations must be resolved. Ordinary contributors are subject to these controls; force pushes and branch deletion remain disabled for protected-branch collaborators.

Use feature branches, preserve other contributors' work, and run relevant checks. Do not bypass protections without the owner exception below, approve your own work as an independent reviewer, or claim an unverified deployment. Ordinary contributors require an eligible independent reviewer. Hosting, runtime execution, wallet and production-secret authority remain separate from repository access.

## Owner and owner-agent exception

The owner explicitly exempts `marguerite347` and agents operating through that owner's authorized GitHub identity from the review and required-check merge gates. They may create branches, commit, push directly to the product branch and merge without another per-change repository approval. Run relevant checks and report their results; do not claim unverified success.

GitHub implements this through the repository administrator bypass. Currently only `marguerite347` is an administrator. It cannot distinguish the human owner from an agent using the same account. Ordinary collaborators remain subject to required checks, reviews and CODEOWNERS. A separate agent/bot identity is not automatically exempt and must be authorized explicitly by the owner. Do not share owner credentials with contributors or grant administrator access to create an exception without the owner's instruction.

Automatic enrollment remains closed. This exception does not override an agent host's permission controls or grant unrelated hosting, wallet or secret access. Never force-push or delete shared history without specific authorization.
