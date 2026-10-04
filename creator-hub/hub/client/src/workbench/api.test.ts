import {afterEach,describe,it,expect,vi} from 'vitest';
import {getCapabilities,DISCONNECTED,runWorkspace,publishWorkspace} from './api';
import {newWorkspace} from './model';
afterEach(()=>vi.unstubAllGlobals());
describe('workbench service client',()=>{
 it('defaults unavailable or malformed capabilities to disconnected',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('{}',{status:503})));expect(await getCapabilities()).toEqual(DISCONNECTED);vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({capabilities:{compile:true,publish:'true'}}))));expect(await getCapabilities()).toEqual({...DISCONNECTED,compile:true});});
 it('retains a failed compile as failed',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({id:'r1',status:'failed',logs:['compiler error']}))));expect((await runWorkspace(newWorkspace(),'compile',new AbortController().signal)).status).toBe('failed');});
 it('surfaces the disconnected service without inventing a publication',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({error:'Not connected'}),{status:501})));await expect(publishWorkspace(newWorkspace(),{title:'Test',summary:'A community project draft',creator:'Builder',repoUrl:'https://example.com/repo',demoUrl:'',destination:'community',forumUrl:''},'id-1')).rejects.toThrow('Not connected');});
});
