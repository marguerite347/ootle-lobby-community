# Walkthrough delivery and agent handoff

> Dated record of the September 22, 2026 take from the earlier instance. The Signal Garden (Aurora Garden) build/play and Neon House chapters it describes were removed with those games in the 2026-09-26 fresh start; see README.md for the current storyboard.

Recorded September 22, 2026 from Creator Hub commit
`be44bc43b7e9aeba2a978adcb8659deb61247f6d`.

## Delivered artifact

- `Tari-Creator-Hub-Complete-Walkthrough.mp4`, 949.96 seconds, 1600 × 900 H.264, AAC narration.
- 29 MP4 chapters, embedded English subtitles, external SRT/VTT, transcript and HTML chapter player.
- SHA-256: `fe7aeee9ca11291ec3c0c38047693aa71455a98db3a54ca4023a317561b6ac99`.
- Media is stored outside Git in the user's `Movies/Tari-Creator-Hub-Walkthrough` directory. Reproducible sources live in this directory.

## Verified behavior

Full rehearsal and full real-time capture completed all 29 chapters with no browser page errors. Real UI actions included skill/workflow downloads, a demo profile, original audio upload, NFT draft configuration, revision fork, component editing, ComfyUI export, revision comparison, playable Aurora Garden publication, gather/bloom/upgrade gameplay, a Neon House winning run, and expandable contest/entry sections.

The recording used an isolated data directory on port 4191. It did not contaminate the normal Hub's analytics or create on-chain transactions. Existing media was shared read-only. The tour explains which capabilities are local, proposed, drafts or exports.

## Fixes and rationale

1. Long revision messages overlapped the Fork button. Project.css now keeps the hash and button in a stable row with wrapping copy below. Client build and the real fork interaction passed.
2. Browser screencast timestamps drifted from recording wall time. `sync.py` locates visible chapter labels using OCR; assembly corrects each chapter's timing. All 29 final chapter markers were independently checked against video frames two seconds into each chapter. The full MP4 decoded without errors.
3. One long navigation pause was removed, with captions and chapter timestamps adjusted together.
4. The HTML player needs byte-range serving for reliable chapter jumps. `serve.mjs` supports ranges and exposes only final deliverables, not capture logs or runtime state.

Follow README.md to rehearse and regenerate against a future build. Do not describe this recording pipeline as an automatic scheduled refresh. The voice is synthetic Aria, not a cloned narrator. No background music is added, keeping narration clear.
