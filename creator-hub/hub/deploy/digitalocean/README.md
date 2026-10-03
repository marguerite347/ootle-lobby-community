# Private Ootle Lobby: DigitalOcean migration

Status: deferred migration option, not provisioned or deployed. See the
[developer implementation plan](../../../DECENTRALIZED_HUB_IMPLEMENTATION_PLAN.md)
for ticket proposals, serverless alternatives and the decision to keep prototyping now. Account/team,
region, spending cap and authenticated private access must be selected first.

## Authoritative storage

The GitHub repository holds code, schemas, rules, skills, deployment configuration
and sanitized seed content. It must never hold credentials, private session logs,
creator identity records, runtime management capabilities or private uploads.
Creator projects can be exported to their own authorized source repositories;
do not automatically commit every user's history into this application's repository.

Initial private-team deployment: one Linux Droplet running the existing filesystem
backend with an attached DigitalOcean Volume. Mount it at `/mnt/creator-hub` and
set `CREATOR_HUB_DATA_DIR=/mnt/creator-hub/runtime`. Store projects including their
`.git` histories, builds, previews, profiles, private lessons and analytics there.
Keep all runtime symlink targets within that cloud volume. Use one writer only.
Keep the API on loopback behind authenticated private access; do not expose the
current prototype directly to the public internet. Its non-management write routes
do not yet enforce account ownership.

Separate encrypted backups must cover all runtime state and be restore-tested.
Set an explicit retention period: history clearing does not purge retained backups,
and independent forks and exported games remain independent copies.

Later: move media/builds to private Spaces storage with controlled delivery, and
identity/metadata to a managed database. These are adapter changes, not environment
variable substitutions. Spaces is not a mounted POSIX Git repository. App Platform
local storage is ephemeral and cannot host the current Git/JSON store durably.

## Migration sequence (no data deletion by this document)

1. Confirm team, region, budget cap, private access and backup retention. Provision
   the approved server, persistent volume and backup destination. Keep secrets in
   the provider's secret mechanism, outside the repo and logs.
2. Stop source writes. Inventory the complete runtime plus external symlink targets,
   full Git histories, uploads and referenced media. Include editable film sources,
   voice stems and exports currently held in project directories. Exclude rebuildable
   node_modules, but retain lockfiles and source. Inventory unrelated local capture
   directories separately; they are not all guaranteed to be inside runtime.
3. Copy over an authenticated encrypted connection to a staging directory on the
   cloud volume. Materialize intended symlink contents or recreate cloud-contained
   links; never preserve links to /Users or /tmp on the Mac. Preserve hidden .git
   directories, permissions and private ownership.
4. Compare file counts and SHA256 manifests. Run git fsck for every project and
   verify each HEAD, saved-version count and current state against the source.
5. Start a single server from the checked-out repo using the explicit cloud data
   root. Exercise list/open/fork/save with disposable fixtures, media and playable
   builds, plus version removal in fixtures. Do not test deletion on real projects.
6. Restart the server and restore a backup into an isolated cloud directory; repeat
   the checks. Repair absolute localhost media/editor URLs with supported hosted
   routes before declaring creator workflows migrated.
7. Switch creators to the private cloud URL and verify browser management access.
   Origin-scoped browser keys will not automatically move to a new URL; establish
   secure recovery/transfer before retiring the original browser origin.
8. Record verification evidence and rollback boundary in the PR. After the creator
   confirms the verified cutover, remove local runtime/media copies, migration
   fallbacks and source-log copies covered by the request. Never erase the only
   working copy. No ongoing backup or authoritative data remains on a personal Mac.

## Managed Agents

Optional remote execution for build/render/evaluation jobs. Repo-defined workflows
must use explicit triggers, bounded budgets, scoped tools, access policies and
external evaluation consent. Agent runtime pause/checkpoints are not the Hub's
backup policy. Managed Agents availability is not a 24/7 human-support guarantee.
Do not provision or start billable agents merely because this guide exists.

Sources checked 2026-09-23:
- https://docs.digitalocean.com/products/managed-agents/agent-harness-runtime/concepts/architecture/
- https://docs.digitalocean.com/products/volumes/
- https://docs.digitalocean.com/products/app-platform/how-to/store-data/
