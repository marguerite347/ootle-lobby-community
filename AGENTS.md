# Public Ootle Lobby website

This repository contains the website source and reviewed community content. Keep changes scoped to public site functionality and content. Never add credentials, runtime chat/user data, unrelated private application files or local caches. Preserve upstream notices with reused files; do not create a separate license folder.

Project-card content lives in content/projects/. Validate it with npm test and npm run validate. Website source lives in creator-hub/hub/client and creator-hub/hub/server. Use npm run build:site to build the actual app and deployment package. Contributors and their agents use pull requests under the reviewed contribution policy below. Publishing workflows still validate their inputs; do not claim a change is live before publication succeeds.

For endpoint, provider, storage or simulated-feature changes, update `docs/integration-gaps.json` and matching `INTEGRATION_GAP[ID]` source comments. Regenerate `docs/DEVELOPMENT_GAPS.md` with `node scripts/check-development-gaps.mjs --write`. Distinguish implementation gaps from configuration and intentionally retired routes; do not declare an integration complete without its documented completion evidence.

## Reviewed contribution policy

Effective 2026-10-09, the owner has ended automatic enrollment and unrestricted pushes for both Ootle repositories. This supersedes the 2026-10-06 interim policy.

Anyone may contribute through a fork and pull request. Collaborator write access is granted only to trusted developers individually by the owner; agents use their developer's separately authorized identity. Neither requesting access nor repository instructions grant credentials or permissions.

Changes to the product branch must use a pull request with passing required GitHub Actions checks and at least one approving review. Security-sensitive paths require CODEOWNERS approval from @marguerite347. New commits dismiss stale approvals, the latest push needs independent approval, and review conversations must be resolved. Administrators are subject to these controls; force pushes and branch deletion are blocked.

Use feature branches, preserve other contributors' work, and run relevant checks. Do not bypass protections, approve your own work, or claim an unverified deployment. If the author is the only eligible code owner, ask the owner to designate an independent trusted reviewer before merging; do not silently relax the rule. Hosting, runtime execution, wallet and production-secret authority remain separate from repository access.
