import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,renameSync,rmSync,unwatchFile} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const tmp=mkdtempSync(path.join(tmpdir(),'hub-refresh-'));
process.env.CREATOR_HUB_DATA_DIR=tmp;
const catalog=await import('../catalog.mjs');
const {seedCatalog,cacheCatalog}=await import('../paths.mjs');
after(()=>{unwatchFile(seedCatalog);unwatchFile(cacheCatalog);rmSync(tmp,{recursive:true,force:true});});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<30;i++){if(fn())return;await wait(100);}assert.ok(fn(),'catalog should reload within 3 seconds');}
function publish(id){mkdirSync(path.dirname(cacheCatalog),{recursive:true});writeFileSync(cacheCatalog+'.tmp',JSON.stringify({records:[{id}],sources:[]}));renameSync(cacheCatalog+'.tmp',cacheCatalog);}
test('catalog follows first cache creation and repeated atomic replacements',async()=>{
 catalog.load();catalog.watchCatalog();publish('first');await until(()=>catalog.all().some(r=>r.id==='first'));
 publish('second');await until(()=>catalog.all().some(r=>r.id==='second'));
 assert.ok(!catalog.all().some(r=>r.id==='first'));
 writeFileSync(cacheCatalog+'.tmp','broken json');renameSync(cacheCatalog+'.tmp',cacheCatalog);await wait(1200);
 assert.ok(catalog.all().some(r=>r.id==='second'),'bad refresh must retain last-good projection');
 writeFileSync(cacheCatalog,JSON.stringify({records:null,sources:[]}));
 assert.throws(()=>catalog.load(),/Invalid catalog/);
 assert.ok(catalog.all().some(r=>r.id==='second'),'valid JSON with invalid shape must retain last-good projection');
});
