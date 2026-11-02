import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {validateContests, CONTEST_THREADS} from './contestContentValidation.mjs';
export function readContestContent(root) {
  const contests = Object.keys(CONTEST_THREADS).map(id => {
  const contest=JSON.parse(readFileSync(new URL(`content/contests/${id}.json`,root),'utf8'));
  if (contest.id !== id) throw new Error('Contest id must match its registry filename.');
  const directory=new URL(`content/submissions/${id}/`,root);
  const entries=readdirSync(directory).filter(file=>file.endsWith('.json')).sort().map(file=>{
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(file))throw new Error('Invalid submission filename.');
    const path=new URL(file,directory), stat=lstatSync(path);
    if(stat.isSymbolicLink()||!stat.isFile()||stat.size>20000)throw new Error('Submission must be a small JSON file.');
    const entry=JSON.parse(readFileSync(path,'utf8'));
    if(`${entry.slug}.json`!==file)throw new Error('Submission slug must match filename.');
    return entry;
  });
  return {...contest,entries};
  });
  return validateContests(contests);
}
