import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessMaintenance,catalogReviewDateIssues} from './maintenance-completion.mjs';
import {maintenanceCheckouts,rustManifestScope} from './maintenance-checkouts.mjs';
const [file,root=process.cwd(),workbenchOverride]=process.argv.slice(2);
if(!file){console.error('Usage: node scripts/check-maintenance-completion.mjs RUN.json [evidence-root] [workbench-checkout]');process.exit(2);}
try{
 const lobbyCheckout=fileURLToPath(new URL('../',import.meta.url));
 const checkouts=maintenanceCheckouts(lobbyCheckout,workbenchOverride||path.resolve(lobbyCheckout,'../workbench'));
 const ledger=JSON.parse(fs.readFileSync(path.resolve(root,'outputs/source-coverage.json'),'utf8'));
 const inventory=JSON.parse(fs.readFileSync(path.resolve(root,'outputs/dependency-inventory.json'),'utf8'));
 const requiredScope={discovery:ledger.sources.map(s=>s.id),existingResources:Object.keys(ledger.resourceReviews),dependencies:inventory.records.map(r=>`${r.repo}/${r.manifest}:${r.name}`)};
 requiredScope.dependencies.push(...rustManifestScope(checkouts));
 const result=assessMaintenance(JSON.parse(fs.readFileSync(file,'utf8')),{requiredScope,evidenceExists:p=>!path.isAbsolute(p)&&!p.split(/[\\/]/).includes('..')&&fs.existsSync(path.resolve(root,p))});
 const contest=JSON.parse(fs.readFileSync(new URL('../content/contests/october-2026.json',import.meta.url),'utf8'));
 const topic=ledger.sources.find(s=>s.id==='396');
 if(topic?.status==='complete'&&Date.parse(contest.checkedAt)<Date.parse(topic.lastAttemptAt)){result.issues.push('publication: visible contest checkpoint is older than the successful source read');result.status='incomplete';}
 for(const {catalogPath,records} of checkouts){
  result.issues.push(...catalogReviewDateIssues(records,ledger.resourceReviews).map(issue=>`${catalogPath}: ${issue}`));
 }
 result.checkouts=checkouts.map(({records,...receipt})=>receipt);
 if(result.issues.length)result.status='incomplete';
 console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='incomplete'?1:0;
}catch(error){console.error(error.message);process.exitCode=2;}
