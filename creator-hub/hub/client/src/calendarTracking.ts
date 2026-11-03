// INTEGRATION_GAP[COMMUNITY-CALENDAR-METRICS]: see docs/DEVELOPMENT_GAPS.md; legacy feeds remain untracked.
export type CalendarProvider='google'|'apple'|'download';
type CalendarOption={href:string;token?:string};
export type CalendarOptions=Record<CalendarProvider,CalendarOption>;
const calendarUrl='https://lobby.tari.com/community/events.ics';
export const sharedCalendarOptions:CalendarOptions={
  google:{href:`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarUrl.replace('https:','webcal:'))}`},
  apple:{href:calendarUrl.replace('https:','webcal:')},download:{href:calendarUrl}
};
const headers={'Content-Type':'application/json','X-Lobby-Calendar':'1'};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
let pending:Promise<CalendarOptions>|undefined;
export function prepareCalendarOptions():Promise<CalendarOptions> {
  if(navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return Promise.resolve(sharedCalendarOptions);
  if(pending)return pending;
  pending=(async()=>{
    try {
      let clientId:string|null=null;
      try {clientId=localStorage.getItem('tari-calendar-link-v1');}catch {/* Blocked storage: this visit only. */}
      if(!clientId||!uuid.test(clientId)) {
        clientId=crypto.randomUUID();
        try{localStorage.setItem('tari-calendar-link-v1',clientId);}catch {/* Never require browser storage to add a calendar. */}
      }
      const response=await fetch('/api/calendar/options',{method:'POST',headers,body:JSON.stringify({clientId}),signal:AbortSignal.timeout(4000)});
      if(!response.ok)throw Error('Calendar tracking unavailable');
      const data=await response.json();
      for(const provider of ['google','apple','download'] as const) {
        const option=data.options?.[provider];
        if(typeof option?.token!=='string'||!new RegExp('^'+clientId+'\\.[a-f0-9]{64}$').test(option.token))throw Error('Invalid calendar link');
        // Build destinations locally; a response cannot turn these into arbitrary redirects.
        const feed=`${window.location.origin}/community/calendar/${provider}/${option.token}.ics`;
        option.href=provider==='google'?`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feed.replace(/^https:/,'webcal:'))}`:provider==='apple'?feed.replace(/^https:/,'webcal:'):feed;
      }
      return data.options as CalendarOptions;
    } catch {pending=undefined;return sharedCalendarOptions;}
  })();
  return pending;
}
export function recordCalendarChoice(provider:CalendarProvider,option:CalendarOption) {
  if(!option.token)return;
  // The native link follows immediately, preserving Apple protocol handlers and
  // Google new-tab behavior. Metric delivery must never block calendar access.
  void fetch('/api/calendar/actions',{method:'POST',headers,keepalive:true,body:JSON.stringify({provider,token:option.token,id:crypto.randomUUID()})}).catch(()=>{});
}
