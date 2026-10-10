import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {cpSync,mkdirSync,rmSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
const root = new URL('../', import.meta.url);
const output = new URL('public/', root);
const server = new URL('server-content/', root);
rmSync(output,{recursive:true,force:true});
rmSync(server,{recursive:true,force:true});
mkdirSync(output,{recursive:true});
mkdirSync(server,{recursive:true});
cpSync(new URL('creator-hub/hub/client/dist/',root),output,{recursive:true});
cpSync(new URL('creator-hub/hub/data/seed/previews/',root),new URL('previews/',output),{recursive:true});
// Include the published runtime dependencies, without client source, assets or node_modules.
for (const name of ['creator-hub','skills','.agents','content']) {
  cpSync(new URL(`${name}/`,root),new URL(`${name}/`,server),{recursive:true,filter:source => {
    const normalized=source.replaceAll('\\','/');
    if (normalized.includes('/node_modules') || normalized.includes('/.env')) return false;
    if (normalized.includes('/creator-hub/hub/client/')) return normalized.endsWith('/client/dist') || normalized.endsWith('/client/dist/index.html');
    if (normalized.includes('/creator-hub/hub/scripts')) return false;
    const dataMarker='/creator-hub/hub/data/';
    if (normalized.includes(dataMarker)) {
      const relative=normalized.split(dataMarker)[1];
      return relative==='seed' || relative.startsWith('seed/') || relative==='contests' || relative.startsWith('contests/') || relative==='genre-reference-games.json';
    }
    return true;
  }});
}

// The approved content snapshot travels with the deployment, not a moving Pages feed.
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'inherit'});
cpSync(new URL('dist/content.json',root),new URL('creator-hub/hub/data/contests/community-content.json',server));
const revision=process.env.GITHUB_SHA||process.env.VERCEL_GIT_COMMIT_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(revision))throw new Error('A full source revision is required.');
writeFileSync(new URL('build.json',output),JSON.stringify({revision,builtAt:new Date().toISOString()})+'\n');
const hashes={};
function fingerprint(directory,prefix='') {
  for(const entry of readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)) {
    const location=new URL(entry.name+(entry.isDirectory()?'/':''),directory),name=prefix+entry.name;
    if(entry.isDirectory())fingerprint(location,name+'/');
    else if(entry.isFile())hashes[name]=createHash('sha256').update(readFileSync(location)).digest('hex');
  }
}
fingerprint(output,'public/');fingerprint(server,'server-content/');
// Integrity evidence for the exact built package; not a signature or runtime attestation.
writeFileSync(new URL('artifact-sha256.json',output),JSON.stringify({revision,files:hashes},null,2)+'\n');
