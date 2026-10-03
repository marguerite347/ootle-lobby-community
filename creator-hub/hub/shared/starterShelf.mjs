// Goal-shelf honesty for GDevelop starters.
// The Create starter button always opens the project-record form. The label
// must name that save step. Brand Voice locked the pattern (BAO-2 path A).

export const GOAL_STARTER_SHELF_SIZE = 6;
export const RECOMMENDED_STARTER_LIMIT = 8;

// GDevelop names 3D examples with a standalone "3d" token
// ("3d-platformer", "Babyfoot 3d"). "360° Platformer" is a 2D example.
const THREE_DIMENSIONAL_TOKEN = /(^|[^a-z0-9])3d([^a-z0-9]|$)/i;

export function saveProjectButtonLabel(title) {
  return `Save project from ${title} →`;
}

export function starterProjectPath(templateId) {
  return `/create/project?template=${encodeURIComponent(templateId)}`;
}

export function gdevelopStarterDimension(record) {
  const upstreamId = record?.provenance?.upstreamId || '';
  const haystack = [record?.title, upstreamId, record?.id].filter(Boolean).join(' ');
  return THREE_DIMENSIONAL_TOKEN.test(haystack) ? '3d' : '2d';
}

export function tagsWithDimension(tags, dimension) {
  const kept = (tags || []).filter((tag) => tag !== '2d' && tag !== '3d');
  const noCodeIndex = kept.indexOf('no-code');
  const insertAt = noCodeIndex === -1 ? kept.length : noCodeIndex + 1;
  return [...kept.slice(0, insertAt), dimension, ...kept.slice(insertAt)];
}

export function threeDimensionalShelfLabel(dimension) {
  return dimension === '3d' ? '3D' : null;
}

export function presentStarter(record) {
  if (!record || record.ecosystem !== 'gdevelop') return record;
  const starterDimension = gdevelopStarterDimension(record);
  return {
    ...record,
    starterDimension,
    tags: tagsWithDimension(record.tags, starterDimension),
  };
}
