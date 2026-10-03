import {expect,test,vi} from 'vitest';
import {activeRequirements,attachSetupPlan,setupHandoff,type SetupPlan} from './toolkitSetup';
const plan:SetupPlan={engine:'Phaser',engineId:'phaser',enabledProviders:[],agentInstructions:'Ask about unresolved access; verify reported readiness.',requirements:[
 {id:'engine',title:'Engine',provider:'core',ask:'Where will it run?',verify:'Run one scene.',url:'/skills'},
 {id:'hf',title:'Hugging Face',provider:'huggingface',ask:'Configure the token privately.',verify:'Check model access.',url:'/agent-start.md'},
]};
test('optional providers are excluded until selected',()=>{
 expect(activeRequirements(plan,[]).map(item=>item.id)).toEqual(['engine']);
 expect(activeRequirements(plan,['huggingface']).map(item=>item.id)).toEqual(['engine','hf']);
});
test('handoff distinguishes unverified and ready while preserving user questions and checks',()=>{
 const text=setupHandoff('Build goal',plan,['huggingface'],{engine:'ready',hf:'needs-help'},'Browser');
 const questions=text.split('QUESTIONS TO ASK THE USER BEFORE DEPENDENT WORK')[1];
 expect(questions).toContain('Configure the token privately.');expect(questions).not.toContain('Where will it run?');
 expect(text).toContain('Engine: ready');expect(text).toContain('Check: Run one scene.');expect(text).toContain('USER-REPORTED, NOT VERIFIED');
});
test('a fully checked handoff still requires agent verification',()=>{
 const text=setupHandoff('Build goal',plan,[],{engine:'ready'},'Browser');
 expect(text).toContain('Verify each claimed capability');expect(text).not.toContain('Configure the token privately.');
});
test('attach keeps the current head and unrelated project fields',async()=>{
 const posts:string[]=[];
 vi.stubGlobal('fetch',async(url:string,init?:RequestInit)=>{
  if(String(url).endsWith('/publish')){posts.push(String(init?.body));return {ok:true,json:async()=>({head:'next'})};}
  return {ok:true,json:async()=>({head:'abc',state:{notes:'keep me',workflow:{version:1}}})};
 });
 await attachSetupPlan('proj','abc',{version:1,engine:'Godot'});
 const body=JSON.parse(posts[0]);
 expect(body.expectedHead).toBe('abc');
 expect(body.state.notes).toBe('keep me');
 expect(body.state.setupPlan.engine).toBe('Godot');
 vi.unstubAllGlobals();
});
test('attach does not publish when expectedHead is stale',async()=>{
 let posts=0;
 vi.stubGlobal('fetch',async(url:string)=>{
  if(String(url).endsWith('/publish')){posts+=1;return {ok:true,json:async()=>({})};}
  return {ok:true,json:async()=>({head:'newer',state:{notes:'keep me'}})};
 });
 await expect(attachSetupPlan('proj','stale',{version:1})).rejects.toThrow(/changed/);
 expect(posts).toBe(0);
 vi.unstubAllGlobals();
});
