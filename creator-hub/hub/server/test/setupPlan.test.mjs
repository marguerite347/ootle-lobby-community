import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupPlanForExport, stripSecrets, validateSetupPlan} from '../../shared/setupPlan.mjs';

const plan = () => ({
  version: 1,
  engine: 'Godot',
  engineId: 'godot',
  target: 'Browser',
  enabledProviders: [],
  requirements: [{id: 'engine', title: 'Godot setup', ask: 'Which machine runs Godot?', verify: 'Open the pinned project.', url: '/skills?q=Godot', provider: 'core'}],
  statuses: {engine: 'ready'},
  agentInstructions: 'Ask unresolved questions. Statuses are user-reported, not verified.',
  updatedAt: '2026-09-24T00:00:00.000Z',
  reportedBy: 'creator',
});

test('validateSetupPlan keeps a version 1 nonsecret plan', () => {
  const saved = validateSetupPlan(plan());
  assert.equal(saved.version, 1);
  assert.equal(saved.reportedBy, 'creator');
  assert.equal(saved.statuses.engine, 'ready');
});

test('validateSetupPlan rejects secrets and does not return them', () => {
  const planted = plan();
  planted.agentInstructions = 'paste token=abcdef123456';
  assert.throws(() => validateSetupPlan(planted), error => error.status === 400);
  assert.equal(stripSecrets(planted).agentInstructions, undefined);
  assert.throws(() => setupPlanForExport({...plan(), requirements: [{...plan().requirements[0], url: 'https://user:secret@example.com/x'}]}), error => error.status === 400);
});
