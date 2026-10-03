# ComfyUI concept b-roll workflow (shared, self-hostable)

Draft SDXL workflow for **background stills** (concept shots and textures) that Remotion then composes the exact Tari brand over. This is the self-hostable generative option; an external-provider alternative is [`../scripts/generate-hf.mjs`](../scripts/generate-hf.mjs). Everyone can reuse the same workflow file, and advanced users can edit the full graph.

- `tari-concept-broll.api.json` — the graph in ComfyUI **API (prompt) format**, shaped for the `/prompt` server route; runtime execution has not been validated.
- `pinned-versions.json` — pin the ComfyUI commit, custom nodes and model weights before relying on this.

References: [ComfyUI workflow templates](https://github.com/Comfy-Org/workflow_templates) · [ComfyUI server API / comms routes](https://docs.comfy.org/development/comfyui-server/comms_routes).

## Ground rules (do not skip)

- **Backgrounds only.** Generated imagery is a background layer. The logo, typography and captions are applied in Remotion so generation cannot distort the brand.
- **Label honestly.** Clips using generated visuals must set `background.kind: "concept"` so the on-screen badge reads "Concept visual - not gameplay." Never present generated frames as recorded gameplay.
- **Weights stay out of Git.** Model files live in `ComfyUI/models/...` or object storage. Only the workflow JSON, pinned versions and licensed sample inputs belong in the repo.
- **Licenses.** Confirm the model license (SDXL base has its own license) for your operator and distribution.

## Requirements

- A host with a GPU (or a CPU host, slowly). This repo's CI and cloud VM have **no GPU**, so generation is not run here — the workflow is shipped for you and others to run.
- ComfyUI installed at a selected commit to be validated and recorded; the SDXL checkpoint placed in `models/checkpoints/`.

## Fetch the model with your Hugging Face token

`HF_TOKEN` or `HUGGINGFACE_TOKEN` is read from the environment (add it in the Secrets panel; never paste it into files). Downloading from `huggingface.co` works with this token even where hosted inference does not.

```bash
pip install "huggingface_hub[cli]"
export HF_TOKEN="${HF_TOKEN:-$HUGGINGFACE_TOKEN}"
hf download stabilityai/stable-diffusion-xl-base-1.0 \
  sd_xl_base_1.0.safetensors \
  --revision 462165984030d82259a11f4367a4eed129e94a7b \
  --local-dir ComfyUI/models/checkpoints
```

## Run it

Start ComfyUI, then submit the API graph to the server (edit the prompt in the JSON first):

```bash
curl -s -X POST http://127.0.0.1:8188/prompt \
  -H 'Content-Type: application/json' \
  -d "{\"prompt\": $(cat tari-concept-broll.api.json | python3 -c 'import sys,json;d=json.load(sys.stdin);d.pop("_comment",None);print(json.dumps(d))')}"
```

The saved image lands in `ComfyUI/output/`. Copy it into `../public/` and reference it from a template's props:

```json
"background": { "type": "image", "src": "tari_concept_bg_00001_.png", "kind": "concept", "scrim": 0.5 }
```

Then render with the brand applied on top:

```bash
node ../scripts/render.mjs AppSpotlight ../props/app-spotlight-bg.json ../out/app-spotlight-bg.mp4
```

## Live generation — two paths

- **Self-hosted (this workflow):** run on your own GPU host as above. No hosted-provider per-image charge; hardware, electricity and hosting still have costs.
- **External provider (no local GPU):** [`../scripts/generate-hf.mjs`](../scripts/generate-hf.mjs) calls the Hugging Face Inference API with `HUGGINGFACE_TOKEN`. The original implementation agent reported an SD3-medium generation demo. This review uses mocked provider tests and does not independently reproduce billed generation. Example:

  ```bash
  node ../scripts/generate-hf.mjs \
    --allow-paid --prompt "abstract dark ink navy with purple and lime green privacy grid, no text, no logos" \
    --negative "text, logo, watermark, ui, faces, low quality" \
    --width 768 --height 1344 --steps 28 \
    --out ../public/generated/concept-bg.png
  ```

  Hosted diffusion is billed per image and provider availability changes; a depleted balance returns HTTP 402. Generated files are git-ignored demo outputs (reproduce them with the command above). Weights and rendered media always stay out of Git.

This file is API-format only, not a ComfyUI editor-export JSON. The shared editable UI graph, tested ComfyUI pin, and video-generation recipe remain follow-ups. Do not describe a still image plus Remotion motion as model-generated video.
