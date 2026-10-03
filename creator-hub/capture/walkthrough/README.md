# Narrated Ootle Lobby walkthrough

The storyboard covers discovery, resource detail, learning/community submissions,
skills and profiles, game foundations, recipes, assets/NFT drafts, a project
fork with recipe/workflow edits and history, video exports, effects,
challenges/contests, insights and source freshness. The earlier Signal Garden
build/play and Neon House chapters were removed with those games in the
2026-09-26 fresh start. It demonstrates the real UI.
Synthetic Aria narration, visual focus outlines, chapter labels and captions are
presentation additions, not simulated product functionality.

## Reproduce

1. Build the current Hub client. Install capture dependencies using the existing
   `creator-hub/capture/package-lock.json`. The recorder uses installed Chrome,
   `playwright-core`, `ffmpeg`, `ffprobe` and Tesseract with English OCR.
2. Create a **private isolated runtime directory**. Copy `hub/data/cache` and
   `hub/data/projects` into it. Start the same Hub build on port 4191 with
   `CREATOR_HUB_DATA_DIR` set to that directory, `CREATOR_HUB_REFRESH_MS=0`, and
   `CREATOR_HUB_PREVIEWS_DIR` pointing to the existing preview media directory.
   Do not copy private runtime data into this repository. Create or pick a saved
   project in that instance and set `TOUR_PROJECT` to its id for the fork chapters.
3. Set `TOUR_OUTPUT` to a local output directory and optionally `CHROME_PATH`.
   Run `python3 creator-hub/capture/walkthrough/prepare-demo.py "$TOUR_OUTPUT"`
   from the repository root to generate the original upload demonstration chime. If `TOUR_OUTPUT` is unset, output defaults to a folder under your home `Movies` directory.
4. Install `creator-hub/capture/walkthrough/requirements.txt` into a Python environment. From the
   repository root, run `python creator-hub/capture/walkthrough/narrate.py "$TOUR_OUTPUT/audio"`.
   This sends the authored narration text to the speech service. It uses the
   generic `en-US-AriaNeural` voice, not a cloned person's voice. No tokens are
   needed. Delete the corresponding MP3 and words JSON to regenerate changed copy.
5. From the repository root run
   `node creator-hub/capture/walkthrough/record.mjs --dry-run`.
   Rehearsal creates real local profiles, downloads, assets and project revisions
   in the **isolated instance**, so reset that instance before the final take.
   `TOUR_START` can resume inspection at a one-based chapter, but final recordings
   must start at chapter 1 to preserve prerequisite state.
6. From the repository root run `node creator-hub/capture/walkthrough/record.mjs`,
   then `python creator-hub/capture/walkthrough/sync.py "$TOUR_OUTPUT"`,
   then `python creator-hub/capture/walkthrough/assemble.py "$TOUR_OUTPUT"`.
   Capture proceeds at normal speed. Synchronization measures the visible chapter
   markers in the actual video because browser screencast time can drift from
   wall time. Assembly corrects that drift per chapter and combines the recording with
   normalized narration, MP4 chapters and selectable English captions. The
   assembly removes navigation waits longer than two seconds, preserving a short
   transition and adjusting captions and chapters together. The adjacent HTML player includes a clickable chapter directory and VTT captions.
7. Review chapter screenshots and actual playback, test caption/voice timing,
   decode the MP4, and inspect `timeline.json` for errors and source identity.
   Keep runtime identities, edit keys and private copied state out of deliverables.

## Output and maintenance

Deliver the MP4, `index.html`, `captions.vtt`, `captions.srt` and `transcript.md`
together. Run `node creator-hub/capture/walkthrough/serve.mjs "$TOUR_OUTPUT"`
for the localhost player on port 4192. The server supports byte ranges for
chapter seeking and exposes only the five deliverable files, not raw logs. The source
storyboard and capture/assembly instructions live here; large recordings and
runtime data do not belong in Git. This is a manual reproducible recording flow,
not a scheduled refresh service. Re-record affected chapters when the UI or
capabilities change. A clean full take is preferred for end-to-end state changes.

The recorded build distinguishes:

- Saved configuration vs external deployment.
- Wallet identity vs signed transactions or on-chain rewards.
- NFT/listing drafts vs minting and checkout.
- A workflow diagram or ComfyUI export vs actual tool execution.
- Local learning events and download signals vs revenue and retention analytics.
- Weekly pilot goals vs the Council's separate monthly contest and prizes.

## Review handoff

During rehearsal, long version-history messages pushed the Fork button under
an adjacent panel. `hub/client/src/pages/Project.css` now keeps the hash and
button in one grid row and wraps the message below them. The real fork click,
configuration save and recipe comparison are exercised by the walkthrough. No force-click is used to disguise the layout defect.
