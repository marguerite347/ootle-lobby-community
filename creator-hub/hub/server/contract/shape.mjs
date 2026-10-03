// A small JSON Schema subset checker for the contract test. It covers what
// openapi.mjs uses: type (including type arrays for null), properties, required,
// items, enum, const, additionalProperties (schema form), allOf, anyOf, oneOf and
// local $refs. Unknown extra properties are allowed, as in the schemas.

function resolve(schema, document) {
  let current = schema;
  const seen = new Set();
  while (current?.$ref) {
    if (seen.has(current.$ref)) throw new Error(`Circular $ref ${current.$ref}`);
    seen.add(current.$ref);
    current = resolvePointer(document, current.$ref);
  }
  return current;
}

export function resolvePointer(document, pointer) {
  if (!pointer.startsWith('#/')) throw new Error(`Only local $refs are supported: ${pointer}`);
  const target = pointer.slice(2).split('/').reduce((node, key) => node?.[key.replace(/~1/g, '/').replace(/~0/g, '~')], document);
  if (target === undefined) throw new Error(`Unresolved $ref ${pointer}`);
  return target;
}

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function typeMatches(expected, value) {
  const actual = typeOf(value);
  return [expected].flat().some((type) => type === actual || (type === 'number' && actual === 'integer'));
}

/** Returns a list of mismatch messages; empty when `value` fits `schema`. */
export function checkShape(schema, value, document, where = '$') {
  const node = resolve(schema, document);
  if (!node || typeof node !== 'object') return [];
  const errors = [];
  for (const part of node.allOf || []) errors.push(...checkShape(part, value, document, where));
  for (const key of ['anyOf', 'oneOf']) {
    if (node[key] && !node[key].some((part) => checkShape(part, value, document, where).length === 0)) {
      errors.push(`${where}: matches none of ${key}`);
    }
  }
  if (node.type && !typeMatches(node.type, value)) {
    errors.push(`${where}: expected ${[node.type].flat().join(' or ')}, got ${typeOf(value)}`);
    return errors;
  }
  if ('const' in node && value !== node.const) errors.push(`${where}: expected ${JSON.stringify(node.const)}`);
  if (node.enum && !node.enum.includes(value)) errors.push(`${where}: ${JSON.stringify(value)} is not one of ${node.enum.join(', ')}`);
  if (typeOf(value) === 'object') {
    for (const key of node.required || []) if (!(key in value)) errors.push(`${where}: missing required ${key}`);
    for (const [key, child] of Object.entries(node.properties || {})) {
      if (key in value) errors.push(...checkShape(child, value[key], document, `${where}.${key}`));
    }
    if (node.additionalProperties && typeof node.additionalProperties === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (!node.properties?.[key]) errors.push(...checkShape(node.additionalProperties, child, document, `${where}.${key}`));
      }
    }
  }
  if (typeOf(value) === 'array' && node.items) {
    value.forEach((item, index) => errors.push(...checkShape(node.items, item, document, `${where}[${index}]`)));
  }
  return errors;
}

/** Every `$ref` string anywhere in the document. */
export function collectRefs(node, out = []) {
  if (Array.isArray(node)) node.forEach((item) => collectRefs(item, out));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') out.push(value);
      else if (key !== 'examples' && key !== 'example') collectRefs(value, out);
    }
  }
  return out;
}
