import type { VideoField } from './api';

// Model responses must not replace controlled inputs with arrays/objects of the
// wrong shape, even if an older server returns a malformed draft.
export function applyVideoDraft(config: Record<string, any>, draft: unknown, fields: VideoField[]) {
  const next = { ...config };
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return next;
  const values = draft as Record<string, unknown>;
  for (const field of fields) {
    const value = values[field.key];
    if (!(field.key in next)) continue;
    const valid = field.kind === 'list'
      ? Array.isArray(value) && value.every((item) => typeof item === 'string')
      : field.kind === 'integer'
        ? typeof value === 'number' && Number.isInteger(value)
        : typeof value === 'string' && (field.kind !== 'select' || field.options?.includes(value));
    if (valid) next[field.key] = value;
  }
  return next;
}
