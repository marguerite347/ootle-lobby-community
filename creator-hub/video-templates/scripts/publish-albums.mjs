#!/usr/bin/env node
// Install explicitly reviewed renders; never infer visual approval from a file existing.
import{readFileSync,writeFileSync,copyFileSync,mkdirSync,renameSync,existsSync,unlinkSync}from'node:fs';
import{createHash}from'node:crypto';import path from'node:path';import{fileURLToPath}from'node:url';
import{previewsDir}from'../../hub/server/paths.mjs';import{approvedGeneratedPreview}from'../../hub/server/preview-policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const approvalPath=process.argv[2];if(!approvalPath)throw Error('Pass an explicit reviewed approval JSON file.');
const approvals=JSON.parse(readFileSync(approvalPath,'utf8'));
const drafts=JSON.parse(readFileSync(path.join(root,'out/albums/draft.json'),'utf8'));
const index=path.join(previewsDir,'catalog-index.json');mkdirSync(previewsDir,{recursive:true});
const old=existsSync(index)?JSON.parse(readFileSync(index,'utf8')):[];
const published=new Map(old.map(e=>[e.id,e]));const ids=new Set();
// Validate the entire batch before copying or changing the index.
const ready=approvals.map(a=>{if(ids.has(a.id))throw Error('Duplicate approval ID');ids.add(a.id);
 const d=drafts.find(d=>d.id===a.id);if(!d)throw Error('No draft for '+a.id);
 const hash=createHash('sha256').update(readFileSync(d.video)).digest('hex');
 if(hash!==a.review?.videoSha256)throw Error('Review is stale: '+a.id);
 const e={id:d.id,name:d.title,source:'cover',image:`/previews/${d.name}.poster.png`,video:`/previews/${d.name}.mp4`,review:a.review};
 if(!approvedGeneratedPreview(e))throw Error('Incomplete review: '+a.id);
 return{d,e};});
for(const{d,e}of ready){for(const[file,dest]of[[d.video,e.video],[d.image,e.image]]){const target=path.join(previewsDir,path.basename(dest));if(!existsSync(target)){const temp=target+'.'+process.pid+'.tmp';try{copyFileSync(file,temp);if(!readFileSync(file).equals(readFileSync(temp)))throw Error('Incomplete artifact copy: '+target);renameSync(temp,target);}finally{if(existsSync(temp))unlinkSync(temp);}}else if(!readFileSync(file).equals(readFileSync(target)))throw Error('Immutable artifact collision: '+target);}published.set(e.id,e);}
writeFileSync(index+'.tmp',JSON.stringify([...published.values()],null,2));renameSync(index+'.tmp',index);
console.log(`Installed ${ready.length} reviewed album covers in ${previewsDir}`);
