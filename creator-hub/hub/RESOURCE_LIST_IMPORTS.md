# Game-resource list imports

The named resource lists are now catalog sources, not just activity monitors:

- ellisonleao/magictools
- Calinou/awesome-gamedev
- FronkonGames/Awesome-Gamedev
- stevinz/awesome-game-engine-dev
- BredaUniversityGames/programming-awesome-list
- sindresorhus/awesome (Gaming section only)
- Kavex/GameDev-Resources
- hzoo/awesome-gametalks (README plus GDC.md; resolved from the supplied Reddit discussion)

`server/connectors/gameResourceLists.mjs` reads the listed documents through GitHub,
extracts Markdown list/table entries and categorizes their titles and section context.
It excludes navigation, badges, unsafe URL schemes and non-Gaming sections of the
broad Awesome directory. This is first-level indexing, not recursive crawling of
all linked websites or downloading their assets. Descriptions are generated
membership notes, not copied articles. Each entry has its resource URL, source
revision, fetch time and all observed `listed-in` relationships. Cross-list duplicate
URLs share an ID; their source tags remain searchable. Counts on source cards assign
a duplicate to its first source, while Browse includes its other source tags.

Find entries in Discover using `tag=game-resource-lists`, in Assets via asset and
workflow categories, in Learn for references/talks, and in Create's foundations for
components/starters. Classification is heuristic, not verification of execution or
compatibility. A source's successful read says nothing about its linked sites being
live. Source membership does not mean a resource is free to use. Unknown licensing
does not block discovery; upstream terms remain separate from the list's own terms.

The existing server refresh imports these sources hourly while the server is up.
Failures retain the previous records as stale. The existing six-hour activity monitor
tracks README drift and repository activity. Sources merges those views into one card
per imported list. Neither cadence runs when the Hub server is stopped. Set
`CREATOR_HUB_REFRESH_MS=0` to stop automatic ingestion; monitoring has its separate
`CREATOR_HUB_SOURCE_WATCH_MS` setting. GitHub auth is optional but helps avoid limits.

## Game design skills and readings

The supplied Medium article links to Stanestane/game-design-skills-bundle. Its 62
skill folders were pinned at revision 1868c5635d1937f599ebc918904533e69a194039 in
`skills/vendor/game-design`, registered in `skills/hub-catalog.json`, and attributed
to the upstream author. Bundles include relative supporting files and the upstream
LICENSE/COMMERCIAL-LICENSE.md. They are discoverable and downloadable in Skills and
through `/api/agent-resources`; they are not installed or executed automatically.
Updates are monitored but pinned skill replacements require a reviewed commit.
The Medium article and historical Reddit discussion are separate manually reviewed
reading sources, rather than being presented as active automated feeds.

## Reproduce and verify

Run `npm run ingest -- --only=game-list:ellisonleao/magictools` from the Hub directory
for one source; see `listDefinitions` for the others. Use `--seed` only with an isolated
`CREATOR_HUB_DATA_DIR` initialized from the committed seed, never from private runtime
state. Catalog snapshots in Git must contain public imported metadata only.

Reuse receipt: existing connector/ingest failure retention, scheduled source refresh,
catalog projections and repository skill bundles. Trialed parser output per source
before the full import. Tests cover reference links, tables, context, scope, unsafe
links, URL parentheses and category regressions; full suite/build and live API/UI
checks verify placement and portable bundles. No new runtime dependency or paid model.
