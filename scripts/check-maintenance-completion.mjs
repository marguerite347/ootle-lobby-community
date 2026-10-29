import fs from 'node:fs';
import path from 'node:path';
import {assessMaintenance} from './maintenance-completion.mjs';
const [file,root=process.cwd()]=process.argv.slice(2);
if(!file){console.error('Usage: node scripts/check-maintenance-completion.mjs RUN.json [evidence-root]');process.exit(2);}
try{
 const ledger=JSON.parse(fs.readFileSync(path.resolve(root,'outputs/source-coverage.json'),'utf8'));
 const inventory=JSON.parse(fs.readFileSync(path.resolve(root,'outputs/dependency-inventory.json'),'utf8'));
 const requiredScope={discovery:ledger.sources.map(s=>s.id),existingResources:Object.keys(ledger.resourceReviews),dependencies:inventory.records.map(r=>`${r.repo}/${r.manifest}:${r.name}`)};
 const result=assessMaintenance(JSON.parse(fs.readFileSync(file,'utf8')),{requiredScope,evidenceExists:p=>!path.isAbsolute(p)&&!p.split(/[\\/]/).includes('..')&&fs.existsSync(path.resolve(root,p))});
 console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='incomplete'?1:0;
}catch(error){console.error(error.message);process.exitCode=2;}
