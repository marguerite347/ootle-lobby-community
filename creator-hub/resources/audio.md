# Audio: sounds, music, voice and production

Source check: 2026-09-19. Optional Ootle Lobby resources, not installed tools or connected accounts. This catalog separates downloadable assets, creation software and hosted generation. A software license does not license every sample, voice model or generated output used with it.

## Start here: free assets

| Resource | Best use | Reuse / access |
| --- | --- | --- |
| [Kenney audio](https://kenney.nl/assets) / [Interface Sounds](https://kenney.nl/assets/interface-sounds) | UI clicks, game feedback and starter sound packs | Asset-page game assets are CC0 per [support](https://kenney.nl/support). Start with curated pack links; no supported bulk API verified. Already in our asset provider registry. |
| [Freesound](https://freesound.org/) | Foley, ambience, field recordings and effects | Per-file licenses; prioritize CC0, offer CC BY with credit. Exclude NC from the commercial-ready filter. [License FAQ](https://freesound.org/help/faq/). [API](https://freesound.org/docs/api/) exists, but [commercial API use requires separate arrangements](https://freesound.org/docs/api/terms_of_use.html). Free asset rights do not automatically grant free API use. |
| [OpenGameArt](https://opengameart.org/) | Game music, effects and themed packs | [Per-entry licenses and attribution](https://opengameart.org/content/faq). Filter exact license and preserve author/license text; do not label the whole library CC0. Begin with curated entries. |
| [Sonniss GameAudioGDC](https://sonniss.com/gameaudiogdc/) | Production sound-effect collections | Free bundles under their [bundle license](https://sonniss.com/gdc-bundle-license/), not CC0. Link to source downloads and retain the applicable bundle/version terms; no assumption that raw files may be republished as our marketplace stock. |
| [Incompetech](https://incompetech.com/music/royalty-free/music.html) | Background music, trailers and instructional videos | [Free Creative Commons attribution route](https://web.incompetech.com/music/royalty-free/licenses/); preserve the chosen track's license and required credit. Paid no-attribution option is separate. |
| [Pixabay audio](https://pixabay.com/music/) / [effects](https://pixabay.com/sound-effects/) | Music beds and supplemental effects | [Custom Content License](https://pixabay.com/service/license-summary/), including restriction on standalone redistribution. Link-out discovery, not an unrestricted downloadable mirror. Retain track evidence for platform claims. No audio API assumed. |

Prioritize a small reviewed set of UI, achievement, impact, footsteps, ambience and music-loop examples before bulk ingestion. “Free to download,” “commercial use,” “attribution required” and “may redistribute source files” are separate facets.

## Open-source creation and editing tools

| Tool | Creator use | License / qualification |
| --- | --- | --- |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | Local speech transcription, searchable tutorial transcripts and caption drafts for Capture & Promote | MIT implementation of Whisper inference. Not a music or sound-effect generator. Pin model/version and verify model terms; review generated text and timings before publishing. |
| [jsfxr](https://github.com/chr15m/jsfxr) | Procedural retro game sounds: pickups, hits and UI feedback | Unlicense code. Save parameters/seed with exports for remixing; test the chosen generator and export path. |
| [Audacity](https://github.com/audacity/audacity) | Record, trim, clean up and mix audio | Free/open-source editor; consult its license files for the chosen release and plugins. Imported recordings and bundled extras retain their own rights. |
| [LMMS](https://github.com/LMMS/lmms) | Compose loops, beats and game music | GPL-2.0 repository. Sample/instrument licenses are separate from the program license. |
| [SuperCollider](https://github.com/supercollider/supercollider) | Advanced procedural sound, generative music and interactive synthesis | GPL-3.0 repository; technical rather than beginner-first. Evaluate distribution implications for any runtime integration. |
| [Piper](https://github.com/OHF-Voice/piper1-gpl) | Local text-to-speech for narration and accessibility prototypes | Current GPL-3.0 implementation. Verify each voice model's own model card/license before distributing outputs or bundling models. |
| [Chatterbox](https://github.com/resemble-ai/chatterbox) | Optional expressive speech/voice generation experiments | MIT repository; check selected model and voice/input permissions, hardware and output behavior before integration. Not an unrestricted source of other people's voices. |
| [howler.js](https://github.com/goldfire/howler.js) | Web-game sound playback, controls and audio sprites | MIT. Use as an optional browser playback recipe; engine-native audio may already be sufficient. |
| [Tone.js](https://github.com/Tonejs/Tone.js) | Browser synthesis, sequencing and interactive music | MIT. Useful for music mechanics and procedural audio; not a ready-made asset library. |

Repository identities and displayed licenses checked via upstream GitHub. These are research references, not tested Tari adapters. No plugin, engine or local agent is required to use the resource bucket.

## Optional hosted AI tools

- **[Suno](https://suno.com/):** music concepts and generated songs. [Rights guidance](https://help.suno.com/en/categories/550145) distinguishes free-plan personal/non-commercial output from eligible paid-plan commercial use. Record generation date, plan and applicable terms; upgrading is not assumed to retroactively license earlier outputs. Link out first, with no unofficial API connector.
- **[ElevenLabs](https://elevenlabs.io/):** speech and sound-production workflows. Its [publishing guidance](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform) says free-plan output has no commercial license. Check current product/model/plan terms for the intended voice, sound or music workflow; no blanket “free commercial audio” badge. Credentials belong to the creator, never the repository.

No subscription, generation purchase, cloning or upload is authorized by this resource listing. Begin with link-out tutorials; choose an API adapter only when access, cost and output rights are established.

## Ootle Lobby placement and integration

**Discover → preview sound → inspect rights → use in project → mix into gameplay or promotional clip → export credits.**

- Resource library: Audio bucket with SFX, ambience, music, voice, transcription, editing and runtime categories. Learn carries short engine-specific recipes; template pages can suggest relevant audio without calling external tooling Tari-compatible.
- Asset cards: explicit-play preview, waveform where permitted, duration, format, channels, sample rate, loop points, BPM/key when known, mood and use tags. No autoplay. Provider preview access and download access are distinct.
- Retain provider ID, canonical URL, author, exact license/evidence URL, attribution text, allowed use/redistribution, checked date, source revision/hash and original-versus-generated classification. Unknown fields stay unknown. Tool code license, model license and output terms must have separate fields.
- Project manifest: reference audio asset IDs and revisions, playback settings and credits. Keep originals immutable; store binaries in approved object storage only when reuse rights allow. Do not commit packs or private voice recordings to Git. Export a credits file with project/video assets.
- Capture & Promote: import selected music/SFX, duck music beneath speech and offer whisper.cpp captions/transcripts as an optional local or isolated-worker job. Keep transcription correction available and private audio private; hosted upload is a separate choice.
- Game recipe: connect sound cues to ordinary local game events, with mute/volume and browser user-gesture handling. A sound playing does not prove an Ootle transaction succeeded; confirmation sounds must follow verified application state.
- Analytics: measure preview, source click, asset added and successful export separately, through existing CH-005 metrics. Do not collect microphone content, transcripts or voice identity in analytics.
- Refresh: reuse CH-006 source monitoring. Separate editorial check date, upstream change time and retrieval time; do not make static resource lists appear freshly verified on every ingest.

Related: [asset marketplace](../ASSET_MARKETPLACE.md), [provider registry](asset-providers.json), [video workflow](../VIDEO_WORKFLOWS.md), [video tools](video-production.md).

Implementation: [CH-049 / #77](https://github.com/marguerite347/tari-growth/issues/77).


## Additional creator references, reviewed September 22, 2026

- [VoiceStudio](https://github.com/debpalash/VoiceStudio): Local voice tooling covering synthesis, voice design, dubbing and transcription. Explore an optional voice-production workflow. Check supported engines, model terms and hardware before setup. Sources: [reference 1](https://x.com/roundtablespace/status/2102333331073642889).

## Agent production skills

The shared Skills catalog now includes pinned, complete MIT bundles for Qwen3-TTS production guidance and official ElevenLabs text-to-speech, sound-effects and music skills. Search `voice-over`, `narration`, `cinematic sound effects` or `music production`. All agents can retrieve them through `/api/agent-resources` and `/agent-skills/<id>/bundle.json`; provider credentials and execution rights are separate.

Use voice casting and listening checks before full narration or video rendering. A technically valid WAV is not a validated performance. Keep rejected takes and selection evidence with the editable project. Local Qwen VoiceDesign ran successfully on September 22, but the first two artistic directions did not satisfy the user; that engine must not be presented as a proven trailer-voice solution.
