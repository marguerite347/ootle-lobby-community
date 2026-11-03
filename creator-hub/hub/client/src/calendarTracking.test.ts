import {afterEach,expect,it,vi} from 'vitest';
afterEach(()=>{vi.unstubAllGlobals();vi.resetModules();});
function browser(extra={}) {
  const values=new Map<string,string>();
  vi.stubGlobal('localStorage',{getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>values.set(key,value)});
  vi.stubGlobal('navigator',{doNotTrack:'0',...extra});vi.stubGlobal('window',{location:{origin:'https://lobby.tari.com'}});
  return values;
}
it('reuses one browser link, ignores response redirects and records choice without delaying navigation',async()=>{
  const values=browser();
  const request=vi.fn(async(_url,init)=>{
    const {clientId}=JSON.parse(init.body);
    return {ok:true,json:async()=>({options:Object.fromEntries(['google','apple','download'].map(provider=>[provider,{token:clientId+'.'+'a'.repeat(64),href:'https://untrusted.example/'}]))})};
  });vi.stubGlobal('fetch',request);
  const m=await import('./calendarTracking');const a=await m.prepareCalendarOptions(),b=await m.prepareCalendarOptions();
  expect(a).toEqual(b);expect(request).toHaveBeenCalledTimes(1);expect(values.has('tari-calendar-link-v1')).toBe(true);
  expect(a.apple.href).toMatch(/^webcal:\/\/lobby.tari.com\/community\/calendar\/apple\//);
  expect(a.google.href).toMatch(/^https:\/\/calendar.google.com\/calendar\/r\?cid=/);
  m.recordCalendarChoice('google',a.google);expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[1][1].keepalive).toBe(true);
});
it('privacy signals use the untracked shared links without creating browser IDs',async()=>{
  const values=browser({globalPrivacyControl:true});const request=vi.fn();vi.stubGlobal('fetch',request);
  const m=await import('./calendarTracking');const options=await m.prepareCalendarOptions();
  m.recordCalendarChoice('google',options.google);
  expect(options).toEqual(m.sharedCalendarOptions);expect(request).not.toHaveBeenCalled();expect(values.size).toBe(0);
});
it('a failed measurement request leaves working calendar links',async()=>{
  browser();vi.stubGlobal('fetch',vi.fn().mockRejectedValue(Error('offline')));
  const m=await import('./calendarTracking');expect(await m.prepareCalendarOptions()).toEqual(m.sharedCalendarOptions);
});
