// INTEGRATION_GAP[CFG-DATA]: public wallet configuration is the authority for launch timing.
export const LAUNCH_CONFIG_URL = 'https://ut.tari.com/config';
export const LAUNCH_CONFIG_KEY = 'ootle-mainnet-launch-at';
const WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export function launchTarget(config) {
  if (!config || typeof config!=='object' || Array.isArray(config)) throw new Error('Invalid wallet configuration');
  const value = config[LAUNCH_CONFIG_KEY];
  if (typeof value !== 'string' || !WITH_ZONE.test(value) || !Number.isFinite(Date.parse(value))) {
    return null;
  }
  return new Date(value).toISOString();
}

/** One fixed public request; do not forward the full configuration or accept an upstream URL. */
export function createLaunchReader({fetcher=fetch, now=Date.now}={}) {
  let value, expires=0, pending;
  return async function readLaunch() {
    if (value && now()<expires) return value;
    if (!pending) pending=(async()=>{
      const response=await fetcher(LAUNCH_CONFIG_URL,{signal:AbortSignal.timeout(8000),redirect:'error'});
      if (!response.ok) throw new Error('Wallet launch date unavailable');
      const target=launchTarget(await response.json());
      value={target};
      expires=now()+60000;
      return value;
    })().finally(()=>{pending=undefined;});
    return pending;
  };
}
