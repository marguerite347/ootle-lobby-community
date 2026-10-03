# Template marketplace: discovery and indexing design

Proposed architecture, 2026-09-19. This extends CH-002/CH-003 for a large catalog; it does not select a search vendor, implement a marketplace or assume paid transactions. CH-018 tracks the design and delivery checkpoints.

## Product model

Design for a creator arriving with an intention: “make a deckbuilder,” “add a crafting economy,” “learn private state,” or “measure an optional ad campaign.” Let them find a complete starter, a reusable component, a recipe combining components, or a supporting resource. Keep native Ootle templates visibly distinct from external game-engine templates, integrations, assets and educational material.

The first screen is a searchable template library, not an operations dashboard. Use prominent search, a few goal-based entry points and curated collections. Keep deep filters behind a Filters control on small screens. A simple list view should remain available alongside visual cards. Browsing is public when the hub launches; installing tools, connecting wallets or adopting analytics is not a browsing requirement.

### Main journeys

1. **Find:** search by goal or browse a collection; narrow by environment, purpose, skill level and compatibility.
2. **Understand:** see what it does, how it works, a demo, requirements and actual usage evidence.
3. **Evaluate:** compare a small selection by supported versions, license, dependencies and verification.
4. **Use or Riff:** choose a specific release, open its source and follow its tested setup guide. Suggested combinations are labeled separately from tested ones.
5. **Contribute:** submit a template, link a Riff, correct metadata, or add a verified usage example.

## Information architecture

| Collection type | What belongs here |
| --- | --- |
| Starter projects | Complete runnable examples with setup and deployment context |
| Components | Reusable mechanics such as inventory, crafting or community goals |
| Composition recipes | Documented combinations of named component releases |
| Integrations | Optional external services such as Meta measurement |
| Assets and tools | Art/audio/UI packs, editors, debugging and simulation tools |
| Learn | Walkthroughs and TariSkills linked to the templates they explain |

Within Templates, classify by purpose and environment independently. A “shop” mechanic may appear in several genres. A “privacy” tag is a topic, not a guarantee. Avoid a giant fixed category tree or a separate disconnected catalog per ecosystem.

## Search and facets

Index title, concise purpose, description, capabilities, curated tags, creator, documentation headings and attributed usage summaries. Prioritize exact names, aliases and keyword relevance; consider semantic retrieval later as a supplement. Compatibility and permission filters must apply to all retrieval paths.

Suggested facet groups:

- **Build goal:** genre, mechanic, use case and intended audience.
- **Resource type:** starter, component, recipe, integration, asset or tutorial.
- **Environment:** Tari L1, Ootle, external engine/framework, language, runtime and platform.
- **Readiness:** conceptual, runnable example, tested release, deprecated; network separately recorded.
- **Requirements:** dependencies, skill level, external service accounts and deployment prerequisites.
- **Reuse:** license, availability and cost if applicable. Unknown license is not free-to-use.
- **Evidence:** verified demo, tested compatibility, documented usage and last checked date.

Use a small controlled vocabulary with stable IDs and synonyms, plus moderated community tags. Maintain aliases and redirects when categories change. Count facet matches under the current query, offer clear reset controls and preserve query/filter/sort state in shareable URLs. Empty results should explain incompatible filters and suggest related resources without silently weakening constraints.

## Listing and detail design

A card shows name, purpose, resource type, ecosystem, creator, preview, selected release and a concise evidence label. Do not crowd cards with all metadata. Badge definitions must be inspectable.

A detail page has: Overview; How it works; Demo and code; Setup; Versions and compatibility; Used in; Riffs and dependencies. Provide original-source links throughout. “Used in” is a first-class, attributed relationship to a real project, with evidence URL, referenced release where known and verification date. An author's claimed use, a verified deployment and an illustrative example have different labels. Never invent adoption examples to fill empty sections.

For composable components, document inputs, outputs, required resources, state/auth assumptions and extension points. A compatibility matrix records exact tested versions, environment, test evidence and date. Missing evidence means unknown, not incompatible or guaranteed compatible. Assets require separate licenses from source code where applicable.

## Canonical records and relationships

| Record | Key fields and role |
| --- | --- |
| Resource | Stable internal ID, type, creator/team IDs, canonical upstream ID/URL, title, summary, taxonomy IDs, visibility and lifecycle |
| Release | Resource ID, immutable release ID, upstream ref/commit/content hash, version, artifacts, licenses, prerequisites, documented interface and source timestamps |
| Compatibility evidence | Release pair or runtime target, tested configuration, outcome, evidence link and checked date |
| Usage evidence | Template release when known, consuming project ID, source link, claim/verification state and attribution |
| Relationship | Typed edge: depends on, Riffs, used by, explained by, replaces or belongs to collection; provenance and version scope |
| Community annotation | Contributor suggestion or editorial description, moderation record and independent revision history |
| Source observation | Connector/source ID, upstream identity, observed revision, fetch time and freshness/error state |

The canonical catalog and release records are authoritative. Search indexes, cards and analytics are rebuildable projections. Upstream files remain authoritative for their code. Separate imported facts from annotations so refreshes do not overwrite community descriptions. Preserve identity across renamed repositories and moved URLs. Forks/remixes get their own identity and lineage; multiple observations of the same upstream artifact do not become duplicate listings.

A resource page aggregates releases. Search normally returns one resource with a matching release, not hundreds of version duplicates. A filtered search must display the release that satisfied compatibility filters, even if it is not latest. For previews of combinations, bind evidence to the selected versions rather than inheriting a latest-version badge.

## Indexing at scale

Use the shared CH-006 pipeline: discover -> normalize -> validate -> reconcile canonical records -> emit a versioned change -> update search projection. Schema versions and idempotent upserts support backfills. Tombstones handle deletions and withdrawn resources; private/removed content must also be removed from public results and caches. Retain appropriate internal audit history without serving deleted artifacts publicly.

Initial implementation can use database full-text search if measured load permits. Keep an index adapter so a dedicated search service can be substituted without changing catalog identity or UI contracts. Avoid premature vendor selection. Use cursor pagination with deterministic tie-breakers, background indexing, batched updates, rate-limit-aware connectors and bounded retries. Include a dead-letter/replay path and an index-generation swap for complete rebuilds. Show last-good source data as stale during outages; never substitute invented freshness.

Proposed sizing tests, not forecasts: 10,000 resources initially, then 100,000 resources and 1 million release/relationship records. Benchmark representative filtered queries and cold/warm results before selecting infrastructure. Starting acceptance targets: p95 search API latency under 500 ms at 20 requests/second on a documented environment; validated changes searchable within 5 minutes of canonical commit under the tested load. These are adjustable engineering targets, not user-facing promises. Upstream fetch cadence is a separate source-specific contract.

## Ranking and community quality

Default relevance blends query fit and explicit environment matches. Offer New, Recently updated, Most reused and editorial collections as separate sorts. Define reuse through independently evidenced consuming projects, not stars or raw download totals. Trending uses a disclosed time window and defensible change measures; avoid treating incomparable platform metrics as equivalent.

Give new listings a discovery path without fabricated popularity. Separate sponsored placement if introduced. Provide correction, broken-link and licensing-report actions. Listing eligibility and achievement recognition remain separate; Meta setup and token ownership never influence basic eligibility.

## Delivery and validation

1. Model a small representative set of real Ootle resources plus external examples. Record unavailable fields honestly. Prototype search, detail, version selection and submission before bulk imports.
2. Implement catalog schema, migrations, deduplication and a documented read API for UI/agents. Respect visibility consistently; documentation and agent output expose the same verified records.
3. Implement keyword search, facets, collections and shareable URLs. Validate task-based discovery with beginners and experienced creators.
4. Add compatibility evidence, usage links and Riff navigation, plus correction and moderation flows.
5. Load-test, test incremental refresh/rebuild/deletion, and monitor missing/stale records. Expand sources only as coverage can be maintained.

Test renamed sources, duplicate imports, forks, version-specific matches, broken demos, dependency cycles, unknown licenses, unpublished records, stale sources and removed listings. Test accessibility, keyboard navigation and mobile filters. Measure zero-result searches, query reformulation, useful detail views, setup starts/completions, verified reuse and successful submissions. Downloads and clicks are not unique builders or successful installs.

Open decisions: vocabulary seed, submission rights and review workflow, demonstrable initial catalog, runtime/search vendor, abuse handling and evidence verification. Paid listings, checkout, commissions and creator payouts require a separate marketplace commerce design if requested.
