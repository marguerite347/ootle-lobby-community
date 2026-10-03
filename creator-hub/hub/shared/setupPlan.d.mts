export type SetupStatus = 'unverified' | 'ready' | 'needs-help';
export type SetupRequirement = {id: string; title: string; ask: string; verify: string; url: string; provider: string};
export type SetupPlanV1 = {
  version: 1;
  engine: string;
  engineId: string | null;
  target: string;
  enabledProviders: string[];
  requirements: SetupRequirement[];
  statuses: Record<string, SetupStatus>;
  agentInstructions: string;
  updatedAt: string;
  reportedBy: 'creator';
};
export function containsSecret(value: unknown): boolean;
export function stripSecrets(value: unknown): unknown;
export function validateSetupPlan(input: unknown): SetupPlanV1 | null;
export function setupPlanForExport(input: unknown): SetupPlanV1 | null;
