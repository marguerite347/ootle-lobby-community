// Lists every method + path an Express 4 app registers, including routers mounted
// with app.use()/router.use() and path-mounted middleware such as express.static.
// Used by the contract drift test and the example capture script.
//
// Paths are reported in Express syntax (`/api/projects/:id`, `/agent-docs/*`).
// RegExp routes are reported as `regex:<source>`. Path-mounted middleware that is
// not a router (static folders, guards) is reported with method `USE`.

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

// Express 4 keeps only the compiled RegExp for a mount. Recover the literal prefix
// for plain string mounts such as '/api' or '/calendar/draft'.
function mountPrefix(layer) {
  if (layer.regexp?.fast_slash) return '';
  const source = layer.regexp?.source || '';
  const match = source.match(/^\^((?:\\\/[A-Za-z0-9_.~-]+)+)\\\/\?\(\?=\\\/\|\$\)$/);
  if (!match) throw new Error(`Cannot read mount path from ${source}; update routeInventory.mjs`);
  return match[1].replace(/\\\//g, '/');
}

function routePaths(route) {
  const paths = Array.isArray(route.path) ? route.path : [route.path];
  return paths.map((item) => (item instanceof RegExp ? `regex:${item.source}` : item));
}

function join(prefix, path) {
  if (path.startsWith('regex:')) return prefix ? `${prefix} ${path}` : path;
  return (prefix + path).replace(/\/+$/, '') || '/';
}

function walk(stack, prefix, out) {
  for (const layer of stack) {
    if (layer.route) {
      const methods = METHODS.filter((method) => layer.route.methods[method]);
      for (const path of routePaths(layer.route)) {
        for (const method of methods) out.push({ method: method.toUpperCase(), path: join(prefix, path) });
      }
    } else if (layer.handle?.stack && typeof layer.handle === 'function') {
      walk(layer.handle.stack, prefix + mountPrefix(layer), out);
    } else if (!layer.regexp?.fast_slash) {
      out.push({ method: 'USE', path: prefix + mountPrefix(layer) });
    }
  }
  return out;
}

/** Unique, sorted list of {method, path} registered on an Express app. */
export function listRoutes(app) {
  const seen = new Map();
  for (const entry of walk(app._router.stack, '', [])) seen.set(`${entry.method} ${entry.path}`, entry);
  return [...seen.values()].sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
}

/** `/api/projects/{id}` -> `/api/projects/:id`. Wildcards and regex routes need `x-express-path`. */
export function expressPathFromOpenApi(path) {
  return path.replace(/\{([A-Za-z0-9_]+)\}/g, ':$1');
}
