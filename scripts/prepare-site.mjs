import {cpSync,mkdirSync,rmSync} from 'node:fs';
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
for (const name of ['creator-hub','skills','.agents']) {
  cpSync(new URL(`${name}/`,root),new URL(`${name}/`,server),{recursive:true,filter:source => {
    const normalized=source.replaceAll('\\','/');
    if (normalized.includes('/node_modules') || normalized.includes('/.env')) return false;
    if (normalized.includes('/creator-hub/hub/client/')) return normalized.endsWith('/client/dist') || normalized.endsWith('/client/dist/index.html');
    if (normalized.includes('/creator-hub/hub/scripts')) return false;
    return true;
  }});
}
