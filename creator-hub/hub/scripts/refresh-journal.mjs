import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {editions} from '../server/challenges.mjs';
const dateArgument=process.argv.find(value=>value.startsWith('--date='))?.slice(7);
const now=dateArgument?new Date(dateArgument):new Date();
if(!Number.isFinite(now.getTime()))throw new Error('Invalid date');
const calendar=editions(now).filter(edition=>edition.phase!=='archive');
const snapshot=JSON.parse(readFileSync(new URL('../data/seed/catalog.json',import.meta.url),'utf8'));
const current=calendar.find(edition=>edition.phase==='open');
if(!current)throw new Error('No active challenge; review the calendar before drafting.');
const resources=snapshot.records.filter(resource=>['starter','guide','tool','asset','skill'].includes(resource.type)).slice(0,8).map(resource=>({id:resource.id,title:resource.title,type:resource.type,url:'/resource/'+encodeURIComponent(resource.id)}));
const sourceDigest=createHash('sha256').update(JSON.stringify({calendar,resources})).digest('hex');
const directory=new URL('../content/blog-drafts/',import.meta.url);
mkdirSync(directory,{recursive:true});
const file=new URL(current.id+'.json',directory);
if(existsSync(file)){const previous=JSON.parse(readFileSync(file,'utf8'));if(previous.sourceDigest===sourceDigest){console.log('Draft sources unchanged.');process.exit(0);}if(previous.status!=='draft'){throw new Error('Refusing to replace a reviewed draft.');}}
const draft={slug:`${current.id}-${current.theme}`,status:'draft',generatedAt:now.toISOString(),sourceDigest,title:`This week in Ootle Lobby: ${current.title}`,description:`Explore the ${current.title} challenge, upcoming creator prompts and resources for a small build.`,category:'Weekly dispatch',art:'loop',calendar,resources,sourceSnapshotAt:snapshot.generatedAt,editorialChecklist:['Check current calendar dates and source freshness.','Select relevant resources; inspect each resource and its setup requirements.','Write original explanatory copy and a clear creator next step.','Verify claims, credit contributors and attach a distinct cover.','Review metadata, internal links, accessibility and mobile layout.','Set reviewedAt, publishedAt and status only after editorial review; put the completed article in content/blog.'],sections:[['Your brief',current.brief],['Show your work',current.evidence],['Coming next',calendar.filter(edition=>edition.phase==='upcoming').map(edition=>`${edition.startDate}: ${edition.title}. ${edition.brief}`).join('\n')],['Resource shortlist','Editorial research candidates only; do not imply these were recently released or tested.']],sources:[{label:'Challenge calendar',url:'/challenges#calendar'},...resources.map(resource=>({label:resource.title,url:resource.url}))]};
writeFileSync(file,JSON.stringify(draft,null,2)+'\n');
console.log(`Updated ${current.id} draft; published articles untouched.`);
