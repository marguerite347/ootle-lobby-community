// INTEGRATION_GAP[CFG-AI-DRAFT] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-ai-draft.
// INTEGRATION_GAP[LOBBY-VIDEO] (design-only): see docs/DEVELOPMENT_GAPS.md#lobby-video.
// CH-026 — "Make a video" configurator for the Creator Hub.
//
// Thin, self-contained descriptors for the three reusable Remotion templates in
// `creator-hub/video-templates/`. This module owns the UI contract (fields +
// limits) and produces a validated props JSON + render command; it does NOT run
// renders (long renders belong in a worker, not an HTTP handler — see
// VIDEO_WORKFLOWS.md). The renderer/validation source of truth lives in the
// video-templates package; these limits mirror its zod schema.

export const VIDEO_SCHEMA_VERSION = 1;
export const FORMATS = ['9:16', '16:9', '1:1'];
// Brand-only exports cannot be labeled as recorded gameplay.
export const KINDS = ['concept', 'demo'];
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Fields shared by every template. Keys are flat here and reassembled into the
// renderer's nested props (background.*, meta.*) on export.
const COMMON_FIELDS = [
  { key: 'format', kind: 'select', label: 'Aspect ratio', options: FORMATS, default: '9:16' },
  { key: 'durationInSeconds', kind: 'integer', label: 'Duration (seconds)', min: 3, max: 60, default: 12, advanced: true },
  { key: 'accent', kind: 'color', label: 'Accent color', default: '#C9EB00', advanced: true },
  { key: 'kind', kind: 'select', label: 'Footage label', options: KINDS, default: 'demo', advanced: true, help: 'Concept/AI visuals must stay labeled, never shown as recorded gameplay.' },
  { key: 'destinationUrl', kind: 'url', label: 'Tracked CTA link', default: '', advanced: true },
  { key: 'campaignId', kind: 'text', label: 'Campaign ID', default: '', maxLength: 60, advanced: true },
];

// One-click starter brief grounded in docs/CORE_POSITIONING.md ("Content briefs" → Video #1).
// Kept factual and free of unverified/ shipped-integration claims per that doc's boundaries.
const VIDEO1_BRIEF =
  'Video #1 (core positioning): show the user/developer catch-22 — the best builders want platforms with users, and users want great apps — then Tari\'s acquisition-and-distribution loop: mine Tari in Universe with no complex onboarding, discover apps through the built-in launcher, and build or Riff open Tari templates. End on one clear next step. Back claims with real footage; no unverified partnerships or shipped-integration claims.';

export const VIDEO_TEMPLATES = [
  {
    id: 'AppSpotlight',
    title: 'App spotlight',
    description: 'A branded text preview with three benefits and a "Try it" link. Add footage separately in the renderer.',
    draftKeys: ['appName', 'tagline', 'benefits', 'ctaLabel'],
    examples: [
      { label: 'Video #1 — core positioning', brief: VIDEO1_BRIEF },
      { label: 'Privacy voting app', brief: 'A privacy-first on-chain voting app on the Ootle. Emphasize private-by-default voting and verifiable results. Invite viewers to try it in Ootle Lobby.' },
    ],
    fields: [
      { key: 'appName', kind: 'text', label: 'App name', required: true, maxLength: 60 },
      { key: 'tagline', kind: 'text', label: 'Tagline', maxLength: 120 },
      { key: 'benefits', kind: 'list', label: 'Benefits (up to 3)', minItems: 1, maxItems: 3, itemMaxLength: 60 },
      { key: 'ctaLabel', kind: 'text', label: 'Button label', default: 'Try it', maxLength: 40 },
    ],
  },
  {
    id: 'TemplateWalkthrough',
    title: 'Template walkthrough',
    description: 'Demonstrate a Tari component and invite viewers to Riff it.',
    draftKeys: ['componentName', 'whatItDoes', 'steps', 'remixLabel'],
    examples: [
      { label: 'Video #1 — core positioning', brief: VIDEO1_BRIEF },
      { label: 'Counter + token template', brief: 'Explain a proposed counter and reward-token recipe. Label it as a concept requiring integration and testing, not a shipped composition. Invite viewers to explore the component documentation.' },
    ],
    fields: [
      { key: 'componentName', kind: 'text', label: 'Template / component name', required: true, maxLength: 60 },
      { key: 'whatItDoes', kind: 'text', label: 'What it does', maxLength: 140 },
      { key: 'steps', kind: 'list', label: 'Steps (up to 4)', minItems: 1, maxItems: 4, itemMaxLength: 80 },
      { key: 'remixLabel', kind: 'text', label: 'Button label', default: 'Riff this template', maxLength: 40 },
    ],
  },
  {
    id: 'CommunityUpdate',
    title: 'Community update',
    description: 'New projects, contributor highlights and achievements.',
    draftKeys: ['headline', 'items', 'ctaLabel'],
    examples: [
      { label: 'Video #1 — core positioning', brief: VIDEO1_BRIEF },
      { label: 'Weekly Ootle Lobby digest', brief: 'A weekly Ootle Lobby update: highlight new recipes and templates, a contributor spotlight, and newly added learning resources. Keep it factual and invite viewers to see what is new.' },
    ],
    fields: [
      { key: 'headline', kind: 'text', label: 'Headline', required: true, maxLength: 70 },
      { key: 'items', kind: 'list', label: 'Updates (up to 4)', minItems: 1, maxItems: 4, itemMaxLength: 70 },
      { key: 'ctaLabel', kind: 'text', label: 'Button label', default: 'See what is new', maxLength: 40 },
    ],
  },
].map((t) => ({ ...t, fields: [...t.fields, ...COMMON_FIELDS] }));

export function templateById(id) {
  return VIDEO_TEMPLATES.find((t) => t.id === id) || null;
}

export function videoTemplateSummaries() {
  return VIDEO_TEMPLATES.map((t) => ({ id: t.id, title: t.title, description: t.description, fields: t.fields }));
}

function validateField(field, value, errors) {
  const req = field.required;
  const empty = value === undefined || value === null || value === '';
  if (field.kind === 'list') {
    if (!Array.isArray(value) || value.some((s) => typeof s !== 'string')) { errors.push({ field: field.key, reason: 'must be a list of text strings' }); return []; }
    const arr = value.map((s) => s.trim()).filter(Boolean);
    if (arr.length < (field.minItems || 0)) errors.push({ field: field.key, reason: `add at least ${field.minItems}` });
    if (field.maxItems && arr.length > field.maxItems) errors.push({ field: field.key, reason: `at most ${field.maxItems}` });
    for (const item of arr) if (field.itemMaxLength && item.length > field.itemMaxLength) errors.push({ field: field.key, reason: `each item must be <= ${field.itemMaxLength} chars` });
    return arr;
  }
  if (empty) {
    if (req) errors.push({ field: field.key, reason: 'required' });
    return field.default ?? '';
  }
  if (field.kind === 'select') {
    if (!field.options.includes(value)) errors.push({ field: field.key, reason: `must be one of ${field.options.join(', ')}` });
    return value;
  }
  if (field.kind === 'integer') {
    const n = typeof value === 'string' && /^-?\d+$/.test(value) ? Number(value) : value;
    if (typeof n !== 'number' || !Number.isInteger(n)) { errors.push({ field: field.key, reason: 'must be an integer' }); return field.default; }
    if (field.min !== undefined && n < field.min) errors.push({ field: field.key, reason: `must be >= ${field.min}` });
    if (field.max !== undefined && n > field.max) errors.push({ field: field.key, reason: `must be <= ${field.max}` });
    return n;
  }
  if (field.kind === 'color') {
    if (typeof value !== 'string' || !HEX.test(value)) errors.push({ field: field.key, reason: 'must be a hex color like #C9EB00' });
    return value;
  }
  if (field.kind === 'url') {
    let valid = false;
    try { const u = new URL(value); valid = typeof value === 'string' && value.length <= 2048 && ['http:', 'https:'].includes(u.protocol) && !!u.hostname && !u.username && !u.password; } catch {}
    if (!valid) errors.push({ field: field.key, reason: 'must be a valid http(s) URL without credentials (max 2048 chars)' });
    return value;
  }
  // text
  if (typeof value !== 'string') { errors.push({ field: field.key, reason: 'must be text' }); return ''; }
  if (field.maxLength && value.length > field.maxLength) errors.push({ field: field.key, reason: `must be <= ${field.maxLength} chars` });
  return value;
}

export function validateConfig(template, config = {}) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { ok: false, errors: [{ field: 'config', reason: 'must be an object' }], config: {} };
  }
  const errors = [];
  const resolved = {};
  const known = new Set(template.fields.map((f) => f.key));
  for (const key of Object.keys(config)) if (!known.has(key)) errors.push({ field: key, reason: 'unknown field' });
  for (const field of template.fields) resolved[field.key] = validateField(field, config[field.key], errors);
  return { ok: errors.length === 0, errors, config: resolved };
}

// Reassemble flat config into the renderer's nested props shape.
function buildProps(template, c) {
  const meta = {
    projectId: '',
    templateId: template.id,
    campaignId: c.campaignId || '',
    clipId: '',
    revision: '1',
    destinationUrl: c.destinationUrl || '',
  };
  const background = { type: 'brand', src: '', kind: c.kind || 'demo', scrim: 0.45 };
  const base = { format: c.format, accent: c.accent, durationInSeconds: c.durationInSeconds, background, meta };
  if (template.id === 'AppSpotlight') return { ...base, appName: c.appName, tagline: c.tagline || '', benefits: c.benefits, ctaLabel: c.ctaLabel || 'Try it' };
  if (template.id === 'TemplateWalkthrough') return { ...base, componentName: c.componentName, whatItDoes: c.whatItDoes || '', steps: c.steps, remixLabel: c.remixLabel || 'Riff this template' };
  return { ...base, headline: c.headline, items: (c.items || []).map((label) => ({ label, note: '' })), ctaLabel: c.ctaLabel || 'See what is new' };
}

export function exportManifest(template, config = {}) {
  const result = validateConfig(template, config);
  if (!result.ok) { const e = new Error('invalid video configuration'); e.status = 400; e.errors = result.errors; throw e; }
  const props = buildProps(template, result.config);
  const propsFile = `props/${template.id.toLowerCase()}.json`;
  return {
    schemaVersion: VIDEO_SCHEMA_VERSION,
    template: template.id,
    props,
    render: {
      tool: 'remotion',
      package: 'creator-hub/video-templates',
      command: `node scripts/render.mjs ${template.id} ${propsFile} out/${template.id}.mp4`,
      note: 'Save props to the file above under creator-hub/video-templates, then run the command. Rendering is a separate step; the hub does not render.',
    },
    generatedAt: new Date().toISOString(),
    disclosure: 'A render never implies permission to post. Concept/AI backgrounds must stay labeled as non-gameplay.',
  };
}

// --- OpenMontage-style brief -> draft (optional, uses HUGGINGFACE_TOKEN) -------
// Turns a free-text brief into suggested field values for one template. The model
// output is validated against the template like any other input; on any failure
// the UI falls back to manual entry.
export function draftMessages(template, brief) {
  const keys = template.draftKeys;
  const rules = template.fields
    .filter((f) => keys.includes(f.key))
    .map((f) => {
      if (f.kind === 'list') return `"${f.key}": array of ${f.minItems}-${f.maxItems} short strings (<= ${f.itemMaxLength} chars each)`;
      return `"${f.key}": string (<= ${f.maxLength} chars)`;
    })
    .join(', ');
  return [
    {
      role: 'system',
      content:
        'You draft short-form marketing video copy for Ootle Lobby, built on Tari Ootle. Return ONLY a JSON object, no prose, no code fences. ' +
        'Be concrete and factual, avoid hype and emoji, do not invent partnerships or unreleased features. ' +
        `Keys and limits: { ${rules} }. Respect every length and count limit exactly.`,
    },
    { role: 'user', content: `Template: ${template.title} (${template.description})\nBrief: ${brief}\nReturn the JSON now.` },
  ];
}

export async function draftFromBrief(template, brief) {
  if (typeof brief !== 'string' || !brief.trim() || brief.length > 4000) { const e = new Error('brief must be 1-4000 characters'); e.status = 400; throw e; }
  if (process.env.HF_DRAFT_ENABLED !== '1') { const e = new Error('AI drafting is disabled. Set HF_DRAFT_ENABLED=1 to enable provider usage.'); e.status = 503; throw e; }
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  if (!token) { const e = new Error('Drafting is unavailable: no HUGGINGFACE_TOKEN configured.'); e.status = 503; throw e; }
  const model = process.env.HF_DRAFT_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';
  let res;
  try {
    res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: draftMessages(template, brief), max_tokens: 400, temperature: 0.6 }),
    });
  } catch (err) {
    const e = new Error('Drafting provider unavailable or timed out; edit fields manually.'); e.status = 502; throw e;
  }
  if (!res.ok) {
    const e = new Error(`Drafting provider error ${res.status}; edit fields manually.`); e.status = res.status === 402 ? 402 : 502; throw e;
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const jsonText = (content.match(/\{[\s\S]*\}/) || [content])[0];
  let parsed;
  try { parsed = JSON.parse(jsonText); } catch { const e = new Error('Draft was not valid JSON; edit fields manually.'); e.status = 422; throw e; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).some((k) => !template.draftKeys.includes(k))) { const e = new Error('Draft contains unexpected fields; edit fields manually.'); e.status = 422; throw e; }
  const result = validateConfig(template, parsed);
  if (!result.ok) { const e = new Error('Draft did not meet field requirements; edit fields manually.'); e.status = 422; throw e; }
  const draft = Object.fromEntries(template.draftKeys.map((k) => [k, result.config[k]]));
  return { model, draft, validation: result };
}
