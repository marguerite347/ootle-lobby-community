// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.
import {issueManagementKey,authorizeManagement,forgetManagementKey,rewriteHistory} from './projectManagement.mjs';
import {reconcileReview, validateReview} from '../shared/productionReview.mjs';
import { validateWorkflow, seedWorkflow } from '../shared/workflow.mjs';
import { validateSetupPlan } from '../shared/setupPlan.mjs';
// Git-backed project store: each published project is its own git repository under
// data/projects/<id>. Saved states are commits, so the version history is real and
// public, and any community member can fork from any saved state (git ref).
//
// A project's composable "workflow" lives in state.json: the base template plus the
// components/resources composed onto it, notes and setup. Publishing writes state.json
// and commits it. Forking clones the repo (preserving full history), gives the fork a
// new identity, and records lineage (forkedFrom + the exact ref forked from).

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { projectsDir } from './paths.mjs';
import { slug } from './connectors/http.mjs';
import { computePopularity } from './popularity.mjs';
import * as engagement from './engagement.mjs';

const pexec = promisify(execFile);

const AUTHOR_NAME = 'Creator Hub';
const AUTHOR_EMAIL = 'creator-hub@tari.local';

// Project ids are generated as `<slug>-<hex>`; only these characters are ever valid.
// Rejecting anything else (dots, slashes, encoded traversal) before touching the
// filesystem prevents path escape from a request id.
const ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
export function isValidId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

function repoPath(id) {
  if (!isValidId(id)) { const e = new Error('invalid project id'); e.status = 400; throw e; }
  const p = path.join(projectsDir, id);
  // Defense in depth: ensure the resolved path stays inside the project store.
  const base = path.resolve(projectsDir);
  const resolved = path.resolve(p);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    const e = new Error('invalid project id'); e.status = 400; throw e;
  }
  return p;
}

// Per-project async mutex: serializes the full write/add/commit sequence so two
// concurrent saves to the same project cannot interleave and commit each other's
// working tree. Operations on different projects still run concurrently.
const locks = new Map();
function withLock(key, fn) {
  const prev = locks.get(key) || Promise.resolve();
  const run = prev.then(fn, fn); // run fn after prev settles, regardless of outcome
  locks.set(key, run.then(() => {}, () => {}));
  return run;
}

async function git(cwd, args, author) {
  const name = author?.name || AUTHOR_NAME;
  const email = author?.email || AUTHOR_EMAIL;
  const base = [
    '-c', `user.name=${name}`,
    '-c', `user.email=${email}`,
    '-c', 'commit.gpgsign=false',
    '-c', 'init.defaultBranch=main',
  ];
  const { stdout } = await pexec('git', [...base, ...args], { cwd, maxBuffer: 8 * 1024 * 1024 });
  return stdout;
}

function readProject(id) {
  const f = path.join(repoPath(id), 'project.json');
  if (!existsSync(f)) return null;
  return JSON.parse(readFileSync(f, 'utf8'));
}

function writeProjectFiles(id, project, state) {
  const dir = repoPath(id);
  writeFileSync(path.join(dir, 'project.json'), JSON.stringify(project, null, 2));
  writeFileSync(path.join(dir, 'state.json'), JSON.stringify(state, null, 2));
  const readme = [
    `# ${project.title}`,
    '',
    project.description || '',
    '',
    `- Base template: ${state.templateId || '(none)'}`,
    `- Ecosystem: ${project.ecosystem || 'mixed'}`,
    project.forkedFrom ? `- Forked from: ${project.forkedFrom} @ ${project.forkedAtRef}` : '',
    '',
    '## Composed resources',
    ...((state.components || []).map((c) => `- ${c.id} — ${c.title || ''}`)),
    '',
    '_Version history is public. Fork from any saved state in Ootle Lobby._',
  ].filter((l) => l !== undefined).join('\n');
  writeFileSync(path.join(dir, 'README.md'), readme);
}

function attachSetupPlan(state, previous) {
  const next = {...state};
  if (Object.hasOwn(state, 'setupPlan')) {
    next.setupPlan = state.setupPlan == null ? previous?.setupPlan : validateSetupPlan(state.setupPlan);
    if (!next.setupPlan) delete next.setupPlan;
  } else if (previous?.setupPlan) next.setupPlan = previous.setupPlan;
  return next;
}

export async function create({ title, description, templateId, ecosystem, author, components = [], recipe = null, workflow, setupPlan }) {
  if (!title || !String(title).trim()) { const e = new Error('title required'); e.status = 400; throw e; }
  if (workflow !== undefined) validateWorkflow(workflow);
  if (setupPlan != null) validateSetupPlan(setupPlan);
  const id = `${slug(title) || 'project'}-${crypto.randomBytes(3).toString('hex')}`;
  return withLock(id, async () => {
    const dir = repoPath(id);
    mkdirSync(dir, { recursive: true });
    await git(dir, ['init', '-q'], author);
    const now = new Date().toISOString();
    const project = {
      id,
      title: String(title).trim(),
      description: description || '',
      ecosystem: ecosystem || null,
      author: author?.name || 'anonymous',
      createdAt: now,
      updatedAt: now,
      forkedFrom: null,
      forkedAtRef: null,
    };
    const state = attachSetupPlan({ templateId: templateId || null, components, recipe, notes: '', updatedAt: now, setupPlan }, null);
    state.workflow = workflow ?? seedWorkflow(state);
    writeProjectFiles(id, project, state);
    await git(dir, ['add', '-A'], author);
    await git(dir, ['commit', '-q', '-m', `Create project: ${project.title}`], author);
    return { project, head: await headRef(id), managementKey:issueManagementKey(id) };
  });
}

export async function publish(id, { state, message, author, expectedHead }) {
  if (state?.setupPlan != null) validateSetupPlan(state.setupPlan);
  if (state?.productionReview !== undefined) validateReview(state.productionReview);
  if (state?.workflow !== undefined) {
    validateWorkflow(state.workflow);
  }
  const r = state?.recipe;
  if (r != null && (!r.recipe || !['id','version','title'].every(k => typeof r.recipe[k] === 'string') ||
      !r.parameters || typeof r.parameters !== 'object' || Array.isArray(r.parameters) ||
      !Array.isArray(r.components) || (r.adapter != null && (typeof r.adapter.status !== 'string' ||
      !['steps','limitations'].every(k => Array.isArray(r.adapter[k]) && r.adapter[k].every(v => typeof v === 'string')))))) {
    const e = new Error('Invalid saved recipe manifest'); e.status = 400; throw e;
  }

  repoPath(id); // validate id up front (throws 400 before locking)
  return withLock(id, async () => {
    const dir = repoPath(id);
    const project = readProject(id);
    if (!project) { const e = new Error('project not found'); e.status = 404; throw e; }
    // Optimistic concurrency: a stale editor whose head no longer matches is asked
    // to reload rather than silently overwriting a concurrent save.
    if (expectedHead) {
      const head = await headRef(id);
      if (head && head !== expectedHead) {
        const e = new Error('Another save happened first. Reload and review before saving again.');
        e.status = 409; throw e;
      }
    }
    const previous = currentState(id);
    if (state?.workflow !== undefined && JSON.stringify(state.workflow) !== JSON.stringify(previous?.workflow) && !expectedHead) { const e = new Error('Workflow changes require expectedHead from the current project.'); e.status = 400; throw e; }
    const productionReview = state?.productionReview ?? previous?.productionReview;
    if (state?.productionReview !== undefined && !expectedHead) throw Object.assign(new Error('Production review changes require expectedHead'), {status:400});
    const reviewedState = productionReview === undefined ? undefined : reconcileReview(productionReview, previous?.productionReview);
    const now = new Date().toISOString();
    project.updatedAt = now;
    const nextState = attachSetupPlan({ ...state, ...(reviewedState ? {productionReview:reviewedState} : {}), workflow: state?.workflow ?? previous?.workflow, updatedAt: now }, previous);
    writeProjectFiles(id, project, nextState);
    await git(dir, ['add', '-A'], author);
    // Allow empty commits so a "saved state" is always recorded.
    await git(dir, ['commit', '-q', '--allow-empty', '-m', message || `Saved state ${now}`], author);
    return { project, head: await headRef(id) };
  });
}

export async function fork(id, { fromRef, title, author }) {
  repoPath(id); // validate source id
  // Lock the SOURCE project so a clone cannot race a concurrent publish on it.
  return withLock(id, async () => {
    const srcDir = repoPath(id);
    const src = readProject(id);
    if (!src) { const e = new Error('source project not found'); e.status = 404; throw e; }
    const ref = fromRef || 'HEAD';
    // Validate the ref exists.
    let resolved;
    try { resolved = (await git(srcDir, ['rev-parse', ref])).trim(); }
    catch { const e = new Error(`unknown ref ${ref}`); e.status = 400; throw e; }

    const newTitle = title || `${src.title} (fork)`;
    const newId = `${slug(newTitle) || 'fork'}-${crypto.randomBytes(3).toString('hex')}`;
    const dstDir = repoPath(newId);
    // Clone preserves full history; then check out the forked ref as the new main.
    await pexec('git', ['clone', '-q', srcDir, dstDir], { maxBuffer: 8 * 1024 * 1024 });
    await git(dstDir, ['checkout', '-q', '-B', 'main', resolved], author);
    const now = new Date().toISOString();
    const project = {
      ...readProject(newId),
      id: newId,
      title: newTitle,
      author: author?.name || 'anonymous',
      createdAt: now,
      updatedAt: now,
      forkedFrom: id,
      forkedAtRef: resolved,
    };
    const state = JSON.parse(readFileSync(path.join(dstDir, 'state.json'), 'utf8'));
    if (state.productionReview) for (const gate of Object.values(state.productionReview.gates)) {gate.status='pending';gate.reviewer='';}
    writeProjectFiles(newId, project, state);
    await git(dstDir, ['add', '-A'], author);
    await git(dstDir, ['commit', '-q', '--allow-empty', '-m', `Fork of ${src.title} at ${resolved.slice(0, 8)}`], author);
    return { project, managementKey:issueManagementKey(newId), head: await headRef(newId), forkedFrom: id, forkedAtRef: resolved };
  });
}

async function headRef(id) {
  try { return (await git(repoPath(id), ['rev-parse', 'HEAD'])).trim(); } catch { return null; }
}

export async function versions(id) {
  const dir = repoPath(id);
  if (!readProject(id)) { const e = new Error('project not found'); e.status = 404; throw e; }
  const fmt = '%H%x1f%an%x1f%aI%x1f%s';
  const out = await git(dir, ['log', `--pretty=format:${fmt}`]);
  return out.split('\n').filter(Boolean).map((line) => {
    const [hash, author, date, subject] = line.split('\x1f');
    return { hash, shortHash: hash.slice(0, 8), author, date, subject };
  });
}

export async function stateAt(id, ref) {
  if(typeof ref!=='string'||! /^(?:HEAD|[a-f0-9]{7,40})$/.test(ref))throw Object.assign(new Error('Invalid project revision'),{status:400});
  const dir = repoPath(id);
  if (!readProject(id)) { const e = new Error('project not found'); e.status = 404; throw e; }
  try {
    const out = await git(dir, ['show', `${ref}:state.json`]);
    return JSON.parse(out);
  } catch { const e = new Error(`no state at ref ${ref}`); e.status = 404; throw e; }
}

function allProjectsRaw() {
  if (!existsSync(projectsDir)) return [];
  return readdirSync(projectsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && isValidId(d.name))
    .map((d) => { try { return readProject(d.name); } catch { return null; } })
    .filter(Boolean);
}

export function forkCount(id, all = allProjectsRaw()) {
  return all.filter((p) => p.forkedFrom === id).length;
}

// Attach engagement counts, fork count, and the popularity signal to a project.
export function decorateProject(p, all = allProjectsRaw()) {
  const eng = engagement.counts('project', p.id);
  const forks = forkCount(p.id, all);
  const popularity = computePopularity({}, { stars: eng.stars, comments: eng.comments, forks, updatedAt: p.updatedAt });
  const since=Date.now()-7*24*60*60*1000;
  const recent=(date)=>Date.parse(date)>=since&&Date.parse(date)<=Date.now();
  const recentActivity=engagement.state('project',p.id).comments.filter(c=>recent(c.at)).length+all.filter(f=>f.forkedFrom===p.id&&recent(f.createdAt)).length;
  // No playable release system after the fresh start; keep the field so clients see "not released".
  return { ...p, recentActivity, engagement: eng, forks, popularity, release: null };
}

export function list() {
  const all = allProjectsRaw();
  return all
    .map((p) => decorateProject(p, all))
    .sort((a, b) => (b.popularity.score ?? -1) - (a.popularity.score ?? -1) || (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function detail(id) {
  const project = readProject(id);
  if (!project) return null;
  return { project: decorateProject(project), head: await headRef(id), versions: await versions(id), state: currentState(id) };
}

function currentState(id) {
  const f = path.join(repoPath(id), 'state.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
}

export function ensureStore() {
  mkdirSync(projectsDir, { recursive: true });
}


export async function manageHistory(id,input,key) {
  repoPath(id);
  return withLock(id,async()=>{
    authorizeManagement(id,key);
    const project=readProject(id);
    if(!project)throw Object.assign(new Error('Project not found'),{status:404});
    if(!input || input.expectedHead!==await headRef(id))throw Object.assign(new Error('Project changed. Reload before deleting history.'),{status:409});
    if(input.confirmation!==id)throw Object.assign(new Error('Type the exact project ID to confirm'),{status:400});
    if(!['delete-version','clear-history','delete-project'].includes(input.action))throw Object.assign(new Error('Unknown history action'),{status:400});
    if(input.action==='delete-project') {
      rmSync(repoPath(id),{recursive:true});forgetManagementKey(id);
      return {deleted:true,retained:'Independent forks, exported copies, backups and published build artifacts are not recalled.'};
    }
    if(input.action==='delete-version' && (typeof input.ref!=='string'|| !/^[a-f0-9]{40}$/.test(input.ref)))throw Object.assign(new Error('Choose a version'),{status:400});
    return {...await rewriteHistory(repoPath(id),input.action==='delete-version'?input.ref:undefined),retained:'Current files and published builds remain. Surviving versions receive new hashes; independent copies are unchanged.'};
  });
}
