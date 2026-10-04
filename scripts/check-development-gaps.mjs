import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const registry = JSON.parse(readFileSync('docs/integration-gaps.json', 'utf8'));
const statuses = new Set(['build-required', 'configuration-required', 'local-only', 'design-only', 'retired']);
const ids = new Set();
const marker = id => `INTEGRATION_GAP[${id}]`;
for (const item of registry.items) {
  if (!/^[A-Z][A-Z0-9-]+$/.test(item.id) || ids.has(item.id)) throw Error(`Invalid/duplicate gap ID: ${item.id}`);
  ids.add(item.id);
  if (!statuses.has(item.status) || !item.files.length || ['surface','current','required','verify'].some(key => !item[key])) throw Error(`Incomplete gap: ${item.id}`);
  for (const file of item.files) {
    if (!readFileSync(file, 'utf8').includes(marker(item.id))) throw Error(`Missing ${marker(item.id)} in ${file}`);
  }
}
const tracked = execFileSync('git', ['ls-files', '-z'], {encoding:'utf8'}).split('\0').filter(file => /\.(?:mjs|ts|tsx|yml|yaml)$/.test(file));
for (const file of tracked) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/INTEGRATION_GAP\[([A-Z][A-Z0-9-]+)\]/g)) {
    const item = registry.items.find(item => item.id === match[1]);
    if (!item || !item.files.includes(file)) throw Error(`Unregistered integration marker ${match[1]} in ${file}`);
  }
}
const intro = `# Lobby and Workbench development gaps

Source review: ${registry.reviewedAt}. This register covers the public Lobby and Workbench in this repository. It records source-level integration boundaries, not a claim that external credentials, provider accounts or backend services were tested. No runtime records or credentials are included.

Search the code for \`INTEGRATION_GAP[\` to find the corresponding flags. Each item states what works now, what remains, the source files, and a completion check. **build-required** needs implementation; **configuration-required** already has an adapter but needs owner setup/verification; **local-only** and **design-only** are intentional current limits; **retired** must not be restored as a shortcut. These are developer annotations, not extra copy in the user interface.

Edit [integration-gaps.json](integration-gaps.json) and the matching source comments, then run \`node scripts/check-development-gaps.mjs --write\`. \`npm run validate\` checks marker registration and this generated document. That catches missing/stale references, not the semantic completeness of future endpoint implementations. Add/update the register whenever an integration changes; close a gap only with evidence of the completion check.

Workbench request/response contracts: [WORKBENCH.md](WORKBENCH.md). Existing submissions/capture workflow: [COMMUNITY_WORKFLOW.md](COMMUNITY_WORKFLOW.md).

## Review coverage

Reviewed route registration in \`server/app.mjs\`, the public \`inspirationLobby.mjs\` guard, \`workbench.mjs\`, nested daily-trivia/growth routers, Vercel/local entry points, and their storage/provider modules. Reviewed the current client routes, rewards/wallet/agent placeholders, export-only tools, and scheduled October workflow.

Existing catalog/search/resources/collections/onboarding/learn/skills/agent-document routes, launch/journal content, community-content and contest-metrics readers, toolkit generation and health/static routes have implemented read/validation paths. They are not marked missing merely because an upstream request can fail. Hugging Face search is a real read-only adapter; this review does not certify uptime. Historical content and seed media remain reviewed static content. Existing GitHub Pages publication is separate from the missing Workbench publication service. Local marketing data stays access restricted. Old project/asset/challenge write handlers are guarded in the public app; see RETIRED-HOSTING.

## Integration checklist

| ID | Classification | Surface |
| --- | --- | --- |
${registry.items.map(item => `| [${item.id}](#${item.id.toLowerCase()}) | ${item.status} | ${item.surface} |`).join('\n')}
`;
const details = registry.items.map(item => `
## ${item.id}

**${item.status}** — ${item.surface}

**Current:** ${item.current}

**Remaining:** ${item.required}

**Completion check:** ${item.verify}

**Source:** ${item.files.map(file => `[${file}](../${file})`).join(', ')}
`).join('');
const output = intro + details;
if (process.argv.includes('--write')) writeFileSync('docs/DEVELOPMENT_GAPS.md', output);
else if (readFileSync('docs/DEVELOPMENT_GAPS.md','utf8') !== output) throw Error('Development gaps document is stale; run node scripts/check-development-gaps.mjs --write');
console.log(`Validated ${registry.items.length} integration gaps and their source markers.`);
