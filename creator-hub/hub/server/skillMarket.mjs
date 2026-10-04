// INTEGRATION_GAP[LOBBY-CHECKOUT] (build-required): see docs/DEVELOPMENT_GAPS.md#lobby-checkout.
// INTEGRATION_GAP[LOBBY-COMMUNITY-WRITES] (build-required): see docs/DEVELOPMENT_GAPS.md#lobby-community-writes.
import {learningCategories,categoriesFor} from './learningCategories.mjs';
import {createLearningLoop} from './learningLoop.mjs';
import {contestCreators} from './contestEntries.mjs';
import {bundledSkills,bundledSkillCreators,bundledSkillMarkdown,bundledSkillFiles} from './bundledSkills.mjs';
import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import path from 'node:path';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {runtimeDir} from './paths.mjs';
import {skillCatalog,skillMarkdown} from './skills.mjs';
const sections=['purpose','requirements','setup','instructions','verification','recovery'];
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const text=(v,max=12000)=>typeof v==='string'&&v.trim().length&&v.length<=max?v.trim():fail('Required text is missing or too long');
const object=v=>{if(!v||typeof v!=='object'||Array.isArray(v))fail('Expected an object');return v;};
const links=v=>{if(!Array.isArray(v)||v.length>30)fail('Provide up to 30 project links');return v.map(x=>{let u;try{u=new URL(text(x,1000));}catch{fail('Use HTTP project links');}if(!['https:','http:'].includes(u.protocol))fail('Use HTTP project links');return u.href;});};
const hash=v=>createHash('sha256').update(v).digest('hex');
export function createSkillMarket(root=runtimeDir){
 const learning=createLearningLoop(root);
 const file=path.join(root,'skill-market.json');
 const read=()=>{try{return JSON.parse(readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return {profiles:[],listings:[],events:[]};throw e;}};
 const save=d=>{mkdirSync(root,{recursive:true});writeFileSync(file+'.tmp',JSON.stringify(d,null,2),{mode:0o600});renameSync(file+'.tmp',file);};
 const native=()=>skillCatalog().map(s=>({id:`tari-${s.id}`,kind:'skill',title:s.title,description:s.description,version:s.version,creatorId:'tari',price:0,currency:'USD',publishedAt:null,lifecycle:s.lifecycle,nativeSlug:s.id,validation:s.validation.scope}));
 const publicProfile=p=>({id:p.id,name:p.name,bio:p.bio,showWork:p.showWork,showActivity:p.showActivity,projects:p.showWork?p.projects:[]});
 const authorize=(d,id,token)=>{const p=d.profiles.find(x=>x.id===id);if(!p||typeof token!=='string'||hash(token)!==p.keyHash)fail('Profile edit key required',403);return p;};
 const listings=d=>[...native(),...bundledSkills,...learning.publicListings(),{id:'tari-creator-workflow',creatorId:'tari',kind:'workflow',title:'From starter to shareable project',description:'Choose a game foundation, compose Tari components, save a version and prepare a release.',version:'1.0.0',price:0,currency:'USD',lifecycle:'runbook',publishedAt:null,purpose:'Create a reproducible Ootle Lobby project. Saving configuration does not deploy an application.',requirements:'A running Ootle Lobby checkout. Read AGENTS.md and creator-hub/WORKFLOW_AGENT_GUIDE.md. Network actions require a configured wallet and a separately approved deployment.',setup:'Open /create, select a game or app starter, then create a project. Read the upstream setup requirements before running its code.',instructions:`1. Choose a foundation in /create.
2. Save a project from that starter.
3. Open its creation workflow and describe framework, Tari templates, tools and outputs with their source links.
4. Attach assets from /create/assets.
5. Save a version with a meaningful change message.
6. Build and test the actual upstream application separately.
7. Record verified integration results and remaining gaps.
8. Prepare a unique gameplay cover and request release registration. Only reviewed registered builds gain a playable release link.`,verification:'Read the saved project version back, reopen its workflow, inspect every source and test the actual game. A saved graph is not proof of a deployed integration.',recovery:'Fork a known-good project version. Revert code changes with Git. Do not overwrite someone else’s project head. Keep wallet secrets out of graphs and exports.'},...d.listings].map(l=>{const events=d.events.filter(e=>e.listingId===l.id);return {...l,downloads:events.length,weeklyDownloads:events.filter(e=>Date.now()-Date.parse(e.at)<7*86400000).length};});
 return {
 authenticate(id,token){return publicProfile(authorize(read(),id,token));},
 catalog(){const d=read();return {categories:learningCategories.map(({pattern,...category})=>category),listings:listings(d).map(l=>({...l,categories:categoriesFor({...l,category:l.creatorId==='stanestane'?'Game design':l.kind==='workflow'?'Workflow':null,ecosystem:l.nativeSlug?'tari-ootle':''})})).map(l=>l.price>0?Object.fromEntries(Object.entries(l).filter(([k])=>!['instructions','recovery'].includes(k))):l),creators:[{id:'tari',name:'Tari contributors',bio:'Native Tari and Ootle guidance.',showWork:true,showActivity:true,projects:[]},...bundledSkillCreators,...contestCreators,...d.profiles.map(publicProfile)]};},
 profile(input){object(input);const d=read(),key=randomBytes(32).toString('hex');const p={id:randomUUID(),name:text(input.name,80),bio:typeof input.bio==='string'?input.bio.slice(0,1000):'',showWork:input.showWork!==false,showActivity:input.showActivity!==false,projects:links(input.projects??[]),keyHash:hash(key)};d.profiles.push(p);save(d);return {profile:publicProfile(p),editKey:key};},
 update(id,input,token){object(input);const d=read(),p=authorize(d,id,token);p.name=text(input.name,80);p.bio=typeof input.bio==='string'?input.bio.slice(0,1000):'';p.showWork=input.showWork!==false;p.showActivity=input.showActivity!==false;
 p.projects=links(input.projects);save(d);return publicProfile(p);},
 publish(input,token){object(input);const d=read();authorize(d,input.creatorId,token);if(!['skill','workflow'].includes(input.kind))fail('Choose skill or workflow');if(typeof input.price!=='number'||!Number.isFinite(input.price)||input.price<0||input.price>100000)fail('Invalid price');
 const body=Object.fromEntries(sections.map(k=>[k,text(input[k])]));const l={id:randomUUID(),creatorId:input.creatorId,kind:input.kind,title:text(input.title,120),description:text(input.description,500),version:text(input.version,30),...body,price:Math.round(input.price*100)/100,currency:'USD',publishedAt:new Date().toISOString(),lifecycle:'community'};
 d.listings.push(l);save(d);return l;},
 download(id,visitor){const d=read(),l=listings(d).find(x=>x.id===id);if(!l)fail('Listing not found',404);if(l.price>0)fail('Checkout is not connected yet',409);if(typeof visitor!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(visitor))fail('A browser download identifier is required');
 const digest=hash(visitor),day=new Date().toISOString().slice(0,10);if(!d.events.some(e=>e.listingId===id&&e.visitor===digest&&e.at.startsWith(day))){d.events.push({listingId:id,visitor:digest,at:new Date().toISOString()});save(d);}
 const markdown=bundledSkillMarkdown(l.id)??(l.nativeSlug?skillMarkdown(l.nativeSlug):`---\nname: ${l.id}\ndescription: ${JSON.stringify(l.description)}\n---\n\n# ${l.title}\n\n`+sections.map(k=>`## ${k[0].toUpperCase()+k.slice(1)}\n\n${l[k]}\n`).join('\n'));
 return {schemaVersion:1,kind:l.kind,metadata:l,files:learning.bundle(l.id)?.files??bundledSkillFiles(l.id)??{[l.kind==='skill'?'SKILL.md':'WORKFLOW.md']:markdown},installation:'Review instructions before use. Save the Markdown in a dedicated project skill/workflow folder; ask your agent to read it. Never overwrite existing project instructions. Native TariSkills may reference supporting files: use the matching repository checkout.',source:l.sourceUrl||(l.nativeSlug?`https://github.com/marguerite347/ootle-lobby/tree/main/creator-hub/skills/${l.nativeSlug}`:null)};}
 };
}
