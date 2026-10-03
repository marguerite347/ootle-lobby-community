import {describe, expect, it} from 'vitest';
import {toolkitSearchParams} from './BuildToolkit';

describe('build toolkit query', () => {
  it('sends projectId with the idea and resource id', () => {
    const params = toolkitSearchParams({
      idea: 'Tiny orbital puzzle',
      resourceId: 'creative:starter:not-balatro',
      projectId: 'published-parent-id',
      previous: '',
    });
    expect(params.get('projectId')).toBe('published-parent-id');
    expect(params.get('resourceId')).toBe('creative:starter:not-balatro');
    expect(params.get('idea')).toBe('Tiny orbital puzzle');
  });
});
