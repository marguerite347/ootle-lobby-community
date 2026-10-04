// INTEGRATION_GAP[WB-AI] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-ai.
// INTEGRATION_GAP[WB-DEPLOY] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-deploy.
// INTEGRATION_GAP[WB-RUNNER] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-runner.
import type {Workspace,PublicationDraft,Publication} from './model';
export type Capabilities={compile:boolean;test:boolean;deploy:boolean;assistant:boolean;publish:boolean;publications:boolean};
export const DISCONNECTED:Capabilities={compile:false,test:false,deploy:false,assistant:false,publish:false,publications:false};
export type Run={id:string;status:'queued'|'running'|'succeeded'|'failed';logs:string[];artifact?:{id:string;templateHash?:string}};
async function request<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
 const response=await fetch(`/api/workbench${path}`,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:signal||AbortSignal.timeout(30000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||`Service unavailable (${response.status}).`);
 return data as T;
}
export const getCapabilities=async()=>{try{const data=await request<{capabilities:Partial<Capabilities>}>('/capabilities');return Object.fromEntries(Object.keys(DISCONNECTED).map(key=>[key,data.capabilities?.[key as keyof Capabilities]===true])) as Capabilities;}catch{return DISCONNECTED;}};
export async function runWorkspace(workspace:Workspace,action:'compile'|'test',signal:AbortSignal):Promise<Run>{
 let result=await request<Run>('/runs',{workspace,action},signal);
 const start=Date.now();
 while(['queued','running'].includes(result.status)){
  if(Date.now()-start>90000)throw new Error('This run is taking longer than expected. Check the runner before trying again.');
  await new Promise<void>((resolve,reject)=>{const cancel=()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},1000);signal.addEventListener('abort',cancel,{once:true});});
  result=await request<Run>(`/runs/${encodeURIComponent(result.id)}`,undefined,signal);
 }
 if(!['succeeded','failed'].includes(result.status)||!Array.isArray(result.logs))throw new Error('The runner returned an invalid result.');
 return result;
}
export const deployArtifact=(artifactId:string)=>request<{status:'submitted';transactionId:string;templateAddress?:string}>('/deployments',{artifactId,network:'testnet'});
export const askAssistant=(workspace:Workspace,message:string)=>request<{message:string}>('/assistant',{workspace,message});
export const publishWorkspace=(workspace:Workspace,draft:PublicationDraft,requestId:string)=>request<{status:'pending-review'|'published';publication:Publication|null;submissionId:string}>('/publications',{workspace,...draft,requestId});
export const getPublications=()=>request<{items:Publication[]}>('/publications');
