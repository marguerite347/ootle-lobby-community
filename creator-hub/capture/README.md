# App webpage capture (real footage for previews)

Records short clips of the **live community app webpages** listed in the Ootle app directory, for use as Ootle Lobby card previews. This is real third-party footage — accurate, but **not an endorsement and not a security review**. Apps that need a wallet or interaction will only show their landing state.

Follow the [community submission and recording workflow](../../docs/COMMUNITY_WORKFLOW.md). Capture real footage where a site is reachable. For unavailable apps retain a reviewed source image; do not substitute generic generated cover art or pretend a capture succeeded.

## Requirements

- Node ≥ 20 and `npm install` here (pulls `playwright-core`, no bundled browser download).
- An installed **Chrome/Chromium** (auto-detected; or set `CHROME_PATH`).
- System **`ffmpeg`** on `PATH` (used for transcoding).
- Network egress to the app domains. Some sites may be unreachable (TLS/redirects) and are skipped.

## Run

```bash
npm ci
npm run setup:video          # install the pinned Playwright video encoder
npm test
npm run capture              # reads apps.json -> out/<slug>.mp4 (+ poster + manifest.json)
# or: node capture-apps.mjs apps.json out
```

`apps.json` holds `{ name, url, category, status }` per app (seeded from the directory, read 2026-09-21). Outputs land in `out/` (git-ignored); large media never goes in Git.

Each clip trims the initial loading period, holds the hero, smoothly scrolls up to 1,800 pixels over five seconds, then returns over five seconds with matching easing. Output is a muted 12-second H.264 MP4. Short pages stay in view; apps requiring login or wallets show only the public landing state.

A failed capture is retried once in the same browser session, which recovers the observed first-recording encoder failure.

Each run writes `out/manifest.json` recording, per app, the captured URL, whether capture succeeded, and a timestamp — so a preview can be traced back to its source and refreshed.

## Honest scope

- The clip is the app's **public webpage**, captured passively (load + smooth eased scroll). No credentials, wallet connection or interaction beyond scrolling.
- Do not present a capture as a verified/working transaction or as gameplay. Testnet status and "not an endorsement" carry through from the directory.

## Populating the hub

Captures are wired onto the Discover cards as `resource.preview` (matched by canonical URL, then title slug). To assemble everything in one step, from `creator-hub/hub`:

```bash
npm run previews   # capture webpages (best-effort) -> prepare served dir -> audit missing previews
```

`npm run previews` runs this capture tool, then `prepare-previews.mjs`, and audits missing source-specific previews. Runtime output is ignored. The public repository includes a **curated seed of 14 reviewed clips and posters** in `hub/data/seed/previews/`; see the [media library](../../docs/MEDIA_LIBRARY.md). Runtime clips overlay that seed after assembly. Automatic capture of new submissions is not installed.

Capture uses a fresh, sandboxed browser context. macOS and Linux Chrome paths are detected; use CHROME_PATH elsewhere. Run as a non-root operator where the Chromium sandbox is available. HTTP errors, navigation failures and MP4/poster failures are marked unsuccessful. Transient recordings are removed. App names must have unique nonempty output slugs. Inputs are operator-reviewed URLs, not an untrusted public capture API.

## Playback and recurring operation

The hub uses one shared media component for grids, Home carousels and detail pages. Muted clips play while at least 15% visible and pause offscreen. The poster stays visible until playback actually starts. Reduced-motion preferences disable automatic motion; hovering enables a preview. No hover is needed for the normal motion setting.

The `npm run previews` command uses these capture changes automatically. This is an on-demand pipeline, not an installed recurring scheduler. Before configuring a scheduled run, provide an awake host, Chrome, ffmpeg and persistent runtime storage. Capture to a staging directory, inspect manifest failures and retain last-good clips before assembling the served directory. Do not replace working recordings with failed attempts. Verify `/learn` and a visible app clip after rebuilding; merging code alone does not move media.
