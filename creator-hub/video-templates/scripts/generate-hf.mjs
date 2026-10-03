#!/usr/bin/env node
// Optional billed generation. No request or retry without an explicit CLI opt-in.
import { parseArgs } from 'node:util';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function generationOptions(argv) {
  const { values: a } = parseArgs({ args: argv, options: {
    prompt: { type: 'string' }, out: { type: 'string' }, model: { type: 'string' },
    steps: { type: 'string' }, width: { type: 'string' }, height: { type: 'string' },
    negative: { type: 'string' }, 'allow-paid': { type: 'boolean', default: false },
  }});
  if (!a['allow-paid']) throw new Error('Pass --allow-paid to authorize one potentially billed generation request.');
  if (!a.prompt?.trim() || a.prompt.length > 4000) throw new Error('Provide --prompt (1–4000 characters).');
  const model = a.model || 'stabilityai/stable-diffusion-3-medium-diffusers';
  if (!/^[\w.-]+\/[\w.-]+$/.test(model)) throw new Error('Model must be an owner/model ID.');
  const integer = (name, value, min, max) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer from ${min} to ${max}.`);
    return n;
  };
  const parameters = { num_inference_steps: integer('steps', a.steps ?? 28, 1, 50) };
  for (const key of ['width', 'height']) if (a[key]) {
    const n = integer(key, a[key], 256, 1536);
    if (n % 8) throw new Error(`${key} must be divisible by 8.`);
    parameters[key] = n;
  }
  if (a.negative) parameters.negative_prompt = a.negative;
  const out = a.out || 'public/generated/concept-bg.png';
  if (path.extname(out).toLowerCase() !== '.png') throw new Error('Output must use .png.');
  return { model, prompt: a.prompt, parameters, out };
}

export async function generate(options, token, fetchImpl = fetch) {
  const { out, model, prompt, parameters } = options;
  if (!token) throw new Error('Set HF_TOKEN or HUGGINGFACE_TOKEN in your environment.');
  if (existsSync(out) || existsSync(`${out}.provenance.json`)) throw new Error('Output exists; choose a new revision filename.');
  // One attempt: even a timeout may have consumed credits, so never retry blindly.
  const res = await fetchImpl(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: 'POST', signal: AbortSignal.timeout(120000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'image/png' },
    body: JSON.stringify({ inputs: prompt, parameters }),
  });
  if (!res.ok) throw new Error(`Generation returned HTTP ${res.status}; no automatic retry. Check provider billing and availability.`);
  if (!res.headers.get('content-type')?.startsWith('image/png')) throw new Error('Provider did not return PNG; no output saved.');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 32 * 1024 * 1024 || !buf.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Invalid or oversized PNG response.');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, buf, { flag: 'wx' });
  writeFileSync(`${out}.provenance.json`, JSON.stringify({
    generator: 'huggingface-inference-api', provider: 'hf-inference', model,
    modelRevision: null, revisionNote: 'Hosted provider revision is not attested; this output is not claimed reproducible.',
    prompt, parameters, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex'),
    generatedAt: new Date().toISOString(), label: 'concept-visual-not-gameplay',
  }, null, 2), { flag: 'wx' });
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const out = await generate(generationOptions(process.argv.slice(2)), process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN);
    console.log(`Wrote ${out} and provenance.`);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
