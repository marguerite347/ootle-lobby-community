import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const response = (status: number, body = {}) => new Response(JSON.stringify(body), { status });

describe('API outage recovery', () => {
  it('recovers a read after a connection failure and temporary gateway outage', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response(200, { topics: [] }));
    vi.stubGlobal('fetch', fetch);
    const result = api.learn();
    await vi.runAllTimersAsync();
    expect(await result).toEqual({ topics: [] });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('stops retrying a sustained outage', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockResolvedValue(response(503));
    vi.stubGlobal('fetch', fetch);
    const result = expect(api.learn()).rejects.toThrow('HTTP 503');
    await vi.runAllTimersAsync();
    await result;
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('does not retry missing routes or invalid JSON', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response(404)).mockResolvedValueOnce(new Response('<html>'));
    vi.stubGlobal('fetch', fetch);
    await expect(api.learn()).rejects.toThrow('HTTP 404');
    await expect(api.learn()).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('never replays a write after a network failure', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetch);
    await expect(api.createProject({ title: 'Example' })).rejects.toThrow('Failed to fetch');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

it('retains the newly created project management capability in this browser',async()=>{
 const setItem=vi.fn();vi.stubGlobal('localStorage',{setItem});
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(201,{project:{id:'my-project'},managementKey:'private-test-key'})));
 await api.createProject({title:'Example'});
 expect(setItem).toHaveBeenCalledWith('project-management:my-project','private-test-key');
});

it('announces creation only after a successful write, never on failure',async()=>{
 const dispatchEvent=vi.fn();
 vi.stubGlobal('window',{dispatchEvent});
 vi.stubGlobal('CustomEvent',class {constructor(public type:string,public options:any){}});
 const fetch=vi.fn().mockResolvedValueOnce(response(201,{project:{id:'new'}}))
  .mockResolvedValueOnce(response(500,{error:'Creation failed'}));
 vi.stubGlobal('fetch',fetch);
 await api.createProject({title:'Example'});
 expect(dispatchEvent).toHaveBeenCalledTimes(1);
 expect(dispatchEvent.mock.calls[0][0]).toMatchObject({type:'hub:creator-milestone',options:{detail:'created'}});
 await expect(api.createProject({title:'Example'})).rejects.toThrow('Creation failed');
 expect(dispatchEvent).toHaveBeenCalledTimes(1);
});
