import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {validateCommunityProjects} from './communityProjects.mjs';
export function readCommunityProjects(root) {
 const directory=new URL('content/community-projects/',root);
 const items=readdirSync(directory).filter(file=>file.endsWith('.json')).sort().map(file=>{
  if(!/^[a-z0-9-]+\.json$/.test(file))throw new Error('Invalid community filename.');
  const path=new URL(file,directory),stat=lstatSync(path);
  if(stat.isSymbolicLink()||!stat.isFile()||stat.size>20000)throw new Error('Expected small community JSON file.');
  const p=JSON.parse(readFileSync(path,'utf8'));if(`${p.slug}.json`!==file)throw new Error('Community slug must match filename.');return p;
 });
 return validateCommunityProjects(items);
}
