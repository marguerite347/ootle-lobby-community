# Trivia proof sources

These are isolated production tools, not live reward services. Read TRIVIA-SEQUENCE.md for the approved scope and truth boundaries.

1. Keep the isolated creator-story application running on 4222. Never point reward writes at 4198 or 4210.
2. Run `node trivia-fixture.mjs` from this directory. The proxy owns private temporary trivia state on 4223. Restart only this fixture to reset a take.
3. Run `node capture-trivia.mjs /absolute/private/output`. Raw media and fixture data stay outside git.
4. Inspect actual decoded frames. Capture marks are wall-clock timestamps and can drift from video time.
5. From `creator-hub/video-templates`, run `node scripts/render-trivia-proof.mjs /absolute/private/output /absolute/project/state.json /absolute/private/render-output`. Canonical brief and storyboard approval are checked by the renderer. It produces separate 15-second and 10-second timing samples.
6. Inspect frames, playback, duration and framing. These are silent timing studies. They are not an approved scored proof or a finished trailer.

The editable 25-second timeline is `creator-hub/video-templates/src/trivia-proof/index.tsx`. Source times and crop centers correspond to take v2. Recapturing requires checking and updating them. Licensed audio is not bundled. Do not accept a signed-in badge alone as an asset license receipt.
