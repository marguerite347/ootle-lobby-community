import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {agentResourceIndex, agentSkillBundle} from '../agentResources.mjs';
import {withAgentGuideLink} from '../agentShell.mjs';
import {clientDist} from '../paths.mjs';
import {createApp} from '../app.mjs';
import path from 'node:path';

test('agent discovery paginates and searches without loading skill bodies', () => {
 const first = agentResourceIndex({limit:'2'}); const second = agentResourceIndex({offset:String(first.nextOffset),limit:'2'});
 assert.equal(first.items.length,2); assert.notEqual(first.items[0].id,second.items[0].id);
 assert.ok(agentResourceIndex({q:'resource-first'}).items.some(item=>item.id==='resource-first-workflow'));
 assert.ok(!('files' in first.items[0]));
 for(const input of [{q:[]},{q:null},{offset:'-1'},{limit:'51'},{limit:false}])assert.throws(()=>agentResourceIndex(input),{status:400});
});
test('portable bundle preserves files and hashes, unknown names cannot read files', () => {
 const bundle=agentSkillBundle('resource-first-workflow');
 assert.ok(bundle.files['references/selection-record.md']); assert.ok(bundle.files['scripts/discover.py']);
 for(const [name,content] of Object.entries(bundle.files))assert.equal(bundle.sha256[name],createHash('sha256').update(content).digest('hex'));
 assert.equal(agentSkillBundle('../../AGENTS.md'),null);
});
test('any HTTP client can read entrypoint, index, skill and relative support files without authentication', async () => {
 const server=createApp().listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  for(const path of ['/agent-start','/agent-start.md','/api/agent-resources?q=resource-first','/agent-skills/resource-first-workflow/SKILL.md','/agent-skills/resource-first-workflow/bundle.json','/agent-skills/resource-first-workflow/references/selection-record.md'])assert.equal((await fetch(base+path)).status,200,path);
  const guidePage = await fetch(base+'/agent-start');
  assert.match(guidePage.headers.get('content-type'),/html/);
  const home = await fetch(base+'/');
  const homeHtml = await home.text();
  assert.equal(home.status,200);
  assert.match(home.headers.get('content-type'),/html/);
  assert.match(homeHtml,/class="agent-guide-link" href="\/agent-start"/);
  assert.match(homeHtml,/Build with an agent/);
  assert.equal(homeHtml.includes('href="/agent-start.md"'),false);
  const shell = readFileSync(new URL('../../client/index.html',import.meta.url),'utf8');
  assert.match(shell,/class="agent-guide-link"/);
  assert.match(shell,/href="\/agent-start"/);
  assert.equal(shell.includes('href="/agent-start.md"'),false);
  const upgraded = withAgentGuideLink('<html><head></head><body><p><a href="/agent-start.md">Build with an agent</a></p><div id="root"></div></body></html>');
  assert.match(upgraded,/class="agent-guide-link" href="\/agent-start"/);
  assert.equal(upgraded.includes('href="/agent-start.md"'),false);
  assert.equal((upgraded.match(/href="\/agent-start"/g)||[]).length,1);
  if (existsSync(path.join(clientDist,'index.html'))) {
   const projectsPage = await fetch(base+'/projects');
   const projectsHtml = await projectsPage.text();
   assert.equal(projectsPage.status,200);
   assert.match(projectsHtml,/class="agent-guide-link" href="\/agent-start"/);
   assert.equal(projectsHtml.includes('href="/agent-start.md"'),false);
  }
  const entryGuide = await (await fetch(base+'/agent-start.md')).text();
  assert.match(entryGuide, /# AI Agents · Speedrun/);
  assert.match(entryGuide, /Creator Stack/);
  assert.match(entryGuide, /Never print `managementKey`/);
  assert.match(entryGuide, /AGENT_BUILD_REFERENCE.md/);
  const guide = readFileSync(new URL('../../AGENT_BUILD_REFERENCE.md', import.meta.url), 'utf8');
  assert.equal(guide.includes('BUILD_TOOLKIT_SETUP.md'),false);
  assert.equal(guide.includes(':4210'),false);
  assert.equal(guide.includes(':4198'),false);
  assert.match(guide,/fromRef/);
  assert.match(guide,/expectedHead/);
  assert.match(guide,/newHead=\$\(printf/);
  assert.match(guide,/-o "\$FORK_FILE"/);
  assert.ok(guide.indexOf('-o "$FORK_FILE"') < guide.indexOf('.project.id'));
  assert.match(guide,/Never print `managementKey`/);
  assert.match(guide,/Do not print, log, jq/);
  assert.equal(/jq[^\n]*\.managementKey/.test(guide), false);
  assert.match(guide,/private local store/);
  const games = await fetch(base+'/api/games');
  assert.equal(games.status,200);
  assert.deepEqual(await games.json(),{originals:[],remixes:[]});
  assert.equal((await fetch(base+'/api/quick-remix',{method:'POST'})).status,404);
  for(const path of ['/agent-skills/unknown/SKILL.md','/agent-skills/resource-first-workflow/AGENTS.md','/agent-skills/resource-first-workflow/__proto__'])assert.equal((await fetch(base+path)).status,404,path);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
