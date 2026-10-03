# Contributing and accepting edits

## October listings, capture tools and media

Follow [the community workflow](docs/COMMUNITY_WORKFLOW.md) to monitor new submissions, add project records, identify elements used, record demos and contribute reviewed media. The monitor is a public read-only review queue; it cannot approve or publish entries. All accepted listings are shared through the same published feed.

## Contributors

Keep one focused change per pull request. For design or functionality changes, edit the website source and include before/after screenshots plus the results of `npm run build:site`. For project-card copy, use content/projects/. Explain the correction and link directly to supporting public evidence. Plain text only; no HTML, scripts, credentials, wallet secrets, personal contact information or unpublished work. Technology links must use HTTPS. Avoid claims that a project is secure, audited or deployed unless the linked evidence establishes that claim.

The editor uses **Files changed** to see the before/after text and can comment on specific lines. Contributors can push revisions to the same proposal. Community reactions help discussion but do not automatically approve a change.

## Editors

Check the source, the rendered wording, creator attribution and the automated validation result. GitHub enforces a fresh code-owner review and resolved conversations. Merge only the version you reviewed. The repository’s deployment runs only from main; forks and pull requests cannot publish to the accepted feed.

GitHub marks conflicting proposals and requires an up-to-date branch before merging. Resolve conflicts deliberately, then obtain a fresh approval; do not silently overwrite a newer accepted correction.

After merging, check the **Validate and publish** run and refresh the live Lobby. The source commit is included in the published feed and exposed by the Lobby content API. Content caching means publication is not necessarily instantaneous.

To undo an accepted change, use GitHub’s **Revert** action on the merged pull request, review the resulting proposal, and merge it. This preserves attribution and history. Avoid rewriting main or deleting its history.

## First-version boundaries

Review, discussion and acceptance happen on GitHub. Website code and community content are both open for proposals. The Lobby provides direct editing and proposal links; a custom in-page editing drawer, pending-count badges and on-page review tools are future work. No GitHub credentials or write-capable tokens are embedded in the public site.
