// Nonsecret project setup. Statuses are creator self-reports. Secrets fail closed.
const SECRET_VALUE = /(?:sk-|hf_[A-Za-z0-9]{8,}|ghp_|github_pat_|xox[baprs]-|Bearer\s+[A-Za-z0-9._-]{8,})/i;
const ASSIGNED_SECRET = /(?:api[_-]?key|token|secret|password|cookie|authorization|credential)\s*[:=]\s*\S{6,}/i;
const SECRET_KEY = /^(?:token|password|cookie|authorization|api[_-]?key|hf_token)$/i;
const PROVIDERS = ['huggingface', 'envato', 'audio'];
const STATUSES = ['unverified', 'ready', 'needs-help'];
const fail = message => { const error = new Error(message); error.status = 400; throw error; };

export function containsSecret(value) {
  return typeof value === 'string' && (SECRET_VALUE.test(value) || ASSIGNED_SECRET.test(value));
}

function secretKey(key) {
  return SECRET_KEY.test(key);
}

/** Drop secret-shaped keys and values. Callers still reject the original when this changes it. */
export function stripSecrets(value) {
  if (typeof value === 'string') return containsSecret(value) ? null : value;
  if (Array.isArray(value)) return value.map(stripSecrets).filter(item => item != null);
  if (!value || typeof value !== 'object') return value;
  const clean = {};
  for (const [key, child] of Object.entries(value)) {
    if (secretKey(key)) continue;
    const next = stripSecrets(child);
    if (next != null) clean[key] = next;
  }
  return clean;
}

function hasSecret(value) {
  return JSON.stringify(value) !== JSON.stringify(stripSecrets(value));
}

function text(value, max, label) {
  if (typeof value !== 'string') fail(`${label} must be text.`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) fail(`${label} is missing or too long.`);
  if (containsSecret(trimmed)) fail('Setup plan cannot contain secrets.');
  return trimmed;
}

function safeUrl(value) {
  const url = text(value, 300, 'Requirement URL');
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  let parsed;
  try { parsed = new URL(url); } catch { fail('Requirement URL must be a site path or http(s).'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail('Requirement URL cannot include credentials.');
  return url;
}

function requirement(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) fail('Each setup requirement must be an object.');
  const provider = item.provider === 'core' || PROVIDERS.includes(item.provider) ? item.provider : null;
  if (!provider) fail('Requirement provider is not allowed.');
  return {
    id: text(item.id, 40, 'Requirement id'),
    title: text(item.title, 160, 'Requirement title'),
    ask: text(item.ask, 500, 'Requirement question'),
    verify: text(item.verify, 500, 'Requirement check'),
    url: safeUrl(item.url),
    provider,
  };
}

/** Return a version 1 plan or throw 400. Null input is absent, not stored. */
export function validateSetupPlan(input) {
  if (input == null) return null;
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Setup plan must be an object.');
  if (hasSecret(input)) fail('Setup plan cannot contain secrets.');
  if (input.version !== 1) fail('Setup plan version must be 1.');
  if (input.reportedBy != null && input.reportedBy !== 'creator') fail('Setup statuses are user-reported, not verified.');
  const requirements = Array.isArray(input.requirements) ? input.requirements.slice(0, 20).map(requirement) : null;
  if (!requirements) fail('Setup plan needs its requirement list.');
  const ids = new Set(requirements.map(item => item.id));
  const statuses = {};
  const reported = input.statuses && typeof input.statuses === 'object' && !Array.isArray(input.statuses) ? input.statuses : {};
  for (const [id, status] of Object.entries(reported)) {
    if (!ids.has(id) || !STATUSES.includes(status)) fail('Setup status must match a requirement and a known report.');
    statuses[id] = status;
  }
  const enabledProviders = Array.isArray(input.enabledProviders) ? input.enabledProviders.filter(item => PROVIDERS.includes(item)).slice(0, 3) : [];
  return {
    version: 1,
    engine: text(input.engine, 80, 'Engine'),
    engineId: input.engineId == null || input.engineId === '' ? null : text(input.engineId, 40, 'Engine id'),
    target: text(input.target, 80, 'Delivery target'),
    enabledProviders,
    requirements,
    statuses,
    agentInstructions: text(input.agentInstructions, 2000, 'Agent instructions'),
    updatedAt: text(input.updatedAt, 40, 'Updated time'),
    reportedBy: 'creator',
  };
}

/** Validated plan for a portable download. Secrets throw instead of being copied. */
export function setupPlanForExport(input) {
  return validateSetupPlan(input);
}
