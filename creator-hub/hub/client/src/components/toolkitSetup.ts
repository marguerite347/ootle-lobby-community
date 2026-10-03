export type SetupRequirement={id:string;title:string;ask:string;verify:string;url:string;provider:string};
export type SetupPlan={engine:string;engineId:string|null;requirements:SetupRequirement[];enabledProviders:string[];agentInstructions:string};
export type SetupStatus='unverified'|'ready'|'needs-help';
export const SETUP_PLAN_STORAGE = 'creator-hub:setup-plan';

const OPTIONAL_PROVIDERS = ['huggingface', 'envato', 'audio'];

export function durableSetupPlan(input:{
  idea:string;
  plan:SetupPlan;
  target:string;
  providers:string[];
  skills:{id:string;title:string}[];
  statuses:Record<string,SetupStatus>;
}){
  const active = activeRequirements(input.plan, input.providers);
  const statuses = Object.fromEntries(active.map(item => [item.id, input.statuses[item.id] || 'unverified']));
  return {
    version: 1 as const,
    engine: input.plan.engine,
    engineId: input.plan.engineId,
    target: input.target,
    enabledProviders: input.providers.filter(provider => OPTIONAL_PROVIDERS.includes(provider)),
    requirements: input.plan.requirements.map(item => ({id: item.id, title: item.title, ask: item.ask, verify: item.verify, url: item.url, provider: item.provider})),
    statuses,
    agentInstructions: input.plan.agentInstructions,
    updatedAt: new Date().toISOString(),
    reportedBy: 'creator' as const,
  };
}

/** Publish the plan onto the current project. A stale expectedHead is not written. */
export async function attachSetupPlan(projectId:string, expectedHead:string|null, plan:unknown){
  if (!plan || typeof plan !== 'object') throw new Error('Set up the build in the toolkit before attaching it.');
  const loaded = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
  const detail = await loaded.json();
  if (!loaded.ok) throw new Error(detail.error || 'Project not found');
  if (expectedHead && detail.head !== expectedHead) throw new Error('This project changed. Reload before attaching the setup plan.');
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/publish`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({state: {...detail.state, setupPlan: plan}, expectedHead: detail.head, message: 'Attach setup plan'}),
  });
  const saved = await response.json();
  if (!response.ok) throw new Error(saved.error || 'Could not attach the setup plan.');
  return saved;
}

export function rememberSetupPlan(plan: unknown) {
  try { sessionStorage.setItem(SETUP_PLAN_STORAGE, JSON.stringify(plan)); } catch { /* The next save still sends whatever the server can read. */ }
}

export function readSetupPlan(): unknown {
  try { return JSON.parse(sessionStorage.getItem(SETUP_PLAN_STORAGE) || 'null'); } catch { return null; }
}

export function activeRequirements(plan:SetupPlan,providers:string[]){return plan.requirements.filter(item=>item.provider==='core'||providers.includes(item.provider));}
export function setupHandoff(brief:string,plan:SetupPlan,providers:string[],statuses:Record<string,SetupStatus>,target:string){
 const active=activeRequirements(plan,providers),pending=active.filter(item=>statuses[item.id]!=='ready');
 return `${brief}\n\nPROJECT SETUP WIZARD — USER-REPORTED, NOT VERIFIED\nTarget: ${target}\nEngine: ${plan.engine}\nOptional services selected: ${providers.join(', ')||'None; use existing/local assets first'}\n\n${plan.agentInstructions}\n\nSETUP RECEIPT\n${active.map(item=>`- ${item.title}: ${statuses[item.id]||'unverified'}\n  Check: ${item.verify}\n  Guide: ${item.url}`).join('\n')}\n\nQUESTIONS TO ASK THE USER BEFORE DEPENDENT WORK\n${pending.length?pending.map((item,index)=>`${index+1}. ${item.ask}`).join('\n'):'No unresolved items were reported. Verify each claimed capability; ask only for access or decisions that the checks establish are missing.'}\n\nDo not claim the wizard installed tools, authenticated services or taught the agent a skill. Save verified evidence without secret values in BUILD_PLAN.md and report missing access before attempting dependent work. Offer a no-service fallback when appropriate and confirm that it still satisfies the creator’s goal.`;
}
