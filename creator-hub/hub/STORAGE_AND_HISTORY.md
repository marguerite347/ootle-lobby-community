# Storage and creator history

Projects are server-side standalone Git repositories under
`CREATOR_HUB_DATA_DIR/projects/<id>`. Save state commits files in that repository;
attached catalog URLs remain references, not downloaded source. The repository's
`.git` directory contains version objects.
Cover media uses `CREATOR_HUB_PREVIEWS_DIR` or the runtime `previews` directory.
Creator profiles, analytics, management key hashes and private lessons use runtime
storage too. Browser local storage holds profile/management capabilities and consent;
it is not the authoritative game/version store. Player save games are game-specific
and are not automatically backed up by saving a Hub project.

## Persistence

The repository owns the code and storage contract; authoritative creator data lives
in approved cloud storage. A personal Mac must not be the permanent store or backup.
See [DigitalOcean migration](deploy/digitalocean/README.md) for the staged cutover,
private access, backup and restore requirements. Existing local data is a temporary
migration source only and must not be deleted before verified cloud restoration.

`npm run start:persistent` requires Linux and an explicitly configured existing
absolute CREATOR_HUB_DATA_DIR. It no longer chooses a Mac directory automatically.
This startup check cannot attest that a path is a cloud volume: operators must verify
the mounted storage, symlink destinations and backup restoration. Ordinary `npm start`
remains available for disposable development fixtures; it is not a hosted-storage
solution. No cloud account or resource has been provisioned by this change.

## Creator controls

Projects → Manage my projects → Manage opens the project’s saved-version controls.
The library lists projects with a management key in this browser; All projects remains
available for older projects and access recovery.

Project → Manage project & saved versions:

- Delete one older saved version: reconstruct retained snapshots without that commit.
- Clear older history (default): keep current files and playable game, with one new
  baseline commit. New saves continue normally.
- Delete project source: remove the project repository. Published build artifacts,
  external media and independent forks are separate and remain available.

The UI first reviews the removal and requires typing the project title. Cancel
returns to the selection without making changes. Technical details and key recovery
are tucked into Advanced. The API requires a project management key, exact project-ID
confirmation and current expectedHead. New create/recipe/fork responses return managementKey once;
the browser keeps it locally. Never share it in a URL, project state or public log.
The server stores only its hash outside project repositories. Current version cannot
be individually removed; unsaved working changes block history rewrites. Surviving
versions receive new commit hashes, so old source-version links can break. File content
that remains in retained snapshots is deliberately preserved. Git reflogs/unreachable
objects in this repository are pruned, not merely hidden from the interface.
Independent clones, downloads, release artifacts and retained backups cannot be recalled.
This is not complete account-data erasure or secure physical disk sanitization.

Existing projects have no recoverable ownership from an author display name. A local
storage administrator may provision their first management key:

```
CREATOR_HUB_DATA_DIR=/path/to/runtime node scripts/recover-project-management.mjs PROJECT_ID
```

The output is secret. Enter it into that project's management-key field. Provisioning
refuses to overwrite an existing key. Do not expose this recovery script over HTTP.
Production hosting still needs authenticated accounts, ownership enforcement on all
writes, secure account recovery and HTTPS; these local capabilities are not a complete
multi-user authorization system.

Agents POST `/api/projects/:id/manage-history` with Authorization: Bearer KEY and
`{action, expectedHead, confirmation: PROJECT_ID, ref?}`. Actions are `delete-version`,
`clear-history`, `delete-project`. For delete-version, ref is the full 40-character
hash. A 409 requires reload/review, never a blind retry. This guide is not authorization
to erase user data; wait for the creator's explicit destructive-action request.

Insights → Clear my recorded activity removes analytics for session identifiers still
held by that browser and turns reporting off. Previously lost identifiers, other
browsers, comments, profiles, marketplace events and private lesson drafts are not
included. The service remembers cleared session identifiers to reject in-flight
replays. Games/project versions are unchanged by activity clearing.
