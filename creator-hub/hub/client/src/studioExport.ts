import {setupPlanForExport, type SetupPlanV1} from '../../shared/setupPlan.mjs';
import type {Workflow} from '../../shared/workflow.mjs';
import {setupHandoff, type SetupStatus} from './components/toolkitSetup';

export const EXPORT_HONESTY = 'Export packs the project files you have; it does not publish a playable Lobby release.';

function receipt(brief: string, plan: SetupPlanV1) {
  return setupHandoff(brief, plan, plan.enabledProviders, plan.statuses as Record<string, SetupStatus>, plan.target);
}

export function studioExportBundle({
  title,
  brief,
  workflow,
  projectId,
  expectedHead,
  setupPlan,
}: {
  title: string;
  brief: string;
  workflow: Workflow;
  projectId: string | null;
  expectedHead: string | null;
  setupPlan: unknown;
}) {
  let plan: SetupPlanV1 | null = null;
  if (setupPlan) {
    try { plan = setupPlanForExport(setupPlan); }
    catch { plan = null; }
  }
  return {
    schemaVersion: 1,
    title,
    brief,
    workflow,
    projectId,
    expectedHead,
    execution: 'design-only' as const,
    accessStatuses: 'user-reported-not-verified' as const,
    playablePublish: 'not-claimed' as const,
    ...(plan ? {setupPlan: plan, setupHandoff: receipt(brief, plan)} : {}),
    agentInstructions: `${EXPORT_HONESTY} Read /agent-start.md and GET /api/build-toolkit before building. Ask unresolved questions in batches. The creator configures secrets privately. Test one output before batching. Record evidence without secrets. These edges do not execute providers.`,
  };
}
