import {hfSource, HF_ORIGIN, normalizeHuggingFace, readHuggingFace} from '../huggingface.mjs';
export const source = hfSource;
export const selections = {
  models: ['Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', 'ResembleAI/chatterbox', 'ACE-Step/Ace-Step1.5', 'black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-xl-base-1.0', 'Wan-AI/Wan2.1-T2V-1.3B', 'openai/whisper-large-v3-turbo', 'facebook/musicgen-small', 'facebook/sam2.1-hiera-large', 'depth-anything/Depth-Anything-V2-Small-hf', 'Helsinki-NLP/opus-mt-en-es', 'sentence-transformers/all-MiniLM-L6-v2'],
  datasets: ['openslr/librispeech_asr', 'google/fleurs', 'HuggingFaceFW/fineweb'],
  spaces: ['Qwen/Qwen3-TTS', 'black-forest-labs/FLUX.1-schnell', 'mteb/leaderboard'],
};
export async function fetchLive({read = readHuggingFace} = {}) {
  const records = [];
  for (const [kind, ids] of Object.entries(selections)) {
    for (const id of ids) {
      const {data} = await read(`${HF_ORIGIN}/api/${kind}/${id}`);
      records.push(normalizeHuggingFace(data, kind));
    }
  }
  return {records};
}
