import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMPLATES, appSpotlightSchema, templateWalkthroughSchema, communityUpdateSchema } from '../src/schemas.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const propsDir = path.join(dir, '..', 'props');
const load = (f) => JSON.parse(readFileSync(path.join(propsDir, f), 'utf8'));

test('each shipped props fixture validates against its template schema', () => {
  const cases = [
    ['app-spotlight.json', appSpotlightSchema],
    ['template-walkthrough.json', templateWalkthroughSchema],
    ['community-update.json', communityUpdateSchema],
  ];
  for (const [file, schema] of cases) {
    const parsed = schema.safeParse(load(file));
    assert.ok(parsed.success, `${file}: ${JSON.stringify(parsed.error?.issues)}`);
  }
});

test('TEMPLATES registry exposes the three named templates', () => {
  assert.deepEqual(Object.keys(TEMPLATES).sort(), ['AppSpotlight', 'CommunityUpdate', 'TemplateWalkthrough']);
});

test('validation rejects bad input (data, not code)', () => {
  // too many benefits (max 3)
  assert.equal(appSpotlightSchema.safeParse({ appName: 'A', benefits: ['1', '2', '3', '4'] }).success, false);
  // missing required componentName
  assert.equal(templateWalkthroughSchema.safeParse({ whatItDoes: 'x', steps: ['a'] }).success, false);
  // bad accent color
  assert.equal(communityUpdateSchema.safeParse({ headline: 'H', items: [{ label: 'x' }], accent: 'blurple' }).success, false);
  // non-http destinationUrl in meta
  assert.equal(
    appSpotlightSchema.safeParse({ appName: 'A', benefits: ['1'], meta: { destinationUrl: 'javascript:alert(1)' } }).success,
    false,
  );
});

test('defaults fill optional fields (format, duration, background, kind)', () => {
  const p = appSpotlightSchema.parse({ appName: 'A', benefits: ['b'] });
  assert.equal(p.format, '9:16');
  assert.equal(p.durationInSeconds, 12);
  assert.equal(p.background.type, 'brand');
  assert.equal(p.background.kind, 'demo');
});

test('rejects missing media, path traversal and remote media in the local renderer', () => {
  for (const src of ['', '../secret.png', '/etc/passwd', 'https://example.com/a.png', '%2e%2e/a', 'a\\b']) {
    assert.equal(appSpotlightSchema.safeParse({ appName: 'A', benefits: ['b'], background: { type: 'image', src } }).success, false, src);
  }
  assert.equal(appSpotlightSchema.safeParse({ appName: 'A', benefits: ['b'], background: { type: 'image', src: 'generated/bg.png', kind: 'concept' } }).success, true);
});

test('destination URL must be real and must not contain credentials', () => {
  for (const destinationUrl of ['https://', 'https://user:pass@example.com', 'https://exa mple.com']) {
    assert.equal(appSpotlightSchema.safeParse({ appName: 'A', benefits: ['b'], meta: { destinationUrl } }).success, false);
  }
});
