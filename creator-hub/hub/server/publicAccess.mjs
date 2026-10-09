// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.
// Shared by the public request guard and the docs for that deployment.
export function publicRestriction(method, pathname) {
  if (/^\/(?:api\/(?:daily-trivia|growth|huggingface)(?:\/|$)|growth-export(?:\/|$))/i.test(pathname)) {
    return 'PUBLIC_SERVICE_DISABLED';
  }
  const verb = method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(verb)) return null;
  const stateless = verb === 'POST' && (
    /^\/api\/(?:recipes|video\/templates)\/[a-zA-Z0-9_-]+\/(?:validate|export)\/?$/.test(pathname) ||
    /^\/api\/skill-market\/[a-zA-Z0-9_-]+\/download\/?$/.test(pathname)
  );
  return stateless ? null : 'PUBLIC_WRITES_DISABLED';
}
