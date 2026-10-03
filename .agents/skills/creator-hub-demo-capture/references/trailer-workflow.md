# Ootle Lobby trailer workflow

## Plan for the requested outcome

Translate the brief into observable criteria: maximum duration, aspect ratios, route/feature coverage, narration clarity, pacing, visual style and delivery format. A September 2026 run delivered a 114-second, 40-shot cut in landscape and portrait; those numbers are an example, not a default requirement. Social performance and virality cannot be verified from a local render.

Use real captured product footage. Show the journey from discovery and reusable starters through creation, assets, workflows, gameplay, learning and community. Describe Ootle launch ambitions as ambitions unless release evidence establishes otherwise. Label generated concept visuals and development previews. Do not present generated artwork as working product UI.

## Reuse the animation editor

Inspect `creator-hub/video-templates/package.json`, compositions and render entry point. Use its pinned Remotion/React versions and established Tari typography/palette. Read the repository video workflow documentation. Keep an editable composition, shot manifest, source timestamps, captions and separate audio stems. Put large private captures and renders outside Git; commit reusable skill instructions and approved source only.

Make a short representative render before the full export. Check the opening, a dense product scene and the closing CTA in each layout. Camera transforms should enhance focus without shrinking important text below readability. Compose portrait independently instead of blindly cropping landscape. Match captions to narration phrase boundaries; avoid awkward captions that concatenate the end of one sentence with the start of the next. Fixed word-count chunks can leave orphan words such as “coming.” on screen: inspect every caption group before full rendering. When available, reuse local ASR word timestamps, preserve authored brand spelling and invalidate alignment when the audio hash changes.

Before selecting a voice engine, read a voice-production skill as well as a generation API guide. The shared catalog includes `qwen3-tts-production` and official ElevenLabs speech, effects and music skills; imported instructions do not establish provider access. Game sound-design skills cover mixing but do not replace voice casting.

For a difficult performance brief, use a small casting set with the same natural script. Keep direction concise and separate from spoken words. After a user rejects a voice as strange or overacted, preserve that take as rejected, simplify direction or change the voice candidate, and assess the new short audition before producing a full narration. Do not escalate stacked emotion adjectives, all-caps text and punctuation together and then assume the result improved. Record which candidate was selected; use a supported fixed voice or reference-conditioned continuation to keep identity consistent across scenes. A repeated seed in separate VoiceDesign calls is not evidence of identity consistency.

Use the configured voice/audio capabilities that are actually available. Give the voice emotional direction and space for dramatic pauses; do not claim a performance was listened to when only technical audio checks ran. Disclose synthetic narration. Preserve original/licensed music provenance and duck the score beneath speech. Reference marketing examples for pacing and composition without copying unlicensed footage or implying verified viral results.

## Verify the deliverable

Render into a temporary output filename, finalize audio/muxing, then atomically replace the reviewed file. Never stream a file while the renderer is overwriting it. Check duration, dimensions, codecs, full decoding, audio presence and opening/middle/closing images. Black-frame detection supplements visual review; it does not prove card playback or visual quality.

Open the final exported file in an actual player and observe advancing nonblack frames. Separately verify the delivery page. In one September 2026 run the MP4 decoded and played in QuickTime while Codex's embedded browser crashed; this is a known observed fallback case, not a universal codec diagnosis. If encountered, offer a verified native-player download and editable timeline, disclose the browser limitation and do not leave a failing embedded player as the sole handoff.

Record which checks were technical, visual or auditory, plus exact remaining limitations. Include absolute artifact links, editable project location, reproduction commands, source revision and media provenance. Do not call local export validation a deployment or publication.

## Script and story before narration

Discover copywriting and copy-editing resources as part of the initial trailer audit. A successful audio file cannot rescue flat copy. Build a short story with a hook, a creator action, visible product evidence, a payoff and one specific next step. Use the imported marketing-copywriting and marketing-copy-editing skills for the message and editing passes; retain the creative brief and exact spoken script with the project. Keep performance cues out of TTS dialogue. When the user changes the script, pause synthesis and regenerate only changed lines after the revision. Do not claim virality or audience validation from an editorial self-review.

### Game-to-platform showcase acceptance

A technically correct tutorial is not creative acceptance of a marketing showcase. For a game/platform reel, demonstrate a consequential playable decision and its result, then connect that result to an actual creator workflow: source project, exact-version fork, changed executable, and parent attribution. A project fork alone is not proof of a new playable build. Do not imply on-chain ownership, rewards, adoption or interoperability from local project lineage.

Apply camera and VFX skills in implementation, with evidence: distinct camera compositions; effects emitted by real gameplay events; readable controls; reduced-motion behavior. List the actual technique used, not just the skill name. Gameplay must remain understandable without the effects. If the creator asks for a complete pass, do internal checks and iteration before presenting the combined result.

Capture correction established with the WebGL House film: `Date.now()` markers around navigation/startup did not precisely align with the video recorder's PTS. Inspect source frames and action/navigation boundaries, preserve reviewed edit decisions, and recheck every cut after preparation. Do not assume an HTTP response, elapsed wall-clock marker or successful render proves the intended shot appears. Label still comparisons as captured stills, keep gameplay normal-speed, and disclose holds or compressed navigation.
