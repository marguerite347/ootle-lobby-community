# Video production and creator promotion resources

Checked against upstream repositories on 2026-09-19. These are optional resources, not installed integrations. Upstream feature descriptions are not runtime validation. For UX, wiring, storage and analytics see [Capture & Promote](../VIDEO_WORKFLOWS.md).

A first working implementation of the two wired tools (Remotion renderer + a shared ComfyUI generation workflow) lives in [`../video-templates/`](../video-templates/README.md) — three reusable templates, an export manifest with tracking IDs, and a self-hostable ComfyUI workflow. It is a local prototype, not a hosted service.

| Tool | Proposed role | Integration and licensing notes |
| --- | --- | --- |
| [Remotion](https://github.com/remotion-dev/remotion) / [docs](https://www.remotion.dev/docs/) | Reusable React compositions for actual gameplay clips, captions, brand end cards and factual data overlays. **Wired first** in [`../video-templates/`](../video-templates/README.md). | [Custom license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md), not unrestricted MIT. Confirm eligibility or company license for the intended operator and hosted use before implementation. Rendering compute is separate. |
| [ComfyUI](https://github.com/comfyanonymous/ComfyUI) / [workflow templates](https://github.com/Comfy-Org/workflow_templates) · [server API](https://docs.comfy.org/development/comfyui-server/comms_routes) | Self-hostable generation of background/concept stills and short animated sequences from prompts or approved reference images. **Wired alongside** Remotion as a shared, downloadable workflow ([`../video-templates/comfyui/`](../video-templates/comfyui/README.md)). Brand applied later in Remotion so generation cannot distort it. | GPLv3 app; model weights carry their own licenses and stay out of Git. Needs a GPU host; not run in CI/cloud VM. Generated frames must be labeled concept, not gameplay. |
| [OpenMontage](https://github.com/calesthio/OpenMontage) | Optional agent-assisted scripting, editing and production recipes using supplied footage or generated/stock material. | AGPL-3.0 repository; assess distribution/network-use obligations for the selected integration. Model/stock/render providers have separate terms and costs. Begin with a linked tutorial, not unrestricted execution of agent tools. |
| [Open Generative AI](https://github.com/Anil-matcha/Open-Generative-AI) | Optional concept shots, reference-led visuals and promotional experiments. | The screenshot's Open-Higgsfield-AI URL redirects here. MIT repository; third-party model/API access, costs and media terms remain separate. Do not describe generated visuals as captured gameplay or assume guaranteed brand consistency. |
| [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) / [English README](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/README-en.md) | Optional script-to-short educational explainers with subtitles, voice and supplied/licensed footage. | MIT repository; Python workflow with separate provider/media rights and costs. Evaluate editorial quality with a single approved example before adapter work. High output volume is not the success metric. |

Keep original source URLs, pinned revision, license reference, checked date, provider requirements, example project and compatibility evidence in future catalog records. Refresh through CH-006 ingestion and flag changed/removed licenses instead of silently replacing a working recipe. These tools are not Tari protocol implementations: promotion should link to the actual Ootle template and runnable project being demonstrated.

## Learning recipes to expose in Learn

- Capture a real browser game or app: [screen capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture), [getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia), [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder). Explicit user activation/permission is required for screen capture; audio and codecs vary by browser. Provide upload fallback.
- Turn a template walkthrough into a captioned clip, with editable transcript and approved assets from the current brand guidance.
- Produce a release-note or Riff comparison clip with creator credit and a link to its project revision.
- Export video, captions and suggested copy for social scheduling; optional integration follows [Meta kit](../META_ADS_KIT.md) and DW-010 scheduler work.
- Embed approved clips in a showcase or an app help panel; measure CTA visits and meaningful activation rather than treating views as adoption.


## Additional creator references, reviewed September 22, 2026

- [Cinematique: cinematic prompt reference](https://vvsvs.pro/cinematique): VVSVS reference library for cinematic language, framing, lighting and camera choices. Develop prompts and shot briefs for creator trailers and generated footage; link to the library instead of copying its contents.
