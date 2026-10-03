import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,renameSync,rmSync,unwatchFile} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(tmpdir(),'hub-preview-'));
process.env.CREATOR_HUB_PREVIEWS_DIR=path.join(dir,'previews');
const {createApp}=await import('../app.mjs');const previews=await import('../previews.mjs');
const index=path.join(process.env.CREATOR_HUB_PREVIEWS_DIR,'index.json');
after(()=>{unwatchFile(index);rmSync(dir,{recursive:true,force:true});});
test('first preparation after startup loads and serves media; missing media is not an SPA',async()=>{
 previews.load();previews.watchPreviews();
 const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  mkdirSync(process.env.CREATOR_HUB_PREVIEWS_DIR);writeFileSync(path.join(process.env.CREATOR_HUB_PREVIEWS_DIR,'app.mp4'),'fixture');
  writeFileSync(index+'.tmp',JSON.stringify([{url:'https://example.com',slug:'app',video:'/previews/app.mp4',source:'capture'}]));renameSync(index+'.tmp',index);
  await new Promise(r=>setTimeout(r,1300));
  assert.equal(previews.previewFor({type:'app',title:'Other name',sourceUrl:'https://github.com/other',demoUrl:'https://example.com'}).video,'/previews/app.mp4');
  assert.equal((await fetch(base+'/previews/app.mp4')).headers.get('content-type'),'video/mp4');
  assert.equal((await fetch(base+'/previews/missing.mp4')).status,404);
  assert.ok(previews.previewFor({type:'app',title:'App',preview:{image:'/existing.png'}}).video, 'runtime video upgrades a static image');
  writeFileSync(index,JSON.stringify([{slug:'missing',video:'/previews/missing.mp4'},{slug:'remote',video:'https://external.test/file.mp4'}]));previews.load();
  assert.equal(previews.previewFor({type:'app',title:'missing'}),null);assert.equal(previews.previewFor({type:'app',title:'remote'}),null);
 }finally{await new Promise(r=>server.close(r));}
});
