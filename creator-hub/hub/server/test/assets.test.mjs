import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(tmpdir(),'hub-assets-'));process.env.CREATOR_HUB_DATA_DIR=dir;
const assets=await import('../assets.mjs');const catalog=await import('../catalog.mjs');const {createApp}=await import('../app.mjs');
after(()=>rmSync(dir,{recursive:true,force:true}));
const valid={title:'My workflow',creator:'Test creator',description:'Reusable example',license:'CC0',kind:'workflow',rightsConfirmed:true,filename:'workflow.json',base64:Buffer.from('{"nodes":[]}').toString('base64')};
test('upload becomes discoverable and downloads exactly the original bytes',async()=>{
 const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const url=`http://127.0.0.1:${server.address().port}`;
 try{
  const response=await fetch(url+'/api/assets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});assert.equal(response.status,201);const record=await response.json();
  assert.ok(assets.listUploads().some(a=>a.id===record.id));assert.equal(catalog.get(record.id).title,valid.title);assert.ok(catalog.search({q:'My workflow'}).some(a=>a.id===record.id));
  const library=await (await fetch(url+'/api/assets?provider=community-uploads')).json();assert.ok(library.items.some(a=>a.id===record.id));
  const config=record.commerce;config.nft.enabled=true;config.nft.collectionName='Test collection';
  const saved=await fetch(url+`/api/assets/${record.id}/commerce`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedRevision:1,commerce:config})});assert.equal(saved.status,200);
  const exported=await fetch(url+`/api/assets/${record.id}/commerce`);assert.match(exported.headers.get('content-disposition'),/attachment/);const plan=await exported.json();assert.equal(plan.revision,2);assert.equal(plan.configuration.nft.enabled,true);assert.equal(plan.network,null);
  const file=await fetch(url+record.sourceUrl);assert.equal(file.status,200);assert.match(file.headers.get('content-disposition'),/attachment/);assert.equal(file.headers.get('x-content-type-options'),'nosniff');assert.equal(await file.text(),'{"nodes":[]}');
 }finally{await new Promise(r=>server.close(r));}
});
test('reject invalid uploads without creating entries',()=>{
 const count=assets.listUploads().length;
 for(const change of [{filename:'../../bad.json'},{filename:'run.html'},{license:42},{kind:'unknown'},{base64:'bad!'},{base64:Buffer.from('invalid json').toString('base64')},{base64:'a'.repeat(14*1024*1024)}])assert.throws(()=>assets.upload({...valid,...change}));
 assert.equal(assets.listUploads().length,count);assert.equal(assets.download('../escape'),null);
});
test('category projection separates assets from game foundations',()=>{
 assert.equal(assets.assetBucket({id:'polyhaven:asset:x',type:'asset'}),'asset');
 assert.equal(assets.assetBucket({id:'creative:asset:x',type:'asset'}),'pack');
 assert.equal(assets.assetBucket({title:'Audio creation',type:'learn'}),'workflow');
 assert.equal(assets.assetBucket({title:'Platformer',type:'starter'}),null);
});

 test('licensing review can be deferred and commerce drafts retain history',()=>{
  const record=assets.upload({...valid,license:undefined,rightsConfirmed:undefined});
  assert.equal(record.license,null);assert.equal(record.rightsReview,'deferred');
  const input=assets.commerceManifest(record.id).configuration;
  input.sale={mode:'fixed-price',price:'12.50',currencyLabel:'TARI',inventory:10};
  input.nft.enabled=true;input.nft.collectionName='Forest tools';
  const updated=assets.saveCommerce(record.id,{expectedRevision:1,commerce:input});
  assert.equal(updated.commerceRevision,2);assert.equal(updated.access,'sale-draft');
  const manifest=assets.commerceManifest(record.id);
  assert.equal(manifest.network,null);assert.equal(manifest.deployment.transactionId,null);assert.equal(manifest.state,'draft');
  assert.equal(manifest.asset.sha256,record.sha256);assert.equal(manifest.configuration.sale.price,'12.50');
  assert.throws(()=>assets.saveCommerce(record.id,{expectedRevision:1,commerce:input}),e=>e.status===409);
  assert.throws(()=>assets.saveCommerce(record.id,{expectedRevision:2,commerce:{...input,sale:{...input.sale,price:'-1'}}}));
 });
 test('asset search paginates and filters providers, free items and sale drafts',()=>{
  const list=Array.from({length:120},(_,i)=>({id:'asset'+i,type:'asset',assetKind:'asset',title:'Stone '+i,access:i%2?'free':'sale-draft',provenance:{sourceId:'provider',sourceName:'Provider'}}));
  const first=assets.assetSearch(list,{access:'free',limit:'24'});assert.equal(first.total,60);assert.equal(first.items.length,24);
  const second=assets.assetSearch(list,{access:'free',limit:'24',offset:'24'});assert.equal(second.items.length,24);assert.notEqual(first.items[0].id,second.items[0].id);
  assert.equal(assets.assetSearch(list,{provider:'missing'}).total,0);
 });
