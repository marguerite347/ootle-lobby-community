import type { ProjectState } from './api';
export function validRecipeSnapshot(r: unknown): r is NonNullable<ProjectState['recipe']> {
  if (!r || typeof r !== 'object') return false;
  const v = r as any;
  return Boolean(v.recipe && ['id','version','title'].every(k => typeof v.recipe[k] === 'string') &&
    v.parameters && typeof v.parameters === 'object' && !Array.isArray(v.parameters) &&
    Array.isArray(v.components) && (v.adapter == null || (typeof v.adapter.status === 'string' &&
    ['steps','limitations'].every(k => Array.isArray(v.adapter[k]) && v.adapter[k].every((x:unknown) => typeof x === 'string')))));
}
