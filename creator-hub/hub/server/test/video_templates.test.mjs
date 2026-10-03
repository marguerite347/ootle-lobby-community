import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VIDEO_TEMPLATES, templateById, validateConfig, exportManifest } from '../videoTemplates.mjs';

test('three named templates are exposed with fields', () => {
  assert.deepEqual(VIDEO_TEMPLATES.map((t) => t.id).sort(), ['AppSpotlight', 'CommunityUpdate', 'TemplateWalkthrough']);
  for (const t of VIDEO_TEMPLATES) assert.ok(t.fields.length > 0);
});

test('AppSpotlight: valid config exports renderer-shaped props with tracking meta', () => {
  const t = templateById('AppSpotlight');
  const m = exportManifest(t, {
    appName: 'Private Ballot',
    tagline: 'Vote privately',
    benefits: ['Private', 'Verifiable', 'On Ootle'],
    format: '9:16',
    campaignId: 'sprint1',
    destinationUrl: 'https://community.tari.com/',
  });
  assert.equal(m.template, 'AppSpotlight');
  assert.equal(m.props.appName, 'Private Ballot');
  assert.deepEqual(m.props.benefits, ['Private', 'Verifiable', 'On Ootle']);
  assert.equal(m.props.meta.templateId, 'AppSpotlight');
  assert.equal(m.props.meta.campaignId, 'sprint1');
  assert.equal(m.props.background.type, 'brand');
  assert.match(m.render.command, /remotion|render\.mjs/);
});

test('CommunityUpdate maps a string list into labeled items', () => {
  const t = templateById('CommunityUpdate');
  const m = exportManifest(t, { headline: 'This week', items: ['New recipe', 'TariSkills'] });
  assert.deepEqual(m.props.items, [{ label: 'New recipe', note: '' }, { label: 'TariSkills', note: '' }]);
});

test('validation rejects bad input with explanations', () => {
  const t = templateById('AppSpotlight');
  // missing required appName
  assert.equal(validateConfig(t, { benefits: ['x'] }).ok, false);
  // too many benefits
  assert.equal(validateConfig(t, { appName: 'A', benefits: ['1', '2', '3', '4'] }).ok, false);
  // bad accent + non-http url + unknown field
  const r = validateConfig(t, { appName: 'A', benefits: ['1'], accent: 'blurple', destinationUrl: 'javascript:alert(1)', nope: 1 });
  assert.equal(r.ok, false);
  const fields = r.errors.map((e) => e.field);
  assert.ok(fields.includes('accent') && fields.includes('destinationUrl') && fields.includes('nope'));
});

test('export throws 400 with errors on invalid config', () => {
  const t = templateById('TemplateWalkthrough');
  assert.throws(() => exportManifest(t, { steps: [] }), (e) => e.status === 400 && Array.isArray(e.errors));
});

test('every template offers a Video #1 core-positioning example brief', () => {
  for (const t of VIDEO_TEMPLATES) {
    assert.ok(Array.isArray(t.examples) && t.examples.length > 0, `${t.id} should have examples`);
    const v1 = t.examples.find((e) => /Video #1/i.test(e.label));
    assert.ok(v1, `${t.id} should include a Video #1 example`);
    assert.match(v1.brief, /catch-22|acquisition-and-distribution/i);
  }
});

test('export rejects links the renderer cannot accept and false gameplay labels', () => {
  const t = templateById('AppSpotlight');
  const good = { appName: 'Preview', benefits: ['One'] };
  for (const destinationUrl of ['https://', 'https://user:pass@example.com', 'https://example.com/' + 'a'.repeat(2048)]) {
    assert.equal(validateConfig(t, { ...good, destinationUrl }).ok, false);
  }
  assert.equal(validateConfig(t, { ...good, kind: 'gameplay' }).ok, false);
  assert.equal(validateConfig(t, { ...good, benefits: [{}] }).ok, false);
});

test('AI drafts require opt-in, validate model shape, and hide provider errors', async () => {
  const { draftFromBrief } = await import('../videoTemplates.mjs');
  const saved = { enabled: process.env.HF_DRAFT_ENABLED, token: process.env.HF_TOKEN, fetch: globalThis.fetch };
  const t = templateById('AppSpotlight');
  try {
    delete process.env.HF_DRAFT_ENABLED;
    await assert.rejects(draftFromBrief(t, 'a brief'), e => e.status === 503);
    process.env.HF_DRAFT_ENABLED = '1'; process.env.HF_TOKEN = 'test-only';
    await assert.rejects(draftFromBrief(t, 42), e => e.status === 400);
    await assert.rejects(draftFromBrief(t, 'a'.repeat(4001)), e => e.status === 400);
    for (const draft of [{ appName: 'A', benefits: 'not a list' }, { appName: 'A', benefits: ['ok'], destinationUrl: 'https://example.com' }, null]) {
      globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(draft) } }] }));
      await assert.rejects(draftFromBrief(t, 'a brief'), e => e.status === 422);
    }
    globalThis.fetch = async (_url, init) => {
      assert.ok(init.signal);
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ appName: 'A', benefits: [' ok '] }) } }] }));
    };
    const d = await draftFromBrief(t, 'a brief');
    assert.deepEqual(d.draft.benefits, ['ok']);
    assert.equal(d.draft.ctaLabel, 'Try it');
    globalThis.fetch = async () => new Response('sensitive provider detail', { status: 500 });
    await assert.rejects(draftFromBrief(t, 'a brief'), e => e.status === 502 && !e.message.includes('sensitive'));
  } finally {
    globalThis.fetch = saved.fetch;
    for (const [key, val] of [['HF_DRAFT_ENABLED', saved.enabled], ['HF_TOKEN', saved.token]]) {
      if (val === undefined) delete process.env[key]; else process.env[key] = val;
    }
  }
});
