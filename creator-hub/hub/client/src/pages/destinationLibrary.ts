import type {Facets, LearnView, Resource} from '../api';

function resourceFacets(items: Resource[]): Facets {
  const facets: Facets = {};
  for (const key of ['type', 'ecosystem', 'readiness', 'level', 'format', 'learningKind'] as const) {
    facets[key] = {};
    for (const item of items) {
      const value = item[key];
      if (typeof value === 'string' && value) facets[key][value] = (facets[key][value] || 0) + 1;
    }
  }
  return facets;
}

// Imported directory links can be labeled "learn" even when their source section
// explicitly describes tools. Route that metadata, not a guess based on the title.
function isToolReference(item: Resource) {
  return item.type === 'learn' && item.tags?.includes('game-resource-lists') &&
    item.format === 'reference' && /tools|editors|^localization$|^utilities$|^libraries|frameworks|^project management$/i.test(item.category || '');
}

// Keep the shared API index intact; each destination presents its own task-specific view.
export function discoveryLibrary(items: Resource[]) {
  const resources = items.filter(item => item.learningKind !== 'skill' && (item.type !== 'learn' || isToolReference(item) || (item.format === 'reference' && item.tags?.includes('genre-reference'))))
    .map(item => isToolReference(item) ? {...item, type: 'tool'} : item);
  return {items: resources, count: resources.length, facets: resourceFacets(resources)};
}

export function guideLibrary(data: LearnView): LearnView {
  const guidesOnly = (items: Resource[]) => items.filter(item => item.learningKind !== 'skill' && !isToolReference(item));
  const topics = data.topics.map(topic => ({...topic, items: guidesOnly(topic.items)}));
  const categories = data.categories?.map(category => ({...category,
    description: category.id === 'agent-workflows' ? 'Understand creative AI, automation and agent techniques.' : category.description,
    items: guidesOnly(category.items)}));
  const other = guidesOnly(data.other);
  const items = [...new Map([...topics.flatMap(topic => topic.items), ...other].map(item => [item.id, item])).values()];
  return {...data, topics, categories, other, count: items.length, facets: resourceFacets(items)};
}

export function destinationLink(path: string, params: URLSearchParams, keys: string[]) {
  const next = new URLSearchParams();
  for (const key of keys) if (params.get(key)) next.set(key, params.get(key)!);
  return `${path}${next.size ? `?${next}` : ''}`;
}
