# Hugging Face discovery and skills

`/huggingface` searches public models, datasets and Spaces through the public Hub API. Results are paginated, cached for five minutes, and clearly marked stale if a refresh fails. Searches do not download weights, execute repositories, access private resources or create paid jobs. Source cards remain authoritative for licenses, gating and hardware needs.

Discover links to live search; live search links back to the curated collection and agent skills. The `huggingface` connector refreshes selected creator resources (voice, music, image/video, transcription, vision, data and demos). The committed collection contains 18 resources fetched successfully from the public API on September 22, 2026. Source freshness reports the actual last successful import. Failed refreshes retain previous records and expose stale coverage through Sources.

Refresh only this source from `creator-hub/hub`:

```sh
node server/ingest.mjs --only=huggingface --seed
```

Use the same `CREATOR_HUB_DATA_DIR` as the preview to refresh its runtime cache. A full import of the entire public Hub is intentionally not performed: live search supplies broad discovery, while the curated subset remains small and useful.

## Skill source

26 official skill directories from `https://github.com/huggingface/skills`, revision `abc20ae526d8b4c0e4dff89f904adce28a4a0eb6`, are vendored under `skills/vendor/huggingface`. Each bundle preserves its relative supporting files, Apache-2.0 license and `UPSTREAM.json`. The library includes CLI, local models, Spaces, ZeroGPU, Gradio, LoRA Space builder, datasets, model/vision training, evaluation, Trackio, papers, Transformers.js, tool building, cloud deployment guidance and MCP discovery.

These are upstream instructions, not tested Tari adapters or authorization to provision cloud resources. They appear in the Hub skill library with Hugging Face attribution and complete ZIP downloads. The existing installed Hugging Face plugin remains separate; importing the library does not execute or activate every skill.

Review upstream changes before updating the pinned copy and manifest. Never import account tokens, logs or model weights with skill files.

## Validation

132 server tests, 40 client tests and the production build pass. Browser verification confirmed public model/dataset/Space results, model pagination from 24 to 48 entries, and the 26-skill library. The 18-item curated import completed with current source metadata. Local preview only; not deployed.
