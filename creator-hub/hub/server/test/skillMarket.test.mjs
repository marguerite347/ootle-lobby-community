import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createSkillMarket} from '../skillMarket.mjs';
test('profile visibility, ownership, publication, delivery and counted downloads',()=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'skill-market-'));try{
 const m=createSkillMarket(root),{profile,editKey}=m.profile({name:'Maker',projects:['https://example.com/game']});
 assert.equal(profile.showWork,true);assert.equal(profile.projects.length,1);assert.ok(!JSON.stringify(m.catalog()).includes(editKey));
 const input={creatorId:profile.id,kind:'workflow',title:'Build a game',description:'A reproducible workflow',version:'1.0.0',price:0,purpose:'Build',requirements:'Node',setup:'Install',instructions:'Make',verification:'Test',recovery:'Undo'};
 assert.throws(()=>m.publish(input,'wrong'),/edit key/);
 for(const bad of [null,[],{}, {...input,price:-1},{...input,setup:''},{...input,kind:'bad'}])assert.throws(()=>m.publish(bad,editKey));
 const l=m.publish(input,editKey);assert.ok(m.download(l.id,'abcdefghijklmnop').files['WORKFLOW.md'].includes('## Verification'));
 m.download(l.id,'abcdefghijklmnop');assert.equal(m.catalog().listings.find(x=>x.id===l.id).downloads,1);
 const paid=m.publish({...input,price:5},editKey);assert.throws(()=>m.download(paid.id,'abcdefghijklmnop'),/Checkout/);assert.equal(m.catalog().listings.find(x=>x.id===paid.id).instructions,undefined);
 assert.throws(()=>m.update(profile.id,{name:'Fake',projects:[]},'wrong'),/edit key/);
 m.update(profile.id,{name:'Maker',showWork:false,showActivity:false,projects:['https://example.com']},editKey);
 const hidden=m.catalog().creators.find(x=>x.id===profile.id);assert.deepEqual(hidden.projects,[]);assert.equal(hidden.showActivity,false);
 assert.throws(()=>m.profile({name:'Bad',projects:['javascript:alert(1)']}),/HTTP/);
 assert.equal(createSkillMarket(root).catalog().listings.find(x=>x.id===l.id).downloads,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('readable code is discoverable and downloads the exact onboarding skill', async () => {
 const root=mkdtempSync(path.join(os.tmpdir(),'skill-readable-'));
 try {
  const market=createSkillMarket(root);
  const listing=market.catalog().listings.find(item=>item.id==='readable-code');
  assert.equal(listing.title,'Readable Code');
  assert.equal(listing.creatorId,'m4r1m0');
  assert.equal(listing.price,0);
  assert.match(listing.sourceUrl,/m4r1m0\/skillz\/blob\/[a-f0-9]{40}\/readable-code$/);
  assert.ok(market.catalog().creators.some(creator=>creator.id===listing.creatorId));
  const {readFileSync}=await import('node:fs');
  const canonical=readFileSync(new URL('../../../../.agents/skills/readable-code/SKILL.md',import.meta.url),'utf8');
  const download=market.download(listing.id,'readable-test-visitor');
  assert.equal(download.files['SKILL.md'],canonical);
  assert.equal(download.source,listing.sourceUrl);
 } finally {rmSync(root,{recursive:true,force:true});}
});

test('all pinned game topics and creator skills are discoverable with complete local bundles', async () => {
 const root=mkdtempSync(path.join(os.tmpdir(),'skill-library-'));
 try {
  const {readFileSync}=await import('node:fs');
  const manifest=JSON.parse(readFileSync(new URL('../../../../skills/hub-catalog.json',import.meta.url),'utf8'));
  const lock=JSON.parse(readFileSync(new URL('../../../../skills/upstream-lock.json',import.meta.url),'utf8'));
  const gamePaths=Object.keys(lock.files).filter(p=>p.endsWith('/SKILL.md'));
  assert.equal(gamePaths.length,74);
  for(const relative of gamePaths) assert.ok(manifest.some(e=>e.directory===`skills/vendor/gamedev/${relative.slice(0,-9)}`));
  const market=createSkillMarket(root), catalog=market.catalog();
  assert.equal(new Set(catalog.listings.map(l=>l.id)).size,catalog.listings.length);
  for(const entry of manifest){
   assert.ok(catalog.listings.some(l=>l.id===entry.id));
   const bundle=market.download(entry.id,'complete-library-test');
   assert.equal(bundle.files['SKILL.md'],readFileSync(new URL(`../../../../${entry.directory}/SKILL.md`,import.meta.url),'utf8'));
   if(entry.creatorId==='gamedev-skills'){
    assert.match(bundle.files.LICENSE,/Apache License/);
    for(const relative of Object.keys(lock.files).filter(p=>p.startsWith(entry.directory.replace('skills/vendor/gamedev/','')+'/'))){
     assert.ok(relative.slice(entry.directory.replace('skills/vendor/gamedev/','').length+1) in bundle.files);
    }
   }
  }
  const demo=market.download('creator-hub-demo-capture','complete-library-test');
  assert.match(demo.files['references/trailer-workflow.md'],/Remotion/);
 } finally {rmSync(root,{recursive:true,force:true});}
});

test('skill categories reuse Learn taxonomy and include every public listing',async()=>{
 const {learningCategories}=await import('../learningCategories.mjs');
 const root=mkdtempSync(path.join(os.tmpdir(),'skill-categories-'));
 try {
  const view=createSkillMarket(root).catalog();
  assert.deepEqual(view.categories.map(c=>c.id),learningCategories.map(c=>c.id));
  const ids=new Set(view.categories.map(c=>c.id));
  assert.ok(view.listings.every(l=>l.categories.length && l.categories.every(id=>ids.has(id))));
  assert.ok(view.listings.find(l=>l.id==='tari-frontend-integration').categories.includes('tari-ootle'));
  assert.ok(view.listings.some(l=>/Unreal Blueprints/.test(l.title)&&l.categories.includes('blueprints-verse')));
  assert.ok(!JSON.stringify(view.categories).includes('pattern'));
  assert.ok(view.listings.filter(l=>l.categories.includes('agent-workflows')).length < view.listings.length);
  assert.ok(view.listings.find(l=>l.title==='Craft Critique (Koster Method)').categories.includes('game-design'));
 }finally{rmSync(root,{recursive:true,force:true});}
});
