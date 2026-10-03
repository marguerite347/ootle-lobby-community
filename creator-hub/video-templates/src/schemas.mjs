import { z } from 'zod';
import { BRAND } from './brand.mjs';

// ---------------------------------------------------------------------------
// Shared building blocks. Props are DATA, never code — nothing here is executed,
// but media inputs still require validation. Typography and copy are
// applied by Remotion at composition time so generated imagery cannot distort
// the brand.
// ---------------------------------------------------------------------------

export const formatEnum = z.enum(['9:16', '16:9', '1:1']).default('9:16');

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  .default(BRAND.colors.green);

// Optional background layer. A ComfyUI-generated still or clip can sit BEHIND the
// brand foreground. `kind` forces honest labeling: concept/AI visuals must be
// distinguishable from recorded gameplay.
export const backgroundSchema = z
  .object({
    type: z.enum(['brand', 'image', 'video']).default('brand'),
    // Local path under public/. Remote asset ingestion is a separate feature.
    src: z.string().max(2048).refine((s) => s === '' || (!/[\\:%?#]/.test(s) && !s.startsWith('/') && s.split('/').every((part) => part && part !== '.' && part !== '..')), { message: 'must be a relative file path under public/; remote URLs are not supported by this local prototype' }).default(''),
    kind: z.enum(['gameplay', 'concept', 'demo']).default('demo'),
    // Darken overlay so foreground text stays legible over busy imagery.
    scrim: z.number().min(0).max(1).default(0.45),
  })
  .refine((b) => b.type === 'brand' || b.src.length > 0, { message: 'image/video backgrounds require src' })
  .default({ type: 'brand', src: '', kind: 'demo', scrim: 0.45 });

// Tracking metadata retained on every export (VIDEO_WORKFLOWS.md contracts +
// METRICS.md carry-through). None of this is required to render, but when present
// it is written into the export manifest so a clip can be tied to visits and
// downstream creator actions.
export const metaSchema = z
  .object({
    projectId: z.string().default(''),
    templateId: z.string().default(''),
    campaignId: z.string().default(''),
    clipId: z.string().default(''),
    revision: z.string().default(''),
    // Tracked destination link. Restricted to http(s) so unsafe schemes
    // (javascript:, data:, ...) can never ride along into a caption or link.
    destinationUrl: z
      .string()
      .max(2048).refine((v) => { if (v === '') return true; try { const u = new URL(v); return ['http:', 'https:'].includes(u.protocol) && !!u.hostname && !u.username && !u.password; } catch { return false; } }, { message: 'must be a valid http(s) URL without credentials' })
      .default(''),
  })
  .default({});

const base = {
  format: formatEnum,
  accent: hexColor,
  durationInSeconds: z.number().min(3).max(60).default(12),
  background: backgroundSchema,
  meta: metaSchema,
};

// ---------------------------------------------------------------------------
// Template 1 — App spotlight: real footage, three benefits, a "Try it" link.
// ---------------------------------------------------------------------------
export const appSpotlightSchema = z.object({
  ...base,
  appName: z.string().min(1).max(60),
  tagline: z.string().max(120).default(''),
  benefits: z.array(z.string().min(1).max(60)).min(1).max(3),
  ctaLabel: z.string().min(1).max(40).default('Try it'),
});

// ---------------------------------------------------------------------------
// Template 2 — Template walkthrough: demonstrate a Tari component, invite remix.
// ---------------------------------------------------------------------------
export const templateWalkthroughSchema = z.object({
  ...base,
  componentName: z.string().min(1).max(60),
  whatItDoes: z.string().max(140),
  steps: z.array(z.string().min(1).max(80)).min(1).max(4),
  remixLabel: z.string().min(1).max(40).default('Riff this template'),
});

// ---------------------------------------------------------------------------
// Template 3 — Community update: new projects, contributor highlights, wins.
// ---------------------------------------------------------------------------
export const communityUpdateSchema = z.object({
  ...base,
  headline: z.string().min(1).max(70),
  items: z.array(z.object({ label: z.string().min(1).max(70), note: z.string().max(50).default('') })).min(1).max(4),
  ctaLabel: z.string().min(1).max(40).default('See what is new'),
});

export const TEMPLATES = {
  AppSpotlight: appSpotlightSchema,
  TemplateWalkthrough: templateWalkthroughSchema,
  CommunityUpdate: communityUpdateSchema,
};

// App "album cover" — a short looping, brand-consistent thumbnail generated from an
// app's directory metadata (name/category/status). It is decorative typography, not a
// screenshot of the app UI, so it never misrepresents what the app looks like.
export const coverFormatEnum = z.enum(['1:1', '9:16', '16:9']).default('1:1');
export const appCoverSchema = z.object({
  name: z.string().min(1).max(40),
  category: z.string().max(40).default(''),
  status: z.string().max(24).default(''),
  // Optional explicit accent; when omitted the renderer derives a deterministic one.
  accent: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
  format: coverFormatEnum,
  durationInSeconds: z.number().min(2).max(20).default(4),
});

export const KIND_LABEL = {
  gameplay: 'Recorded gameplay',
  concept: 'Concept visual - not gameplay',
  demo: 'Template preview',
};
