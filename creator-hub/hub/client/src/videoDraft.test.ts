import { expect, test } from 'vitest';
import { applyVideoDraft } from './videoDraft';
import { latestRequest } from './latestRequest';
import type { VideoField } from './api';

const fields: VideoField[] = [
  { key: 'title', kind: 'text', label: 'Title' },
  { key: 'benefits', kind: 'list', label: 'Benefits' },
  { key: 'duration', kind: 'integer', label: 'Duration' },
];
test('malformed model fields cannot corrupt controlled inputs', () => {
  const config = { title: 'Original', benefits: ['Working'], duration: 12 };
  expect(applyVideoDraft(config, { title: {}, benefits: 'not an array', duration: [] }, fields)).toEqual(config);
  expect(applyVideoDraft(config, { benefits: [{ text: 'invalid' }] }, fields)).toEqual(config);
  expect(applyVideoDraft(config, { title: 'New', benefits: ['Valid'], unknown: 'ignored' }, fields))
    .toEqual({ ...config, title: 'New', benefits: ['Valid'] });
});
test('manual edits or navigation discard pending draft results without validation invalidating a draft', async () => {
  const draftGate = latestRequest();
  const validationGate = latestRequest();
  const pending = draftGate.begin();
  validationGate.begin();
  expect(pending()).toBe(true);
  draftGate.invalidate();
  const replacement = draftGate.begin();
  expect(pending()).toBe(false);
  expect(replacement()).toBe(true);
});
