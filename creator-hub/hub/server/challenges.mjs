// INTEGRATION_GAP[RETIRED-HOSTING] (retired): see docs/DEVELOPMENT_GAPS.md#retired-hosting.
import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import path from 'node:path';
import {runtimeDir} from './paths.mjs';
// Ordered, versioned prompts. Existing editions keep their prompt when adding to the bank.
export const prompts=[
 ['one-good-loop','One good loop','Make one satisfying action lead to a clear result. Ship a tiny playable game or useful app, with a short demo.','Builder activation','A published project version, a working demo and a clear success condition.'],
 ['make-it-yours','Make it yours','Riff an existing creation into something recognizably your own. Credit its creator and explain your changes.','Meaningful remixing','Source project and version, your published version, and a before/after demonstration.'],
 ['better-together','Better together','Combine two useful parts, or collaborate with another creator to make something neither part could do alone.','Useful composition','Component credits, setup instructions and a demo of the parts working together.'],
 ['listen-and-improve','Listen, then improve','Let someone try your project. Pick one friction point and release an improvement based on their feedback.','Player experience','Consented feedback, before/after versions and evidence the core task became easier.'],
 ['teach-one-thing','Teach one thing','Turn something you learned into a guide, reusable recipe or skill that another creator can follow.','Knowledge reuse','Published resource and an independent creator confirming they completed its steps.'],
 ['remove-a-barrier','Remove a barrier','Make a core experience easier to use for someone new. Improve setup, accessibility or first-play clarity.','Onboarding completion','A repeatable task, before/after completion evidence and limitations.'],
 ['a-reason-to-return','A reason to return','Give people a meaningful reason to come back. Improve the experience without making it a chore.','Returning players','Release version and consented return-visit cohort data with dates and denominators.'],
 ['community-shapes-it','Let the community shape it','Invite feedback on a design choice and show what changed because people participated.','Constructive collaboration','Decision record, contributor credits and the resulting release.'],
 ['private-by-design','Private by design','Explore a feature where people control what they share. Explain its boundaries and test the experience.','Responsible Tari adoption','Disclosure map, tests and explicit local/testnet/network evidence where applicable.'],
 ['open-a-door','Open a door','Package one useful part of your project so someone else can make something with it.','Reusable components','Versioned component, setup instructions and a working independent reuse example.'],
 ['show-the-magic','Show the magic','Create a clear short demo that helps a new audience understand what your project does and try it.','Qualified discovery','Demo, destination project and measured visits-to-successful-first-use where available.'],
 ['keep-it-growing','Keep it growing','Return to something you published. Fix a real issue and document the difference for the next creator.','Maintained projects','Issue evidence, new version and a regression check.']
];
const day=86400000,epoch=Date.UTC(2026,8,21);
function localDay(now){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const n=k=>+parts.find(p=>p.type===k).value;return Date.UTC(n('year'),n('month')-1,n('day'));}
const date=ms=>new Date(ms).toISOString().slice(0,10);
export function editions(now=new Date()){
 const current=Math.floor((localDay(now)-epoch)/(7*day));
 return Array.from({length:Math.max(0,current+4)-Math.max(0,current-11)},(_,i)=>{
 const index=Math.max(0,current-11)+i,[theme,title,brief,metric,evidence]=prompts[index%12];
 return {id:`creator-week-${index+1}`,number:index+1,theme,title,brief,metric,evidence,startDate:date(epoch+index*7*day),endDateExclusive:date(epoch+(index+1)*7*day),timezone:'America/New_York',phase:index<current?'archive':index===current?'open':'upcoming',target:5,rewardStatus:'Not funded',rewardAmount:null};
 });
}
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function createChallenges(root=runtimeDir){const file=path.join(root,'challenge-submissions.json');const read=()=>{try{return JSON.parse(readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}};
 return {
 submissions(){return read().map(({editionId,projectId,projectRef,summary,evidenceUrl,submittedAt,review})=>({editionId,projectId,projectRef,summary,evidenceUrl,submittedAt,review})).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));},
 list(now=new Date()){const rows=read();return editions(now).map(e=>({...e,submitted:rows.filter(r=>r.editionId===e.id).length,verified:0}));},
 submit(input,creator,project,now=new Date()){
 const edition=editions(now).find(e=>e.id===input?.editionId);if(!edition||edition.phase!=='open')fail('This edition is not open');
 if(!project?.project?.id||!project.head)fail('Choose an existing published project');
 const clean=(v,max)=>typeof v==='string'&&v.trim()&&v.length<=max?v.trim():fail('Add a short change summary and evidence URL');
 const summary=clean(input.summary,1600);let evidence;try{evidence=new URL(clean(input.evidenceUrl,2000));}catch{fail('Use an HTTPS evidence URL');}
 if(evidence.protocol!=='https:'||evidence.username||evidence.password)fail('Use an HTTPS evidence URL without credentials');
 const rows=read();if(rows.some(r=>r.editionId===edition.id&&(r.creatorId===creator.id||r.projectId===project.project.id)))fail('Creator or project already submitted this week',409);
 const row={editionId:edition.id,creatorId:creator.id,projectId:project.project.id,projectRef:project.head,summary,evidenceUrl:evidence.href,submittedAt:now.toISOString(),review:'pending',schemaVersion:1};
 rows.push(row);mkdirSync(root,{recursive:true});writeFileSync(file+'.tmp',JSON.stringify(rows,null,2));renameSync(file+'.tmp',file);return row;
 }};
}
