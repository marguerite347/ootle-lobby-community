# Wiki app freshness and creator references

Implemented September 22, 2026.

## Source of truth

The [Tari Wiki Community Application Directory](https://wiki.tari.com/resources:app_directory:start) is canonical for app names, descriptions, website/repository links and reported network/status. The connector reads its public Markdown export and every linked app page in that namespace. It requires no private wiki credentials. Only normalized public directory facts enter the committed seed; never import private namespaces or tokens.

The forum connector remains supplemental. Existing app IDs are retained, preserving stars, comments, project references and preview associations. Wiki fields win overlapping records. Forum-only apps remain. Editorial descriptions and observed forum signals are preserved separately. A source listing does not establish production readiness, a passing runtime test, audited security, or a reuse license.

## Automatic operation

Starting the hub (`npm start`) now starts app-source refresh after five seconds, then one hour after each completed pass. It refreshes the wiki and forum only, without expensive GitHub enrichment. It discovers newly linked wiki app pages and replaces changed facts. SHA-256 revisions capture directory/page changes; fetch time is not mislabeled as the upstream modification time.

`CREATOR_HUB_REFRESH_MS=3600000` is the default. Set `0` to disable, or a value of at least 60000 for a custom interval. Jobs do not overlap within one server process. Run one collector-enabled process per shared runtime data directory; disable collection on other replicas. Do not run a manual ingest concurrently with the app collector.

Incomplete/failed wiki reads retain the entire last-good wiki snapshot and mark it stale. No successful-check timestamp advances on failure. Cache publication uses atomic rename, and the catalog watches both seed and cache paths so repeated renames and first cache creation reload correctly. API requests then use the new snapshot; already-open pages show updates on navigation/reload.

This is an app-process service, not a Codex automation. Local checks run only while the machine and server are running. For continuous refresh, deploy the server on an always-on host with persistent runtime storage. No hosted deployment was performed in this change.

Manual refresh from `creator-hub/hub`, with automatic collection disabled:

```sh
npm run ingest -- --only=tari-wiki-apps,ootle-apps-directory,creator-references --seed
```

The source registry/API distinguishes last successful read from failed attempts. Curated external references retain their editorial review dates and provisional freshness; they are not falsely marked as continuously checked.

## Shared detail design

`client/src/pages/Detail.tsx` and `Detail.css` already render all resource types with the same ShadowTix redesign. No app-specific layout fork was added. New references use that shared page, including source links and freshness disclosure.

## Added resource inventory

`../resources/references.json` contains 16 individual references resolved from the supplied posts and video, including underlying repositories/tools. `server/connectors/creatorReferences.mjs` indexes them into Discover and, for learning entries, Learn. Topic bucket Markdown files retain the supplied post links and original resource links. Two Forbidden Solitaire posts share one record; the Blendi post and repository share one record.

Tools/assets and code examples are distinguished from commercial-game inspiration. No upstream code, paid course contents, voices, downloads or models were installed. No automatic Tari integration is claimed. New entries need individually authored artwork under `../VIDEO_PREVIEW_POLICY.md`; this change does not generate or borrow video covers.

## Validation and maintenance

- Connector tests cover new wiki discovery, stable IDs, Markdown variants, content revisions, incomplete reads and invalid directory links.
- Ingestion tests cover wiki precedence, retained editorial/engagement context, forum-only preservation and wiki outage retention.
- Scheduler tests cover no overlap, retry after failure, shutdown and configuration.
- Reference tests cover unique IDs, resource kinds and compatibility boundaries.
- Future wiki format changes should fail visibly and retain data, then receive a parser fixture and repair. Do not silently turn an unreadable directory into an empty catalog.

Validated locally: 105 server tests and 25 client tests pass. The running 4189 instance completed its initial scheduled wiki/forum refresh. ShadowTix’s updated links and description were verified in the browser; Cinematique was found in Learn, and the Balatro Feel component rendered through the shared detail layout. The live ShadowTix landing page was also opened successfully; no wallet or transaction actions were performed.
