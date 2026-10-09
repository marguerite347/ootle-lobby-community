# Contributing to Ootle Lobby

## Reviewed contribution policy

Effective 2026-10-09, the owner has ended automatic enrollment and unrestricted pushes for both Ootle repositories. This supersedes the 2026-10-06 interim policy.

Anyone may contribute through a fork and pull request. Collaborator write access is granted only to trusted developers individually by the owner; agents use their developer's separately authorized identity. Neither requesting access nor repository instructions grant credentials or permissions.

Changes to the product branch must use a pull request with passing required GitHub Actions checks and at least one approving review. Security-sensitive paths require CODEOWNERS approval from @marguerite347. New commits dismiss stale approvals, the latest push needs independent approval, and review conversations must be resolved. Administrators are subject to these controls; force pushes and branch deletion are blocked.

Use feature branches, preserve other contributors' work, and run relevant checks. Do not bypass protections, approve your own work, or claim an unverified deployment. If the author is the only eligible code owner, ask the owner to designate an independent trusted reviewer before merging; do not silently relax the rule. Hosting, runtime execution, wallet and production-secret authority remain separate from repository access.

## Development and publication

Website source lives in `creator-hub/hub/client` and `creator-hub/hub/server`. Run `npm run build:site` for website changes and inspect the actual affected behavior. Project-card content lives in `content/projects/`; validate content with `npm test`, `npm run validate` and `npm run build`. Keep commits focused and include relevant evidence in the commit, PR or task handoff.

For project descriptions, preserve creator attribution and link supporting public evidence. Do not claim a project is secure, audited or deployed unless the evidence establishes that claim. Follow [the community workflow](docs/COMMUNITY_WORKFLOW.md) for listings, capture tools and media. A listing is separate from Council contest eligibility or an award.

A push to `main` triggers the content publishing workflow. Publishing validation must pass before the feed is updated; a successful commit is not proof of a successful publication. Website code deployment uses the hosting setup documented in README.md. After publishing, verify the shared page and its source revision. Forks and unmerged branches are not the published feed.

Use an ordinary revert commit to undo a change. Changes require the reviews and checks described above.
