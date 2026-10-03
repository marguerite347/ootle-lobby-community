# Starter sequence: IDs 01–03, next visual edit

Scope authorized by the user's request to continue IDs 01–03 after accepting the
Super wheel direction. This is an editable starter-sequence proof, not approval of
the full creator film or a finished scored trailer.

Sequence: current Lobby / Press start opening, isolated question and selection,
updated crystal +150 reveal, first wheel 5x / 750, optional Super / 7,500, two quick
question examples across simulated days, wrong answer and explanation, then the
first fictional community exchange leading toward Open Bloom.

Keep full spin motion at normal speed. Editorial cuts may shorten idle holds.
Hold the chosen answer and banked totals long enough to read. The source captures
and exact edit offsets are part of the deliverable; wall-clock capture marks alone
are not reliable frame offsets.

Chat is an explicitly labeled editorial demo overlay, not a live sidebar feature:
Rio: “first run??”
You: “okay i'm staying”
Jules: “try Open Bloom next. trust.”
No live messages, live daily attempts, or real AI credits are used. The daily
montage must say “Across a few days.” The app currently permits one attempt per
UTC day, not multiple daily attempts. Do not show a retry after losing.

Ledger: 150 base, +600 first wheel = 750, +6,750 Super = 7,500. Question teasers are
unanswered and the loss awards zero. The wheel adapter is scripted and separate
from the trivia state machine; this edited sequence is not proof of integrated
settlement. Sound design and score remain pending, as does the Open Bloom chapter.

## Reproduce

Use the reward-proof README for repository assets, pinned dependencies and build.
Preserve the existing 4222 server. Start a NEW disposable trivia-fixture port, e.g.
`CAPTURE_PORT=4225 node creator-hub/capture/creator-story/trivia-fixture.mjs`.
Run `CAPTURE_ORIGIN=http://127.0.0.1:4225 node creator-hub/capture/creator-story/capture-starter.mjs PRIVATE_TAKE_DIR`.
The optional `CAPTURE_SHOTS` comma list restricts recapture, using a fresh fixture
for the question. `captureLayout=site` retains the real homepage for the opening;
all non-trivia writes remain blocked and the chat sidebar is hidden.

Select source takes after frame inspection. Write `edit.json` with `shots` entries
(name, source seconds, length seconds, title, detail, layout), and copy the repo's
Poppins 800 font into the selected take as `poppins-800.woff2`. Layouts are full,
question, reveal, loss and chat. Renderer: from video-templates,
`node scripts/render-starter-proof.mjs SOURCE_DIR REVIEW_JSON OUTPUT_DIR`.
Use the saved scoped review record, never imply full-film approval. Inspect decoded
frames at every cut plus full playback in a real player. Record audio review honestly.

Reuse receipt: existing Chrome/Metal Playwright capture, real React UI, disposable
createDailyTrivia fixture, accepted Spline/crystal/Envato assets, pinned Remotion.
No new paid asset or rendering pipeline. Selected current sources and render belong
in this private repository via Git LFS, with hashes in the asset manifest.
