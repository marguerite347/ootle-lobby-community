import {verifyReviewedFile} from './reviewedSkills.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { hubRoot } from './paths.mjs';
export const skillsRoot=path.resolve(hubRoot,'../skills');
const repoRoot=path.resolve(hubRoot,'../..');
const safeSlug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function skillCatalog(root=skillsRoot) {
  return readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory() && safeSlug.test(d.name)).flatMap(d=>{
    try { return [JSON.parse(readFileSync(path.join(root,d.name,'metadata.json'),'utf8'))]; }
    catch(e) { if(e.code==='ENOENT')return []; throw e; }
  }).sort((a,b)=>a.title.localeCompare(b.title));
}
export function skillMarkdown(slug,root=skillsRoot) {
  if(!safeSlug.test(slug) || !skillCatalog(root).some(m=>m.id===slug))return null;
  const text=readFileSync(path.join(root,slug,'SKILL.md'),'utf8');
  return root===skillsRoot?verifyReviewedFile(`tari-${slug}`,'SKILL.md',text):text;
}
export function verifiedRouter(root=skillsRoot) {
  const entries=skillCatalog(root).filter(m=>m.lifecycle==='verified' && m.technicalValidatedAt && m.validation?.evidence?.length);
  return readFileSync(path.join(skillsRoot,'router-header.md'),'utf8')+(entries.length ? entries.map(m=>`- [${m.title}](${m.id}/SKILL.md): ${m.validation.scope}`).join('\n')+'\n' : 'No verified skills are available yet.\n');
}
export function pinnedMarkdown(ref,slug) {
  if(!/^[a-f0-9]{40}$/.test(ref) || !safeSlug.test(slug)) return null;
  const read=(name)=>execFileSync('git',['show',`${ref}:creator-hub/skills/${slug}/${name}`],{cwd:repoRoot,encoding:'utf8',timeout:5000,maxBuffer:256*1024,stdio:['ignore','pipe','pipe']});
  try { const meta=JSON.parse(read('metadata.json'));if(meta.id!==slug)return null;return read('SKILL.md'); }
  catch { return null; }
}

// Explicit supporting-file allowlist keeps build outputs and private runtime files off raw routes.
export function skillSupport(relative) {
  const allowed = new Set(['catalog.json','sources.json','evidence/validation.json','examples/counter/src/lib.rs','examples/counter/tests/counter.rs','examples/counter/Cargo.toml','examples/counter/Cargo.lock','examples/transaction-state.mjs','examples/transaction-state.test.mjs','examples/economy.py','examples/test_economy.py']);
  for(const m of skillCatalog())allowed.add(`${m.id}/metadata.json`);
  if(!allowed.has(relative))return null;
  return readFileSync(path.join(skillsRoot,relative),'utf8');
}
