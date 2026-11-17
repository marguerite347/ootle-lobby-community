import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILDER_SOURCES,monitorBuilderResources,observationReader,builderMaintenanceIssues,readCatalogue} from '../scripts/monitor-builder-resources.mjs';
const address='a'.repeat(64),doc='docs/developer-docs/src/content/docs/guides/new.mdx';
const item={template_name:'Example',template_address:address,author_public_key:'b'.repeat(64),binary_hash:'c'.repeat(64),at_epoch:1};
const release={tag_name:'v0.54.0',body:'Reviewed release notes',published_at:'2026-11-17T09:00:00Z',html_url:'https://github.com/tari-project/tari-ootle/releases/tag/v0.54.0'};
const sources={indexerA:{entries:[item]},indexerB:{entries:[item]},release,guides:{truncated:false,sha:'revision',tree:[{type:'blob',path:doc,sha:'first'}]}};
const now=()=>new Date('2026-11-17T18:00:00Z');
const readFor=values=>async url=>{const id=Object.keys(BUILDER_SOURCES).find(id=>BUILDER_SOURCES[id]===url);if(values[id] instanceof Error)throw values[id];return structuredClone(values[id]);};
const run=overrides=>monitorBuilderResources({catalogue:{entries:[]},read:readFor(sources),now,...overrides});
test('new templates, guides and stable releases become review candidates; unchanged content is quiet',async()=>{
 const first=await run();assert.equal(first.complete,true);assert.deepEqual(first.candidates.map(x=>x.kind),['template','release','guide']);
 const next=await run({catalogue:first.nextCatalogue,baseline:first.checkpoint,records:[{sourceUrl:release.html_url,sourceContentSha256:first.checkpoint.release.sourceContentSha256}]});
 assert.deepEqual(next.candidates,[]);
 const changed=structuredClone(sources);changed.guides.tree[0].sha='second';changed.release={...release,body:'Corrected release notes'};
 const third=await run({catalogue:first.nextCatalogue,baseline:first.checkpoint,read:readFor(changed),records:[{sourceUrl:release.html_url,sourceContentSha256:first.checkpoint.release.sourceContentSha256}]});
 assert.deepEqual(third.candidates.map(x=>x.kind),['release','guide']);
});
test('one unavailable source preserves the catalogue while independent discoveries continue',async()=>{
 const report=await run({read:readFor({...sources,indexerA:new Error('HTTP 403')})});
 assert.equal(report.complete,false);assert.equal(report.nextCatalogue,null);assert.equal(report.candidates.length,2);
});
test('conflicting, truncated, duplicate and disappearing templates never replace accepted content',async()=>{
 for(const entries of [[{...item,binary_hash:'d'.repeat(64)}],[item,item],Array(100).fill(item)]){
  const r=await run({read:readFor({...sources,indexerB:{entries}})});assert.equal(r.nextCatalogue,null);assert.equal(r.complete,false);
 }
 const r=await run({catalogue:{entries:[{address:'e'.repeat(64)}]}});assert.equal(r.nextCatalogue,null);
});
test('truncated docs and prereleases cannot masquerade as a successful stable update',async()=>{
 const r=await run({read:readFor({...sources,guides:{...sources.guides,truncated:true},release:{...release,prerelease:true}})});
 assert.equal(r.complete,false);assert.equal(r.candidates.filter(x=>x.kind!=='template').length,0);
});
test('source fallbacks require fresh attributed observations',async()=>{
 const url=BUILDER_SOURCES.indexerA;
 await assert.rejects(observationReader({[url]:{checkedAt:'2026-11-16T00:00:00Z',method:'text',data:{}}},now())(url),/fresh/);
 assert.deepEqual(await observationReader({[url]:{checkedAt:now().toISOString(),method:'trusted text',data:sources.indexerA}},now())(url),sources.indexerA);
});
test('the daily completion gate rejects omitted sources, unresolved candidates and stale reports',async()=>{
 const r=await run();assert.ok(builderMaintenanceIssues(null,{},'2026-11-17').length);
 assert.equal(builderMaintenanceIssues(r,{},'2026-11-17').length,3);
 const decisions=Object.fromEntries(r.candidates.map(c=>[c.id,{status:'published',evidence:'release receipt'}]));
 assert.deepEqual(builderMaintenanceIssues(r,decisions,'2026-11-17'),[]);
 assert.ok(builderMaintenanceIssues(r,decisions,'2026-11-18').length);
});
test('template discovery follows the official address cursor and rejects repeated pages',async()=>{
 const entries=Array.from({length:100},(_,i)=>({...item,template_address:i.toString(16).padStart(64,'0')}));
 const urls=[];
 const data=await readCatalogue(async url=>{urls.push(url);return {entries:urls.length===1?entries:[item]};},BUILDER_SOURCES.indexerA);
 assert.equal(data.entries.length,101);assert.equal(data.complete,true);
 assert.equal(urls[1],`${BUILDER_SOURCES.indexerA}&after=${entries.at(-1).template_address}`);
 await assert.rejects(readCatalogue(async()=>({entries}),BUILDER_SOURCES.indexerA),/Duplicate/);
});
