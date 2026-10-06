# Community submissions, recordings and project elements

The public home for this work is [ootle-lobby-community](https://github.com/marguerite347/ootle-lobby-community). [Open the Lobby](https://ootle-lobby-preview.vercel.app/#october-submissions) or [suggest an October listing](https://github.com/marguerite347/ootle-lobby-community/issues/new?template=october-submission.yml).

## Contributor access

[Join Lobby and Workbench](https://github.com/marguerite347/ootle-contributor-access/issues/new?template=join.yml) for automatic invitations to both repositories. After acceptance, developers and their agents can commit and push directly. The interim policy in [CONTRIBUTING.md](../CONTRIBUTING.md) supersedes older mandatory-review language; source verification and contest eligibility remain separate.

## What is shared

- Website code, the capture command and tests, editable Remotion compositions, capture skill and recording instructions are in this repository.
- The 14 September project descriptions and component/source labels are in `content/projects/`. Their reviewed records are in `creator-hub/hub/data/contests/september-2026.json`.
- Actual curated preview videos, posters and review hashes are checked in under `creator-hub/hub/data/seed/previews/`. See [Media library](MEDIA_LIBRARY.md) for direct links. This is the portable baseline used by fresh website builds, not a pointer to a maintainer's computer.
- New October project listings live in `content/submissions/october-2026/`. Approved entries publish in the shared JSON feed; every visitor receives the same accepted listings on refresh. `content/contests/october-2026.json` records the last reviewed forum check.
- Built-with elements are evidence-backed `technologies` labels linking to source files, ideally pinned commits. Do not imply that every template in a project's dependency tree was authored by its creator.
- A Lobby card links to the creator's project; it does not copy or relicense their entire application. Their repository remains the source of truth.

Workbench files/drafts are browser-local and exported Riffs are not automatic contributions to this public repository. Legacy hosted project-write endpoints are retired. The new Workbench publication API requires a backend; see [Workbench](WORKBENCH.md) and [development gaps](DEVELOPMENT_GAPS.md). Until connected, share from your own public repository, submit on the official forum, and propose a listing here.

## Monitor October

The official public build contest is [Spooky Secrets, topic 396](https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396). Check the full post stream, not just a cached search result or the topic's reply counter. Discourse moderator actions also appear in the stream and are not submissions.

From the repository root with Node.js 22:

```sh
npm run monitor:october -- --output work/october-monitor.json
```

This is read-only. It fetches every post in the topic stream, including additional batches, ignores the announcement and moderator actions, and emits candidate post links, creator handles, timestamps and content hashes. It classifies posts as new, updated or already listed. It does not copy raw post text/payment addresses, run submitted code, capture arbitrary submitted URLs, judge eligibility or publish cards. An incomplete/error response fails without replacing a previous report.

The **Monitor October submissions** GitHub Actions workflow runs once daily at **09:17 UTC** and can be started manually from Actions **after this workflow is merged to the default branch**. Each successful run creates a 30-day `october-submission-report` artifact and a run summary. Failed runs remain visible in Actions. It has read-only repository permission; it does not send messages, create issues or merge changes. The scheduled workflow is not active merely because this file exists in a PR.

Dedicated-channel delivery is not implemented by this workflow; it is tracked as [OPS-OCTOBER-CHANNEL](DEVELOPMENT_GAPS.md#ops-october-channel).

An editor reviews the report, opens each new/edited public post and checks the project's source. A candidate is not automatically a valid contest submission. Follow official rules; Council decisions are separate. Security Bug Hunt reports use the official private reporting channels and must not be copied into this public registry.

## Add or update an October project

1. The creator posts their entry to the official October forum thread. Updates belong in that original post.
2. Suggest a listing through the issue form, or add `content/submissions/october-2026/<slug>.json` in a direct commit or optional PR. Use one stable slug and source post per project.
3. Record a factual description, creator credit, publicly available source repo, submission/last-edit dates and source evidence for technologies. Do not copy payout addresses. Review eligibility separately; a listing is not a Council endorsement.
4. Run the monitor and update the registry's `checkedAt` and `observedSubmissionPosts` from the successful report. Do not invent an empty check after a network failure.
5. Run `npm test && npm run validate && npm run build`. Website changes also require the production site build. Include source links and recording review evidence in the commit, optional PR or task handoff.
6. After a direct push or merge to main, **Validate and publish** publishes the accepted feed through GitHub Pages. Refresh the Lobby after the successful run (the server caches for one minute). If the feed fails validation, the site keeps its last good snapshot or bundled records. Website code changes currently require the documented maintainer Vercel deploy.

Example shape (documentation only; do not submit this fictional project):

```json
{
  "slug": "your-project",
  "title": "Your project",
  "summary": "What the submitted project actually does.",
  "creator": "Forum handle",
  "sourceUrl": "https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396/5",
  "repoUrl": "https://github.com/creator/project",
  "demoUrl": "https://your-public-demo.example",
  "publishedAt": "2026-10-03T12:00:00Z",
  "updatedAt": "2026-10-03T12:00:00Z",
  "technologies": [
    {"label": "Template used", "sourceUrl": "https://github.com/creator/project/blob/COMMIT/template.rs"}
  ]
}
```

`demoUrl` is optional. `technologies` may be empty until the implementation is verified; never invent labels. Subsequent edits go to the same file. For September copy edits, continue using `content/projects/`; do not move the historical entries into October.

## Record a project

The executable tool is [`capture-apps.mjs`](../creator-hub/capture/capture-apps.mjs), with [setup and scope](../creator-hub/capture/README.md). It creates muted, 12-second public-page clips and posters. It does not demonstrate gameplay or transactions.

```sh
cd creator-hub/capture
npm ci
npm run setup:video
npm test
# Supply an operator-reviewed JSON list, not raw untrusted URLs from a forum scan.
node capture-apps.mjs ../../work/reviewed-apps.json ../../work/captures/october-run-001
```

The input is `[{"name":"Your project","url":"https://your-public-demo.example"}]`. Install Chrome/Chromium and system ffmpeg as documented. Choose a fresh output directory for every run. Never overwrite a good clip with a failed attempt. Review submitted URLs before navigating; the monitor intentionally does not launch the capture tool.

For an interactive game or product walkthrough, follow the [shared capture skill](../.agents/skills/creator-hub-demo-capture/SKILL.md). Use the actual public/current build, record its revision and settings, and show a representative working loop. Label login/wallet/network blockers honestly. Preserve the creator's intended difficulty and settings. The skill supports the browser/window recorder available to each contributor; it does not install a recorder or imply a hosted recording service.

Before sharing, play the saved video and inspect opening, middle and closing frames. Check readable content, motion, clipping and accidental private content/audio. Record what was actually demonstrated; a successful encoder or HTTP response is not playback approval. The current Daily Ritual is the single replayable 3D flow; historical trivia capture receipts are not instructions to revive a retired renderer.

## Share recordings and editable work

For edited promos, use [`creator-hub/video-templates`](../creator-hub/video-templates/README.md): editable compositions, props, render scripts and tests are included. Preserve source props, capture manifests and timing alongside exports. Verify the operator's Remotion license for the intended use. No paid generation service is required for the basic templates.

Upload reviewed larger clips and editable bundles to a public project release or other maintainer-approved durable media host. Link the release in the PR; do not link to `/tmp`, a local server or a contributor's private disk. Retain original credit and rights. Existing curated seed clips remain committed; new large raw recordings stay in ignored output directories. Do not publish private source footage or credentials.

An October listing can add this optional object after playback review:

```json
"recording": {
  "url": "https://github.com/creator/project/releases/download/demo-v1/demo.mp4",
  "posterUrl": "https://github.com/creator/project/releases/download/demo-v1/poster.png",
  "capturedAt": "2026-10-03T12:00:00Z",
  "sourceRevision": "The exact commit or verified deployed build",
  "kind": "public-page",
  "credit": "Recorded by contributor handle"
}
```

Allowed kinds are `public-page`, `walkthrough` and `gameplay`; `posterUrl` is optional. The gallery offers playback controls and shows credit/date. Linking a clip does not silently replace the source or make an unverified gameplay claim.

## Artwork, elements and rights

- [Seasonal illustrations and provenance](../creator-hub/hub/client/public/seasonal/october-2026/GENERATED_ART.md)
- [Daily Ritual asset provenance](../creator-hub/daily-spark/ASSET_PROVENANCE.md)
- [Source-specific preview policy](../creator-hub/VIDEO_PREVIEW_POLICY.md)
- [Editable motion and visual components](../creator-hub/hub/client/src/components/)
- [Brand and typography in the video templates](../creator-hub/video-templates/README.md#brand--typography)

Public availability is not blanket permission to relicense third-party code, fonts, trademarks or artwork. Preserve the provided notices and project credits.

## Projects shared outside contests

Use the separate [Community Projects review and capture workflow](COMMUNITY_PROJECTS.md). It supports public creator posts/repositories, publication provenance, GitHub activity and stars, project-specific forum comments, reviewed video covers, descriptions and component evidence. Workbench's eventual publishing service remains a separate integration gap.
