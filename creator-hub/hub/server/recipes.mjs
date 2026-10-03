// CH-025 — versioned composable recipes.
//
// A recipe joins real Tari template components (pinned to exact source revisions) with
// typed parameters, connections and an engine binding (PlayCanvas). Configurations are
// validated (compatible connections + parameter constraints) with explained rejections,
// and export produces a round-trippable manifest that preserves parameters and version
// pins. Executing a recipe on testnet uses the CH-024 wallet-approved adapter — a saved
// catalog composition alone is not a runnable game, and none of these are a confirmed
// verified-runnable choice until validated on Ootle.

export const SCHEMA_VERSION = 1;

const WASM_TEMPLATE_REPO = 'https://github.com/tari-project/wasm-template';
// Pinned revision of the official starter repo (tari-project/wasm-template@main, 2026-09-16).
export const WASM_TEMPLATE_REV = '95f86279ff3905af4f60cb2d5e9875fcf14e9908';

// A component references a real wasm_templates crate at a pinned revision.
function component(name, spec) {
  return {
    id: `tari-ootle:component:${name.replace(/_/g, '-')}`,
    name,
    templateId: `tari-ootle:starter:wasm-templates-${name.replace(/_/g, '-')}`,
    source: `${WASM_TEMPLATE_REPO}/tree/${WASM_TEMPLATE_REV}/wasm_templates/${name}`,
    revision: WASM_TEMPLATE_REV,
    summary: spec.summary || '',
    provides: spec.provides || [],
    requires: spec.requires || [],
    inputs: spec.inputs || {},
    outputs: spec.outputs || {},
    methods: spec.methods || [],
  };
}

export const RECIPES = [
  {
    id: 'token-rewarded-counter',
    version: '0.1.0',
    schemaVersion: SCHEMA_VERSION,
    title: 'Token-rewarded counter game',
    description: 'A minimal composable recipe: an on-chain counter as game state and a fungible token as reward currency. The proposed adapter increases the counter and distributes a fixed reward from a prefunded token vault. The adapter is not implemented.',
    engine: 'playcanvas',
    // PROPOSED, not a confirmed/verified-runnable choice. Requires validation on Ootle.
    status: 'proposed',
    verifiedTestnet: false,
    components: [
      component('counter', { summary: 'On-chain counter (game state).', provides: ['count'], outputs: { count: 'u32' }, methods: ['new', 'with_address', 'increase', 'increase_by', 'value'] }),
      component('fungible', { summary: 'Fungible token (reward currency).', provides: ['token'], inputs: { amount: 'Amount' }, outputs: { token: 'Bucket' }, methods: ['mint', 'resource_address', 'take_free_coins', 'balance', 'burn_coins', 'total_supply'] }),
    ],
    connections: [
      { id: 'reward', from: 'counter.count', to: 'fungible.amount', rule: 'fixed-reward', note: 'after an increase, a proposed adapter requests rewardPerIncrement units from the prefunded vault; count is a trigger, not the payout amount' },
    ],
    parameters: [
      { key: 'rewardPerIncrement', type: 'integer', default: 1, min: 1, max: 1000, label: 'Reward tokens per increment', advanced: false },
      { key: 'tokenSymbol', type: 'string', default: 'PTS', maxLength: 8, pattern: '^[A-Z0-9]+$', label: 'Token symbol', advanced: false },
      { key: 'startCount', type: 'integer', default: 0, min: 0, max: 1000000, label: 'Starting count', advanced: true },
    ],
    permissions: ['wallet approval: counter.increase', 'wallet approval: fungible.take_free_coins', 'wallet approval: recipient.deposit'],
    adapter: {
      status: 'required-not-implemented',
      setup: ['counter.new() starts at zero; increase_by(startCount) initializes the configured count', 'fungible.mint(initial_supply, tokenSymbol) creates a prefunded vault; supply must be chosen before execution'],
      steps: ['counter.increase()', 'fungible.take_free_coins(rewardPerIncrement) returns a Bucket', 'recipient.deposit(bucket)'],
      limitations: ['No reward enforcement adapter exists yet', 'Upstream take_free_coins is public; this is not a production reward gate', 'Combined transaction, authorization and rollback require engine tests'],
    },
    education: ['tari-ootle:learn:using-the-tari-ootle-cli', 'tari-ootle:learn:building-a-guessing-game-template'],
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

export function recipeSummaries() {
  return RECIPES.map((r) => ({ id: r.id, version: r.version, title: r.title, description: r.description, engine: r.engine, status: r.status, verifiedTestnet: r.verifiedTestnet, componentCount: r.components.length }));
}

// Validate a component/connection graph: every connection endpoint must reference a
// real component field (provides/methods). Returns explained errors.
function validateGraph(recipe) {
  const errors = [];
  const components = new Map(recipe.components.map(c => [c.name, c]));
  const rules = { 'fixed-reward': ['u32', 'Amount'], identity: null };
  for (const conn of recipe.connections || []) {
    const types = [];
    for (const [end, direction] of [[conn.from, 'outputs'], [conn.to, 'inputs']]) {
      if (typeof end !== 'string' || !/^[a-zA-Z][\w-]*\.[a-zA-Z][\w-]*$/.test(end)) {
        errors.push({field: `connection ${conn.id || ''}`, reason: `invalid endpoint "${end}"; expected component.port`});
        types.push(null); continue;
      }
      const [name, port] = end.split('.');
      const component = components.get(name);
      const type = component?.[direction]?.[port];
      if (!component) errors.push({field: `connection ${conn.id || ''}`, reason: `unknown component "${name}"`});
      else if (!type) errors.push({field: `connection ${conn.id || ''}`, reason: `${end} is not a declared ${direction} port`});
      types.push(type);
    }
    if (!Object.hasOwn(rules, conn.rule)) errors.push({field: `connection ${conn.id || ''}`, reason: 'unsupported connection rule'});
    else if (types.every(Boolean)) {
      const expected = rules[conn.rule];
      if (expected ? types.some((t,i)=>t!==expected[i]) : types[0]!==types[1]) errors.push({field: `connection ${conn.id || ''}`, reason: 'incompatible port types for connection rule'});
    }
  }
  return errors;
}

/**
 * Validate a user configuration against a recipe's parameter contract. Missing values
 * fall back to defaults; unknown keys, wrong types and out-of-range/pattern violations
 * are rejected with explanations. Also validates the component/connection graph.
 */
export function validateConfig(recipe, config = {}) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return {ok:false, errors:[{field:'config',reason:'must be an object'}], config:{}};
  const errors = [];
  const resolved = {};
  const known = new Set(recipe.parameters.map((p) => p.key));

  for (const key of Object.keys(config)) {
    if (!known.has(key)) errors.push({ field: key, reason: 'unknown parameter' });
  }

  for (const p of recipe.parameters) {
    let v = config[p.key];
    if (v === undefined || v === null || v === '') { resolved[p.key] = p.default; continue; }
    if (p.type === 'integer') {
      if (typeof v === 'string' && /^-?\d+$/.test(v)) v = Number(v);
      if (typeof v !== 'number' || !Number.isInteger(v)) { errors.push({ field: p.key, reason: 'must be an integer' }); continue; }
      if (p.min !== undefined && v < p.min) errors.push({ field: p.key, reason: `must be ≥ ${p.min}` });
      if (p.max !== undefined && v > p.max) errors.push({ field: p.key, reason: `must be ≤ ${p.max}` });
    } else if (p.type === 'string') {
      if (typeof v !== 'string') { errors.push({ field: p.key, reason: 'must be a string' }); continue; }
      if (p.maxLength && v.length > p.maxLength) errors.push({ field: p.key, reason: `must be ≤ ${p.maxLength} chars` });
      if (p.pattern && !new RegExp(p.pattern).test(v)) errors.push({ field: p.key, reason: `must match ${p.pattern}` });
    }
    resolved[p.key] = v;
  }

  errors.push(...validateGraph(recipe));
  return { ok: errors.length === 0, errors, config: resolved };
}

/**
 * Produce a round-trippable export manifest: pinned component revisions + resolved
 * parameters + connections + version. Reloading it reproduces the same configuration.
 * Throws (with the validation errors) if the configuration is invalid.
 */
export function exportManifest(recipe, config = {}) {
  const result = validateConfig(recipe, config);
  if (!result.ok) { const e = new Error('invalid recipe configuration'); e.status = 400; e.errors = result.errors; throw e; }
  return {
    schemaVersion: SCHEMA_VERSION,
    recipe: { id: recipe.id, version: recipe.version, title: recipe.title },
    engine: recipe.engine,
    status: recipe.status,
    verifiedTestnet: recipe.verifiedTestnet,
    components: recipe.components.map((c) => ({ id: c.id, templateId: c.templateId, source: c.source, revision: c.revision })),
    connections: recipe.connections,
    adapter: recipe.adapter,
    parameters: result.config,
    generatedAt: new Date().toISOString(),
    note: 'Configuration + version pins only. Executing on Ootle uses the CH-024 wallet-approved adapter; this manifest is not a compiled or deployed game.',
  };
}
