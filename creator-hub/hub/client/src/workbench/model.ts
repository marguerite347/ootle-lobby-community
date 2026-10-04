// INTEGRATION_GAP[WB-SYNC] (local-only): see docs/DEVELOPMENT_GAPS.md#wb-sync.
// INTEGRATION_GAP[WB-PUBLISH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-publish.
import counter from './counter.json';
export type Workspace = {id:string; name:string; files:Record<string,string>; activeFile:string; publication?:PublicationDraft};
export type WorkspaceStore = {version:1; activeId:string; workspaces:Workspace[]};
export type Destination = 'community' | 'october-2026';
export type PublicationDraft = {title:string; summary:string; creator:string; repoUrl:string; demoUrl:string; destination:Destination; forumUrl:string};
export type Publication = PublicationDraft & {id:string; status:'published'; publishedAt:string};
export const STORAGE_KEY='ootle.workbench.v1';
export const MAX_FILES=100, MAX_BYTES=2_000_000, MAX_FILE_BYTES=300_000;
export function filePathError(path:string) {
 if(!path || path.length>160 || path.startsWith('/') || path.split('/').some(part=>!part||part==='.'||part==='..'||part==='__proto__'||part==='constructor'||part==='prototype') || !/^[\w. /-]+$/.test(path)) return 'Use a relative path such as src/lib.rs.';
 if(path.split('/').some(part=>['node_modules','target','.git'].includes(part)||part.startsWith('.env')) || /\.(pem|key)$/i.test(path)) return 'Keep dependencies, build output and private credentials outside the workspace.';
 return '';
}
export function validateFiles(files:Record<string,string>) {
 const entries=Object.entries(files);
 if(!entries.length||entries.length>MAX_FILES) return `Choose between 1 and ${MAX_FILES} text files.`;
 let total=0;
 for(const [path,content] of entries) {
  const pathError=filePathError(path); if(pathError)return `${path}: ${pathError}`;
  if(typeof content!=='string'||content.includes('\0'))return `${path}: only text files are supported.`;
  const size=new TextEncoder().encode(content).byteLength;total+=size;
  if(size>MAX_FILE_BYTES)return `${path} is too large (300 KB per file).`;
 }
 return total>MAX_BYTES?'Workspace exceeds the 2 MB limit.':'';
}
export function newWorkspace(name='counter', blank=false):Workspace {
 const files=blank?{'src/lib.rs':'// Start your Tari template here.\n','README.md':`# ${name}\n`}:structuredClone(counter);
 return {id:crypto.randomUUID(),name,files,activeFile:'src/lib.rs'};
}
export function initialStore():WorkspaceStore {const workspace=newWorkspace();return {version:1,activeId:workspace.id,workspaces:[workspace]};}
export function parseStore(value:string):WorkspaceStore {
 const store=JSON.parse(value);
 if(store?.version!==1 || !Array.isArray(store.workspaces) || !store.workspaces.length || store.workspaces.length>12)throw new Error('Invalid workspace backup.');
 const ids=new Set<string>();
 for(const w of store.workspaces){
  if(typeof w.id!=='string'||ids.has(w.id)||typeof w.name!=='string'||!w.name.trim()||w.name.length>80||!w.files||typeof w.files!=='object'||Array.isArray(w.files)||validateFiles(w.files))throw new Error('Invalid workspace files.');
  if(w.publication && (typeof w.publication!=='object'||['title','summary','creator','repoUrl','demoUrl','forumUrl','destination'].some(key=>typeof w.publication[key]!=='string')))delete w.publication;
  ids.add(w.id);if(!Object.prototype.hasOwnProperty.call(w.files,w.activeFile))w.activeFile=Object.keys(w.files)[0];
 }
 if(!ids.has(store.activeId))store.activeId=store.workspaces[0].id;
 return store;
}
export function safePublicUrl(value:string,optional=false) {if(typeof value!=='string')return false;if(!value.trim())return optional;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}}
export function publicationError(draft:PublicationDraft,now=Date.now()) {
 if(!draft.title.trim()||draft.title.length>100)return 'Add a project title (up to 100 characters).';
 if(draft.summary.trim().length<20||draft.summary.length>2000)return 'Describe your project in 20–2,000 characters.';
 if(!draft.creator.trim()||draft.creator.length>80)return 'Add your creator name (up to 80 characters).';
 if(!safePublicUrl(draft.repoUrl))return 'Add a public HTTPS source-code URL.';
 if(!safePublicUrl(draft.demoUrl,true))return 'Use an HTTPS demo URL or leave it blank.';
 if(!['community','october-2026'].includes(draft.destination))return 'Choose a publishing destination.';
 if(draft.destination==='october-2026'){
  if(now<Date.parse('2026-10-01T00:00:00Z')||now>=Date.parse('2026-11-01T00:00:00Z'))return 'October submissions are closed. Choose Community Projects.';
  if(!safePublicUrl(draft.forumUrl))return 'Add the URL of your official October forum entry.';
  const url=new URL(draft.forumUrl);
  if(url.hostname!=='community.tari.com'||!/^\/t\/(?:october-build-contest-thread-spooky-secrets\/)?396\/\d+\/?$/.test(url.pathname))return 'Link your entry post in the official October contest thread.';
 }
 return '';
}
export function publishedEntries(value:unknown,destination:Destination):Publication[] {
 if(!Array.isArray(value))return [];
 const seen=new Set<string>();
 return value.filter((item):item is Publication=>{
  if(!item||typeof item!=='object')return false;
  const p=item as Publication;
  if(typeof p.id!=='string'||seen.has(p.id)||p.status!=='published'||p.destination!==destination||typeof p.title!=='string'||typeof p.summary!=='string'||typeof p.creator!=='string'||!safePublicUrl(p.repoUrl)||!safePublicUrl(p.demoUrl||'',true)||!Number.isFinite(Date.parse(p.publishedAt)))return false;
  seen.add(p.id);return true;
 });
}
