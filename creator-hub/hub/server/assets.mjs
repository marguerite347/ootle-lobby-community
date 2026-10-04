// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.
import {validateCommerceDraft,newCommerceDraft,MARKET_TEMPLATE,NFT_TEMPLATE} from '../shared/assetCommerce.mjs';
// Community uploads are runtime data. Never extract or execute submitted files.
import {mkdirSync,writeFileSync,readFileSync,readdirSync,existsSync,renameSync,rmSync} from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {runtimeDir} from './paths.mjs';
const root=path.join(runtimeDir,'assets');
const MAX=10*1024*1024;
const fail=message=>{throw Object.assign(new Error(message),{status:400});};
const string=(value,max)=>typeof value==='string' && value.trim().length>0 && value.length<=max;
export function assetBucket(r){
 if(r.assetKind)return r.assetKind;
 if(['starter','component'].includes(r.type))return null;
 if(r.id==='creative:learn:bevyengine-bevy-assets')return 'pack';
 if(r.type==='asset')return r.provenance?.sourceId==='polyhaven' || r.id.startsWith('polyhaven:')?'asset':'pack';
 if(/asset|audio|sound|sprite|texture|blender|comfy|remotion/i.test([r.title,r.category,...(r.tags||[])].join(' ')))return 'workflow';
 return null;
}
export function listUploads(){
 if(!existsSync(root))return [];
 return readdirSync(root).filter(id=>/^upload-[a-f0-9-]{36}$/.test(id)).map(id=>currentRecord(id));
}
export function upload(body){
 if(!body || !string(body.title,120)||!string(body.creator,120)||!string(body.description,2000)||(body.license!=null&&(typeof body.license!=='string'||body.license.length>1000))||!['asset','pack','workflow'].includes(body.kind))fail('Provide title, creator, description and category.');
 if(!string(body.filename,180)||/[\/\\\x00-\x1f]/.test(body.filename))fail('Invalid filename.');
 const ext=path.extname(body.filename).toLowerCase();
 if(!['.png','.jpg','.jpeg','.webp','.gif','.wav','.mp3','.ogg','.glb','.zip','.json'].includes(ext))fail('Supported files: PNG, JPG, WebP, GIF, WAV, MP3, OGG, GLB, ZIP and JSON.');
 if(typeof body.base64!=='string'||body.base64.length>Math.ceil(MAX/3)*4||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.base64))fail('Invalid file encoding or file exceeds 10 MB.');
 const bytes=Buffer.from(body.base64,'base64');if(!bytes.length||bytes.length>MAX)fail('File must be between 1 byte and 10 MB.');
 if(ext==='.json'){try{JSON.parse(bytes.toString('utf8'));}catch{fail('Invalid JSON file.');}}
 const commerce=validateCommerceDraft(body.commerce ?? newCommerceDraft());
 const id=`upload-${randomUUID()}`;
 const record={prerequisites:[],compatibility:[],relationships:[],signals:{},id,title:body.title.trim(),summary:body.description.trim(),creator:{name:body.creator.trim()},license:body.license?.trim()||null,rightsReview:'deferred',commerce,commerceRevision:1,commerceState:'draft',access:commerce.sale.mode==='free'?'free':'sale-draft',assetKind:body.kind,type:body.kind==='workflow'?'learn':'asset',ecosystem:'community',native:false,tags:['community-upload',body.kind],verification:'unverified',readiness:'community-upload',sourceUrl:`/api/assets/${id}/file`,filename:body.filename,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),createdAt:new Date().toISOString(),provenance:{sourceId:'community-uploads',sourceName:'Community uploads',freshness:'user-submitted'}};
 mkdirSync(root,{recursive:true});const staging=path.join(root,`.pending-${id}`);mkdirSync(staging);
 try{writeFileSync(path.join(staging,'file'),bytes,{flag:'wx'});writeFileSync(path.join(staging,'metadata.json'),JSON.stringify(record,null,2),{flag:'wx'});renameSync(staging,path.join(root,id));}catch(e){rmSync(staging,{recursive:true,force:true});throw e;}
 return record;
}
export function download(id){if(!/^upload-[a-f0-9-]{36}$/.test(id))return null;const dir=path.join(root,id);if(!existsSync(path.join(dir,'metadata.json')))return null;return {file:path.join(dir,'file'),record:JSON.parse(readFileSync(path.join(dir,'metadata.json'),'utf8'))};}
export const builtins=[
 {id:'asset-workflow:comfyui',title:'ComfyUI concept backgrounds',summary:'Generate concept images with the SDXL graph, inspect wiring and reuse the result in your project.',type:'learn',assetKind:'workflow',sourceUrl:'/api/workflows/comfy-example'},
 {id:'asset-workflow:video',title:'Branded video assembly',summary:'Turn captured gameplay and approved assets into a promotional video using the existing video templates.',type:'learn',assetKind:'workflow',sourceUrl:'/create/video'},
].map(r=>({...r,prerequisites:[],compatibility:[],relationships:[],signals:{},readiness:'conceptual',ecosystem:'creative',tags:['asset-workflow'],native:false,verification:'unverified',license:'See workflow documentation and model or tool terms',provenance:{sourceId:'hub-workflows',sourceName:'Ootle Lobby workflows'}}));

function currentRecord(id){
 const record=JSON.parse(readFileSync(path.join(root,id,'metadata.json'),'utf8'));
 const file=path.join(root,id,'commerce-history.json');
 const history=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):[];
 const latest=history.at(-1);
 return latest?{...record,commerce:latest.commerce,commerceRevision:latest.revision,commerceState:'draft',access:latest.commerce.sale.mode==='free'?'free':'sale-draft'}:record;
}
export function saveCommerce(id,body){
 if(!download(id))throw Object.assign(new Error('Uploaded asset not found'),{status:404});
 const record=currentRecord(id);
 if(body?.expectedRevision!==(record.commerceRevision||1))throw Object.assign(new Error('Draft changed. Reload before saving.'),{status:409});
 const commerce=validateCommerceDraft(body.commerce);
 const file=path.join(root,id,'commerce-history.json');
 const history=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):[{revision:1,savedAt:record.createdAt,commerce:record.commerce||newCommerceDraft()}];
 history.push({revision:(record.commerceRevision||1)+1,savedAt:new Date().toISOString(),commerce});
 writeFileSync(file+'.tmp',JSON.stringify(history,null,2));renameSync(file+'.tmp',file);
 return currentRecord(id);
}
export function commerceManifest(id){
 if(!download(id))return null;
 const record=currentRecord(id);
 return {schemaVersion:1,kind:'ootle-asset-commerce-authoring-plan',state:'draft',network:null,asset:{id,title:record.title,sha256:record.sha256,filename:record.filename,bytes:record.bytes},revision:record.commerceRevision||1,configuration:record.commerce||newCommerceDraft(),templates:{marketplace:MARKET_TEMPLATE,nft:NFT_TEMPLATE},deployment:{wallet:null,marketComponent:null,nftResource:null,transactionId:null},nextSteps:['Adapt and test the pinned marketplace contract for digital delivery.','Generate the selected NFT schema and enforce its authority rules in native Ootle templates.','Connect a selected network and wallet, deploy and validate before enabling mint or purchase.'],rightsReview:'deferred'};
}
export function assetSearch(records,query={}){
 const all=records.filter(r=>assetBucket(r)).map(r=>({...r,assetKind:assetBucket(r)})).sort((a,b)=>Number(b.access==='free')-Number(a.access==='free'));
 const providers=[...new Map(all.map(r=>[r.provenance?.sourceId||'unknown',r.provenance?.sourceName||'Other'])).entries()].map(([id,name])=>({id,name}));
 const matching=all.filter(r=>(!query.kind||r.assetKind===query.kind)&&(!query.provider||r.provenance?.sourceId===query.provider)&&(!query.access||r.access===query.access)&&(!query.q||[r.title,r.summary,r.category,...(r.tags||[])].join(' ').toLowerCase().includes(String(query.q).toLowerCase())));
 const start=Number(query.offset),size=Number(query.limit);
 const offset=Number.isFinite(start)?Math.max(0,Math.floor(start)):0;const limit=Number.isFinite(size)&&size>0?Math.min(96,Math.floor(size)||1):48;
 return {total:matching.length,offset,limit,providers,items:matching.slice(offset,offset+limit)};
}
