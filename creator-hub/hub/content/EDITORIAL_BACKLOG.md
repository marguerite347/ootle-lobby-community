# Creator Journal: editorial backlog and operating plan

## Live starting point

Three original, reviewed starter articles are published in `blog/`: one good game loop,
a meaningful Riff, and the resource-first agent workflow. Sources link to the Hub's
actual journeys. Each has distinct editable animated SVG artwork, title, description,
author/date, related articles and a clear next action. Public pages are `/blog` and
`/blog/:slug`; the header and footer link to the journal.

## Source-to-story cadence

Run `node scripts/refresh-journal.mjs` from the hub. The versioned resource seed plus
`server/challenges.mjs` provide calendar, current brief, evidence and resource candidates.
The journal also shows the current and next challenge from the live calendar on each page load.
The generator creates idempotent weekly drafts with source hashes. It never overwrites
published posts or claims imported tools are newly released or verified. Resource seed
freshness is retained in the draft so an editor can detect old research inputs.

`.github/workflows/journal-drafts.yml` prepares drafts every Monday at 13:00 UTC and
on manual dispatch. GitHub must enable Actions/schedules for this to run. Artifacts
last 30 days; download, review and commit an accepted article to `content/blog/`.
This schedules **draft preparation**, not automatic publication or email sending.
Only `status: published` articles with a review date and nonfuture publication date
appear. Refreshing the page never spends generation credits.

## Backlog (implementation and editorial acceptance)

- [x] Publish three original evergreen starting articles, not duplicated catalog text.
- [x] Create brand-aligned, editable motion artwork; support reduced motion and Effects off.
- [x] Server-render article text and article metadata for direct URLs; unknown slugs return 404.
- [x] Add RSS and article sitemap, enabled once PUBLIC_SITE_URL is configured.
- [x] Generate weekly research drafts from resources and the challenge calendar.
- [ ] Editorial queue UI: compare source changes, assign reviewer, preview, approve,
  schedule and withdraw; preserve revision history. No auto-publish on source ingestion.
- [ ] Expand source adapters to approved public community releases and contest entries.
  Acceptance: contributor permission/credit, version-pinned links and no private logs.
- [ ] Article-specific static Open Graph exports from the approved cover designs.
- [ ] Connect canonical public domain, submit sitemap and validate structured data on deployment.
- [ ] Add article search/category archive when enough stories exist to justify more controls.
- [ ] Connect email provider with double opt-in, preferences and unsubscribe; verify end-to-end
  with a consented test address, provider receipt and no local PII persistence.
- [ ] Weekly dispatch: curate an article + challenge + calendar event. Review in provider
  before sending; do not send from source refresh or the draft-generation action.
- [ ] Confirm event locations, registration destinations, date changes and launch status
  before introducing live event claims; the launch date is a user-provided planned time.
- [ ] Measure qualified article-to-project visits and successful first builds using
  consent-aware aggregate events, not a raw subscriber tracking dump.

## Next stories to commission

1. **Make it yours** — compare an original and a rule Riff; use the week 2 brief.
2. **Better together** — an illustrated guide to composing two reusable parts, tied to week 3.
3. **Listen, then improve** — a consented playtest story with before/after evidence, week 4.
4. **Your first Ootle prototype** — use only validated TariSkills examples and state the
   local/testnet/mainnet boundary; native L2 token naming is TARI.
5. **Small budget, strong result** — interview a willing creator, disclose actual costs
   and count failed generations instead of inventing savings.

## SEO and quality rules

Write for a specific creator question, use a descriptive title and one H1, include
useful original guidance and supporting links. No keyword stuffing, fabricated activity,
guaranteed rankings, stale contest dates, unsourced launch claims or bulk scraped copy.
Every published article needs human/agent editorial review, a source check, metadata,
distinct art and a useful next step. Published content is Git-backed and portable.
