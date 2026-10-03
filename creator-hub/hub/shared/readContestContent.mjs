import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {validateContests} from './contestContentValidation.mjs';
export function readContestContent(root) {
  const contest=JSON.parse(readFileSync(new URL('content/contests/october-2026.json',root),'utf8'));
  const directory=new URL('content/submissions/october-2026/',root);
  const entries=readdirSync(directory).filter(file=>file.endsWith('.json')).sort().map(file=>{
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(file))throw new Error('Invalid submission filename.');
    const path=new URL(file,directory), stat=lstatSync(path);
    if(stat.isSymbolicLink()||!stat.isFile()||stat.size>20000)throw new Error('Submission must be a small JSON file.');
    const entry=JSON.parse(readFileSync(path,'utf8'));
    if(`${entry.slug}.json`!==file)throw new Error('Submission slug must match filename.');
    return entry;
  });
  return validateContests([{...contest,entries}]);
}
