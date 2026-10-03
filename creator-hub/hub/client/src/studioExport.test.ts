import {describe, expect, it} from 'vitest';
import {scaffoldStudio} from '../../shared/studio.mjs';
import {EXPORT_HONESTY, studioExportBundle} from './studioExport';

const plan = {
  version: 1,
  engine: 'Godot',
  engineId: 'godot',
  target: 'Browser',
  enabledProviders: [],
  requirements: [
    {id: 'engine', title: 'Godot setup', ask: 'Which machine?', verify: 'Open the project.', url: '/skills?q=Godot', provider: 'core'},
    {id: 'hf', title: 'Hugging Face', ask: 'Configure the token privately.', verify: 'Check model access.', url: '/agent-start.md', provider: 'huggingface'},
  ],
  statuses: {engine: 'ready'},
  agentInstructions: 'Statuses are user-reported, not verified.',
  updatedAt: '2026-09-24T00:00:00.000Z',
  reportedBy: 'creator',
};

describe('studio export', () => {
  it('packs the setup plan, receipt, and honesty labels without a lobby release', () => {
    const bundle = studioExportBundle({
      title: 'My character studio',
      brief: 'A springy robot',
      workflow: scaffoldStudio('character'),
      projectId: 'studio-project',
      expectedHead: 'abc',
      setupPlan: plan,
    });
    expect(bundle.execution).toBe('design-only');
    expect(bundle.accessStatuses).toBe('user-reported-not-verified');
    expect(bundle.playablePublish).toBe('not-claimed');
    expect(bundle.agentInstructions.startsWith(EXPORT_HONESTY)).toBe(true);
    expect(bundle.setupPlan?.version).toBe(1);
    expect(bundle.setupHandoff).toContain('Godot setup');
    expect(bundle.setupHandoff).not.toContain('Configure the token privately.');
    expect(JSON.stringify(bundle)).not.toContain('sk-live');
  });

  it('drops a planted secret instead of copying it into the download', () => {
    const bundle = studioExportBundle({
      title: 'My character studio',
      brief: 'A springy robot',
      workflow: scaffoldStudio('character'),
      projectId: 'studio-project',
      expectedHead: 'abc',
      setupPlan: {...plan, agentInstructions: 'paste token=abcdef123456'},
    });
    expect(bundle.setupPlan).toBeUndefined();
    expect(JSON.stringify(bundle)).not.toContain('abcdef123456');
  });
});