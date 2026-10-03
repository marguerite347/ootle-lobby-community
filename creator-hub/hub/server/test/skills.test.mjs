import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import os from 'node:os';import path from 'node:path';
import {skillsRoot,skillCatalog,skillMarkdown,verifiedRouter,pinnedMarkdown} from '../skills.mjs';
import {createApp} from '../app.mjs';
test('native catalog exposes authored topics but router excludes drafts',()=>{
  const entries=skillCatalog();assert.equal(entries.length,18);
  assert.ok(skillMarkdown('wallets-transactions').includes('OnlyFeeAccepted'));
  assert.ok(!verifiedRouter().includes('(wallets-transactions/SKILL.md)'));
  assert.ok(verifiedRouter().includes('(developer-setup/SKILL.md)'));
  assert.equal(skillMarkdown('../../AGENTS'),null);
  assert.equal(pinnedMarkdown('HEAD','developer-setup'),null);
});
test('stale and deprecated transitions remove guidance without hiding its history',()=>{
  const dir=mkdtempSync(path.join(os.tmpdir(),'native-skills-'));
  try {mkdirSync(path.join(dir,'example'));const m={id:'example',title:'Example',lifecycle:'verified',technicalValidatedAt:'2026-09-19',validation:{scope:'local',evidence:['test.json']}};
    const file=path.join(dir,'example','metadata.json');writeFileSync(file,JSON.stringify(m));writeFileSync(path.join(dir,'example','SKILL.md'),'Original guide');
    assert.match(verifiedRouter(dir),/example\/SKILL.md/);
    for(const state of ['draft','stale','deprecated']){m.lifecycle=state;writeFileSync(file,JSON.stringify(m));assert.doesNotMatch(verifiedRouter(dir),/example\/SKILL.md/);assert.equal(skillMarkdown('example',dir),'Original guide');}
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('HTTP catalog and Markdown routes return native data, unknown skill is 404',async()=>{
 const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try {const base=`http://127.0.0.1:${server.address().port}`;
 const router=await (await fetch(`${base}/skills/SKILL.md`)).text();
 assert.equal(router,readFileSync(path.join(skillsRoot,'SKILL.md'),'utf8'));
 assert.match(router,/^---\nname: tariskills\ndescription:/);
 const cat=await fetch(`${base}/api/skills`);assert.equal((await cat.json()).skills.length,18);
 const raw=await fetch(`${base}/skills/developer-setup/SKILL.md`);assert.match(raw.headers.get('content-type'),/text\/markdown/);assert.match(await raw.text(),/cargo test --locked/);
 assert.equal((await fetch(`${base}/skills/unknown-topic/SKILL.md`)).status,404);
 assert.equal((await fetch(`${base}/skills/revisions/not-a-sha/developer-setup/SKILL.md`)).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
