#!/usr/bin/env node
// Explicit authored scenes only. Rendering does not auto-approve publication.
import{bundle}from '@remotion/bundler';
import{renderMedia,renderStill,selectComposition,openBrowser}from '@remotion/renderer';
import{createHash}from 'node:crypto';
import{mkdirSync,existsSync,writeFileSync,readFileSync,renameSync}from 'node:fs';
import path from 'node:path';
import{fileURLToPath}from 'node:url';
import{scenes}from '../src/album/scenes.mjs';

import{load,search}from '../../hub/server/catalog.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'out','albums');mkdirSync(out,{recursive:true});
load();const resources=search();
const missing=resources.filter(r=>!scenes[r.title]);
if(missing.length)throw Error('Author new bespoke scenes before rendering: '+missing.map(r=>r.title).join(', '));
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts')});
const browser=await openBrowser('chrome');
const sharedSource=['src/album/art.mjs','src/album/frame.mjs','src/compositions/AlbumArt.tsx','src/Root.tsx'].map(p=>readFileSync(path.join(root,p),'utf8')).join('\n');
const renderSettings=JSON.stringify({codec:'h264',crf:22,posterFrame:24});
const localReferences={"asset-workflow:video": "https://github.com/marguerite347/ootle-lobby/blob/main/creator-hub/video-templates/README.md", "asset-workflow:comfyui": "https://github.com/marguerite347/ootle-lobby/blob/main/creator-hub/video-templates/comfyui/README.md"};
const draft=[];let cursor=0;
try{await Promise.all([0].map(async()=>{while(cursor<resources.length){const r=resources[cursor++];const sourceHash=createHash('sha256').update(sharedSource+renderSettings+r.title+scenes[r.title].draw.toString()).digest('hex').slice(0,14);const name='album-'+sourceHash;const video=path.join(out,name+'.mp4');const image=path.join(out,name+'.poster.png');const inputProps={title:r.title};const composition=await selectComposition({serveUrl,id:'AlbumArt',inputProps,puppeteerInstance:browser});
if(!existsSync(video)){const tmp=path.join(out,name+'.tmp.mp4');await renderMedia({serveUrl,composition,inputProps,codec:'h264',outputLocation:tmp,puppeteerInstance:browser,concurrency:2,crf:22});renameSync(tmp,video);}
if(!existsSync(image)){const tmp=image+'.tmp.png';await renderStill({serveUrl,composition,inputProps,output:tmp,frame:24,puppeteerInstance:browser});renameSync(tmp,image);}
draft.push({id:r.id,title:r.title,name,video,image,brief:scenes[r.title].brief,references:[localReferences[r.id]||r.demoUrl||r.docsUrl||r.repoUrl||r.sourceUrl].filter(Boolean),videoSha256:createHash('sha256').update(readFileSync(video)).digest('hex')});writeFileSync(path.join(out,'draft.json'),JSON.stringify(draft,null,2));console.log(`${draft.length}/${resources.length} ${r.title}`);
}}));}finally{await browser.close({silent:true});}
console.log('Draft renders complete. Inspect each output and the library before publishing.');
