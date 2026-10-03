import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {runtimeDir} from './paths.mjs';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const text=(value,max)=>typeof value==='string'&&value.trim()&&value.length<=max?value.trim():fail('Complete the build description, cost scope and version');
function amount(value,optional=false){
    if(optional&&(value===null||value===undefined))return null;
    if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1000000)fail('Costs and hours must be nonnegative numbers; leave unknown optional values blank');
    return Math.round(value*100)/100;
}
function demoUrl(value){
    let url;try{url=new URL(value);}catch{fail('Provide a working HTTP or HTTPS demo link');}
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.href.length>2000)fail('Use a demo link without embedded credentials');
    return url.href;
}
function normalize(input){
    if(!input||typeof input!=='object'||Array.isArray(input))fail('Provide a build entry');
    if(input.shareConfirmed!==true)fail('Confirm that this cost report can be shared');
    if(!['game','app','media'].includes(input.category)||!['prototype','release'].includes(input.stage))fail('Choose a category and build stage');
    const costs={ai:amount(input.costs?.ai),assets:amount(input.costs?.assets),other:amount(input.costs?.other)};
    return {title:text(input.title,120),description:text(input.description,600),version:text(input.version,100),scope:text(input.scope,1500),demoUrl:demoUrl(input.demoUrl),category:input.category,stage:input.stage,costs,cashUsd:Math.round(Object.values(costs).reduce((sum,cost)=>sum+cost,0)*100)/100,creditUsd:amount(input.creditUsd,true),hours:amount(input.hours,true)};
}
export function createBuildBudgets(root=runtimeDir){
    const file=path.join(root,'build-budgets.json');
    const read=()=>{try{return JSON.parse(readFileSync(file,'utf8'));}catch(error){if(error.code==='ENOENT')return [];throw error;}};
    const save=entries=>{mkdirSync(root,{recursive:true});writeFileSync(file+'.tmp',JSON.stringify(entries,null,2),{mode:0o600});renameSync(file+'.tmp',file);};
    const owned=(entries,id,creatorId)=>entries.find(entry=>entry.id===id&&entry.creatorId===creatorId)||fail('Build entry not found',404);
    return {
        list(creators){
            const visible=new Map(creators.filter(creator=>creator.showWork&&creator.showActivity).map(creator=>[creator.id,creator]));
            return read().filter(entry=>visible.has(entry.creatorId)).map(({reviews,...entry})=>({...entry,creatorName:visible.get(entry.creatorId).name,recommendations:reviews.filter(review=>visible.has(review.creatorId)).length,costStatus:'self-reported'}));
        },
        submit(creatorId,input){
            const data=normalize(input),entries=read();
            let entry=entries.find(item=>item.creatorId===creatorId&&item.demoUrl===data.demoUrl);
            if(entry){
                if(input.expectedRevision!==entry.revision)fail('This build already exists. Refresh and edit the current report.',409);
                Object.assign(entry,data,{revision:entry.revision+1,reviews:[],updatedAt:new Date().toISOString()});
            }else{entry={id:randomUUID(),creatorId,...data,revision:1,reviews:[],updatedAt:new Date().toISOString()};entries.push(entry);}
            save(entries);return {id:entry.id,revision:entry.revision};
        },
        recommend(id,creatorId,input){
            const entries=read(),entry=entries.find(item=>item.id===id)||fail('Build entry not found',404);
            if(entry.creatorId===creatorId)fail('Recommend another creator’s build',400);
            if(input?.tested!==true)fail('Try the demo before recommending it');
            if(input.expectedRevision!==entry.revision)fail('Build changed. Try the current version before recommending it.',409);
            if(!entry.reviews.some(review=>review.creatorId===creatorId))entry.reviews.push({creatorId,at:new Date().toISOString()});
            save(entries);return {ok:true};
        },
        withdraw(id,creatorId,input){
            const entries=read(),entry=owned(entries,id,creatorId);
            if(input?.expectedRevision!==entry.revision)fail('Build changed. Refresh before withdrawing.',409);
            save(entries.filter(item=>item!==entry));return {ok:true};
        }
    };
}
