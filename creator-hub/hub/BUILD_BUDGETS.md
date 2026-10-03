# Big impact, small budget

Open `/skills?board=budget#creator-arena`. Creator Arena has separate Downloads and Small budgets views. This is a local prototype for recognizing resourceful builds, not an audited cost or prize system.

## For creators

Create a profile with portfolio and activity visibility enabled. Share a demo link, version, description, category and stage. Report USD cash spent through that version: AI/compute/allocated subscriptions, assets/licenses and other costs. Include failed attempts and explain how subscriptions, reused work, hardware, labor and donated work are treated. Free-credit value and hours are optional and remain unknown if omitted.

Another creator must attest they tried and recommend the version before it ranks. Recommendations are a coarse community signal, not an independent review or measured impact score. Eligible projects rank by ascending reported cash within the same category and stage; equal amounts share rank. Builds are attributed to creators, rather than combining incomparable projects into one efficiency score.

Edit a report to correct costs or update the version; this clears prior recommendations. Withdraw removes it. Portfolio/activity opt-out hides entries and excludes that profile's recommendations. Download rankings are unchanged. No real reports are seeded or inferred from agent usage limits.

## For agents

Use the creator's existing profile edit key in `Authorization: Bearer …`. Do not put keys in URLs or reports. Obtain actual cost records and permission to share before submitting; do not infer dollars from token counts or a flat subscription without an explicit allocation method. Do not endorse a build without the creator's requested review and evidence of trying that version.

- `GET /api/build-budgets` returns `{items:[...]}` with public fields, `revision`, `recommendations` and `costStatus:"self-reported"`. Reviewer IDs and stored recommendation records are omitted.
- `POST /api/build-budgets` creates a report, or updates the same creator/demo URL with `expectedRevision`. Required: `creatorId`, `title`, `description`, `demoUrl` (HTTP/S, no embedded credentials), `version`, `category` (`game|app|media`), `stage` (`prototype|release`), `costs` (`ai`, `assets`, `other`, numeric USD), `scope`, and `shareConfirmed:true`. Optional `creditUsd` and `hours` accept nonnegative numbers or null. Editing keeps the demo URL; withdraw and resubmit if it changes.
- `POST /api/build-budgets/:id/recommend`: `creatorId`, `expectedRevision`, `tested:true`. No self-recommendations; one recommendation per profile per revision. This records an attestation, not a server audit.
- `POST /api/build-budgets/:id/withdraw`: owner `creatorId` and `expectedRevision`.
- Invalid input: 400. Wrong credentials: 403. Missing/unowned entry: 404. Stale revision: 409.

## Implementation and validation

Reuses Creator Arena, profile edit-key authentication and runtime JSON storage. No new provider, dependency or telemetry connection. Canonical records live in `CREATOR_HUB_DATA_DIR/build-budgets.json`, written atomically with file mode 0600, for the existing single-process Hub.

Selection trial: domain/HTTP checks established authenticated submission, recommendation deduplication, revision invalidation and withdrawal before the full test run. Client tests cover eligibility, scope separation, ties and unknown values. Browser submission used a separate test instance, never the live creator library. Validation: 143 server tests, six Neon House tests, 42 client tests and production build passed.

Limits: reported USD only; no receipts integration, identity uniqueness guarantees, verified demo ownership, automated demo validation or payouts. The one-recommendation threshold is a pilot rule, not a comprehensive definition of quality. Private-team hosting remains deferred.
