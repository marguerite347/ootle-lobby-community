import type {TriviaRiff} from './triviaRiff/model';
import type {GuessingRiff} from './guessingGame/riff';
import {announceMilestone} from './creatorMilestones';
import type {ProductionReview} from '../../shared/productionReview.mjs';
import type { Workflow } from '../../shared/workflow.mjs';
import type { SetupPlanV1 } from '../../shared/setupPlan.mjs';
export type Creator = { name: string; url?: string | null };

export type Provenance = {
  sourceId: string;
  sourceName: string;
  upstreamUrl?: string | null;
  upstreamRevision?: string | null;
  sourceUpdatedAt?: string | null;
  fetchedAt?: string | null;
  freshness: string;
};

export type Resource = {
  learningKind?: string;
  learningHref?: string;
  lifecycle?: string;
  contest?: {publishedAt?:string;updatedAt?:string;edition:string;status:string;sourceUrl:string;rulesUrl:string;socialUrl:string|null;paymentAddressPresent:boolean;notes:string;checkedAt:string;updates:{url:string;postNumber:number}[]};
  id: string;
  type: string;
  ecosystem: string;
  native: boolean;
  title: string;
  summary: string | null;
  cardSummary?: string | null;
  cardStatus?: string | null;
  category: string | null;
  sourceUrl: string | null;
  repoUrl: string | null;
  docsUrl: string | null;
  demoUrl: string | null;
  network: string | null;
  readiness: string;
  license: string | null;
  prerequisites: string[];
  setupHint: string | null;
  tags: string[];
  starterDimension?: '2d' | '3d';
  topic?: string | null;
  level?: string | null;
  format?: string | null;
  creator: Creator | null;
  sharedBy?: Creator;
  attribution: string | null;
  provenance: Provenance;
  verification: string;
  tariCompatible: boolean | null;
  signals?: Record<string, any>;
  discussionLinks?: {url:string;platform:string}[];
  preview?: { image: string | null; video: string | null; source?: string } | null;
  popularity: Popularity;
  engagement: Engagement;
  related?: RelatedItem[];
};

export type RelatedItem = {
  type: string;
  label: string;
  group: string;
  status: 'verified' | 'needs-review' | 'conceptual';
  verified: boolean;
  evidence: string | null;
  resource: { id: string; title: string; type: string; ecosystem: string; topic: string | null };
};

export type Popularity = {
  standardVersion: number;
  score: number | null;
  tier: string;
  tierLabel: string;
  confidence: 'none' | 'low' | 'medium' | 'high';
  dimensions: Record<string, number>;
  contributions: string[];
  native: { metric: string; source: string } | null;
  sources: string[];
};

export type Engagement = { stars: number; comments: number };

export type EngagementState = {
  stars: number;
  starred: boolean;
  comments: { id: string; author: string; body: string; at: string }[];
};

export type Facets = Record<string, Record<string, number>>;

export type LearnTopic = { id: string; label: string; description?: string; items: Resource[] };
export type LearnView = {
  generatedAt: string | null;
  count: number;
  topics: LearnTopic[];
  categories?: LearnTopic[];
  other: Resource[];
  facets: Facets;
};

export type Source = {
  lastAttemptAt?: string|null;
  monitoring?: {pushedAt:string|null;readmeSha:string|null;linkCount:number;baselineAt:string|null;changes:{checkedAt:string;added:string[];removed:string[]}|null};
  id: string;
  name: string;
  kind: string;
  canonicalUrl: string;
  ingestion: string;
  native: boolean;
  lastSuccessAt: string | null;
  freshness: string;
  recordCount: number;
  note?: string | null;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  count: number;
  items: Resource[];
  query?: Record<string, string>;
};

export type OnboardingSummary = {
  id: string;
  goal: string;
  audience: string;
  ecosystem: string;
  blurb: string;
  external?: boolean;
};

export type OnboardingPath = OnboardingSummary & {
  ecosystemLabel: string;
  steps: string[];
  preferred: Resource | null;
  recommended: Resource[];
  alsoExplore: Resource[];
  learn: Resource[];
  resources?: { title: string; url: string }[];
  external?: boolean;
};

export type LobbyGame = { id: string; title: string; author: string; playUrl: string; projectUrl: string };
export type LobbyGameList = { originals: LobbyGame[]; remixes: LobbyGame[] };
export type Project = {
  publishedAt?:string;
  recentActivity?:number;
  release?: {title:string;playUrl:string;videoUrl:string|null;posterUrl:string|null;sourceUrl:string;status:string;walletStatus:string;projectId?:string}|null;
  id: string;
  title: string;
  description: string;
  ecosystem: string | null;
  author: string;
  createdAt: string;
  updatedAt: string;
  forkedFrom: string | null;
  forkedAtRef: string | null;
  popularity?: Popularity;
  engagement?: Engagement;
  forks?: number;
};

export type RecipeParam = { key: string; type: 'integer' | 'string'; default: any; label: string; advanced?: boolean; min?: number; max?: number; maxLength?: number; pattern?: string };
export type RecipeComponent = { id: string; name: string; templateId: string; source: string; revision: string; summary: string; provides: string[]; methods: string[] };
export type RecipeConnection = { id: string; from: string; to: string; rule?: string; note?: string };
export type RecipeSummary = { id: string; version: string; title: string; description: string; engine: string; status: string; verifiedTestnet: boolean; componentCount: number };
export type Recipe = RecipeSummary & {
  components: RecipeComponent[];
  connections: RecipeConnection[];
  parameters: RecipeParam[];
  permissions: string[];
  education: { id: string; title: string; url: string | null; topic?: string; missing?: boolean }[];
};
export type ValidateResult = { ok: boolean; errors: { field: string; reason: string }[]; config: Record<string, any> };

export type VideoField = {
  key: string;
  kind: 'text' | 'select' | 'color' | 'url' | 'integer' | 'list';
  label: string;
  options?: string[];
  default?: any;
  required?: boolean;
  advanced?: boolean;
  help?: string;
  min?: number; max?: number; maxLength?: number;
  minItems?: number; maxItems?: number; itemMaxLength?: number;
};
export type VideoExample = { label: string; brief: string };
export type VideoTemplate = { id: string; title: string; description: string; fields: VideoField[]; examples?: VideoExample[] };
export type VideoExport = {
  schemaVersion: number;
  template: string;
  props: Record<string, any>;
  render: { tool: string; package: string; command: string; note: string };
  generatedAt: string;
  disclosure: string;
};
export type VideoDraft = { model: string; draft: Record<string, any>; validation: ValidateResult };

export type PopularityStandard = {
  version: number;
  dimensions: Record<string, { weight: number; label: string; desc: string }>;
  references: Record<string, number>;
  momentumHalfLifeDays: number;
  tiers: { id: string; label: string; min: number }[];
};

export type Version = { hash: string; shortHash: string; author: string; date: string; subject: string };

export type ProjectState = { triviaRiff?: TriviaRiff; guessingGameRiff?: GuessingRiff; productionReview?:ProductionReview; release?:string; setupPlan?:SetupPlanV1; workflow?: Workflow; recipe?: {recipe:{id:string;version:string;title:string};parameters:Record<string,any>;components:any[];adapter?:{status:string;steps:string[];limitations:string[]}} | null; templateId: string | null; components: any[]; notes: string; updatedAt: string };

export type ProjectDetail = { project: Project; head: string | null; versions: Version[]; state: ProjectState | null };

// Only reads may be repeated: retrying a write could create duplicate projects or versions.
async function createdProject<T extends {project:{id:string}}>(request:Promise<T>):Promise<T> {
  const result=await request;
  const key=(result as T & {managementKey?:string}).managementKey;
  if(key) try{localStorage.setItem('project-management:'+result.project.id,key);}catch{ /* The response still carries the key for API clients. */ }
  announceMilestone('created');
  return result;
}

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const read = (init?.method || 'GET').toUpperCase() === 'GET';
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      });
    } catch (error) {
      if (!read || attempt >= 2 || init?.signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error;
      await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 1500));
      continue;
    }
    if (read && attempt < 2 && [502, 503, 504].includes(res.status)) {
      await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 1500));
      continue;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

export type GameStarter = Resource & { genres: string[]; kind: string; engine: string };
export type GameLibrary = { items: GameStarter[]; genres: { id: string; label: string; count: number }[] };

export const api = {
  gameStarters: () => j<GameLibrary>('/api/game-starters'),
  meta: () => j<{ generatedAt: string; records: number; sources: Source[] }>('/api/meta'),
  sources: () => j<{ sources: Source[] }>('/api/sources'),
  resources: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return j<{ count: number; facets: Facets; items: Resource[] }>(`/api/resources${qs ? `?${qs}` : ''}`);
  },
  resource: (id: string) => j<Resource>(`/api/resources/${encodeURIComponent(id)}`),
  collections: () => j<{ collections: Collection[] }>('/api/collections'),
  learn: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return j<LearnView>(`/api/learn${qs ? `?${qs}` : ''}`);
  },
  onboarding: () => j<{ paths: OnboardingSummary[] }>('/api/onboarding'),
  onboardingPath: (id: string) => j<OnboardingPath>(`/api/onboarding/${encodeURIComponent(id)}`),
  projects: () => j<{ projects: Project[] }>('/api/projects'),
  games: () => j<LobbyGameList>('/api/games'),
  project: (id: string) => j<ProjectDetail>(`/api/projects/${encodeURIComponent(id)}`),
  projectState: (id:string, ref:string) => j<ProjectState>(`/api/projects/${encodeURIComponent(id)}/state?ref=${encodeURIComponent(ref)}`),
  createProject: (body: any) => createdProject(j<{ project: Project; head: string }>('/api/projects', { method: 'POST', body: JSON.stringify(body) })),
  publishProject: (id: string, body: any) => j<{ project: Project; head: string }>(`/api/projects/${id}/publish`, { method: 'POST', body: JSON.stringify(body) }),
  forkProject: (id: string, body: any) => createdProject(j<{ project: Project; head: string; forkedFrom: string; forkedAtRef: string }>(`/api/projects/${id}/fork`, { method: 'POST', body: JSON.stringify(body) })),
  saveRecipe: (id:string, body:any) => createdProject(j<{project:Project;head:string}>(`/api/recipes/${encodeURIComponent(id)}/projects`,{method:'POST',body:JSON.stringify(body)})),
  recipes: () => j<{ recipes: RecipeSummary[] }>('/api/recipes'),
  recipe: (id: string) => j<Recipe>(`/api/recipes/${encodeURIComponent(id)}`),
  validateRecipe: (id: string, config: Record<string, any>) => j<ValidateResult>(`/api/recipes/${id}/validate`, { method: 'POST', body: JSON.stringify({ config }) }),
  exportRecipe: (id: string, config: Record<string, any>) => j<any>(`/api/recipes/${id}/export`, { method: 'POST', body: JSON.stringify({ config }) }),
  videoTemplates: () => j<{ templates: VideoTemplate[] }>('/api/video/templates'),
  videoTemplate: (id: string) => j<VideoTemplate>(`/api/video/templates/${encodeURIComponent(id)}`),
  validateVideo: (id: string, config: Record<string, any>) => j<ValidateResult>(`/api/video/templates/${id}/validate`, { method: 'POST', body: JSON.stringify({ config }) }),
  exportVideo: (id: string, config: Record<string, any>) => j<VideoExport>(`/api/video/templates/${id}/export`, { method: 'POST', body: JSON.stringify({ config }) }),
  draftVideo: (id: string, brief: string) => j<VideoDraft>(`/api/video/templates/${id}/draft`, { method: 'POST', body: JSON.stringify({ brief }) }),
  popularityStandard: () => j<PopularityStandard>('/api/popularity-standard'),
  engagement: (kind: 'resource' | 'project', id: string, user: string) => j<EngagementState>(`/api/engagement/${kind}/${encodeURIComponent(id)}?user=${encodeURIComponent(user)}`),
  toggleStar: (kind: 'resource' | 'project', id: string, user: string) => j<{ stars: number; starred: boolean }>(`/api/engagement/${kind}/${encodeURIComponent(id)}/star`, { method: 'POST', body: JSON.stringify({ user }) }),
  addComment: (kind: 'resource' | 'project', id: string, author: string, body: string) => j<{ id: string; author: string; body: string; at: string }>(`/api/engagement/${kind}/${encodeURIComponent(id)}/comments`, { method: 'POST', body: JSON.stringify({ author, body }) }),
};

// Anonymous per-browser identity for stars/comments (no account system yet).
export function userId(): string {
  const k = 'tari-hub-user';
  let v = localStorage.getItem(k);
  if (!v) { v = 'u-' + crypto.randomUUID(); localStorage.setItem(k, v); }
  return v;
}
export function userName(): string { return localStorage.getItem('tari-hub-name') || ''; }
export function setUserName(n: string) { localStorage.setItem('tari-hub-name', n); }
