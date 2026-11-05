export function remainingLaunchTime(target: number, now=Date.now()) {
  const total=Math.max(0,Math.ceil((target-now)/1000));
  return {days:Math.floor(total/86400),hours:Math.floor(total/3600)%24,minutes:Math.floor(total/60)%60,seconds:total%60,ended:total===0};
}

export function readLaunchTarget(data: unknown): number|null {
  const value=(data as {target?: unknown})?.target;
  if (value===null) return null;
  if (typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw Error('Launch date unavailable');
  return Date.parse(value);
}

/** Failed polls leave the last verified target intact. There is no bundled date fallback. */
export function pollLaunchTarget(onTarget:(target:number|null)=>void, fetcher:typeof fetch=fetch) {
  let stopped=false, pending=false;
  let controller:AbortController|undefined;
  let timeout:ReturnType<typeof setTimeout>|undefined;
  async function refresh() {
    if (pending || stopped) return;
    pending=true;
    controller=new AbortController();
    timeout=setTimeout(()=>controller?.abort(),8000);
    try {
      const response=await fetcher('/api/launch',{signal:controller.signal,cache:'no-store'});
      if (!response.ok) throw Error('Launch date unavailable');
      const target=readLaunchTarget(await response.json());
      if (!stopped) onTarget(target);
    } catch { /* Retry next minute; keep any previously verified target. */ }
    finally {clearTimeout(timeout);pending=false;}
  }
  void refresh();
  const interval=setInterval(()=>void refresh(),60000);
  return {refresh,stop(){stopped=true;clearInterval(interval);clearTimeout(timeout);controller?.abort();}};
}

export function launchDateLabel(target:number) {
  return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'UTC',hourCycle:'h23'}).format(target)+' UTC';
}
