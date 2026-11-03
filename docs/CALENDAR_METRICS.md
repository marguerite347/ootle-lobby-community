# Calendar activity reporting

Owner report: `/calendar/insights`, requiring an owner chat session under the existing authentication system. Tracking does not require owner sign-in. The current production chat has no enrolled owner account; this release does not create one or expand access. Until owner access is configured through the existing operator workflow, retrieve counts with the operator command or authorized database connector. The JSON report is `GET /api/chat/calendar-metrics`. Operators may run `node scripts/calendar-metrics.mjs` with the existing authorized backend environment. Never publish database credentials or raw feed tokens.

## Meaning of the counts

- **Calendar choices:** recorded Google, Apple or download clicks during the last 30 days. Action IDs deduplicate network retries. Opening the options dialog is not counted as a choice.
- **Download requests:** successful requests for a tracked download link during the last 30 days, deduplicated for one minute per link. These are not confirmed file saves or imports.
- **Observed feed links:** Google/Apple links fetched in the last 14 days.
- **Estimated active subscriptions:** links with another fetch at least six hours after their first, and such a repeat in the last 14 days. This excludes a single preview but cannot establish a human subscriber. Shared links, multiple browsers, provider fetch behavior, blocked tracking and unrecognized automation can undercount or overcount.

The combined feed covers Game Night and the Tari Show. Do not add these counts twice or describe them as event attendees. Downloads never count as active subscriptions. There is no retroactive count for existing users of `/community/events.ics` or older downloads. Users of the old URL do not need to resubscribe.

## Storage and delivery

The browser stores a random calendar-link UUID only after opening calendar options. Server-issued provider-specific signatures make stable links; the backend stores only their SHA-256 hashes and timestamps/counters. The UUID is not associated with email, chat account, or personal calendar data. GPC/DNT returns existing untracked links. Raw IP/user-agent are not stored by this feature; a daily keyed IP digest is used only for short-lived abuse limits. Hosting providers may retain their ordinary access logs separately. The dialog discloses link measurement.

Apply `creator-hub/hub/server/calendarMetrics.sql` as an additive provider migration. It creates only the private `lobby_calendar` schema and grants the existing backend identity DML access; browser database roles have no access. No new service, secret, paid analytics vendor or background process is required. The setup reused the provider's `apply_migration` workflow after the optional CLI entrypoint was unavailable; the schema source follows the existing intake module convention.

Raw actions expire after 90 days, cleaned during options issuance; report windows remain 30 days. Abuse buckets expire after two days. Opaque link records remain so old subscriptions keep their identity; no raw token is stored. Repeated feed writes are throttled to once per five minutes per link. HEAD requests, known bots and prefetches do not count. Tracked endpoints use no-store headers, including CDN headers, so later provider checks reach the backend. Conditional 304 responses still represent a provider check. Metrics errors do not change calendar content or prevent delivery. Invalid/retired signatures receive the same public feed without recording activity.

## Acceptance and QA

Before reporting totals, verify the exact live revision, issue one test link set, record/retry a choice, request its feed and download, and read the database and owner report independently. Mark only the known QA token hashes `excluded=true` so they do not inflate the report. Never mark all current rows as tests. Do not change a personal calendar or send invitations for QA. A scripted feed fetch tests telemetry, not Google/Apple acceptance or real subscriber delivery.

Local tests cover persistence between store instances, age-out, activation thresholds, duplicate clicks/downloads, HEAD/bot/prefetch exclusion, signed tokens/provider binding, rate limits, CSRF, owner authorization and fail-open delivery. Calendar tests preserve the existing UID/sequence/timezone semantics. Frontend tests cover stable browser links, safe destinations, privacy signals and measurement failures.

## Resource selection

Reuse: existing PostgreSQL connection with certificate verification, PGlite tests, owner chat session, public iCalendar serializer, provider migration connector and GitHub/Vercel release flow. These capabilities were already installed and verified for chat/intake; a small local store/router trial passed before schema deployment. Generic web analytics would count clicks but not repeat calendar fetches, which is the missing capability addressed here. No new runtime dependencies were introduced.
