const https=value=>{
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}
};
export function inNetwork(entry,network){
  return entry.state===network || (entry.state==='both' && ['mainnet','testnet'].includes(network));
}
export function validateNetworkStatus(data,knownRefs){
  if(data?.schemaVersion!==1||!Array.isArray(data.entries))throw Error('Invalid network status registry.');
  const seen=new Set();
  for(const entry of data.entries){
    if(typeof entry.ref!=='string'||seen.has(entry.ref)||!knownRefs.has(entry.ref))throw Error('Network status needs a unique existing catalog identity.');
    seen.add(entry.ref);
    if(!['mainnet','testnet','both','unconfirmed'].includes(entry.state))throw Error('Invalid network state.');
    if(!Number.isFinite(Date.parse(entry.checkedAt))||!https(entry.evidenceUrl)||!entry.evidence?.trim())throw Error('Network status needs dated source evidence.');
    for(const key of ['mainnetUrl','testnetUrl'])if(entry[key]!==undefined&&!https(entry[key]))throw Error('Network destinations must use HTTPS.');
    if(inNetwork(entry,'testnet')&&!https(entry.testnetUrl))throw Error('Testnet status needs its own URL.');
    if(inNetwork(entry,'mainnet')){
      if(!https(entry.mainnetUrl)||!https(entry.deploymentEvidence?.url)||!Number.isFinite(Date.parse(entry.deploymentEvidence?.observedAt))||!entry.deploymentEvidence?.detail?.trim())throw Error('Mainnet requires current deployment evidence and a mainnet URL; an announcement is insufficient.');
    }
    if(entry.mainnetPlan!==undefined&&(typeof entry.mainnetPlan!=='string'||entry.mainnetPlan.length>180))throw Error('Mainnet plan must be concise.');
    if(entry.showcase!==undefined){
      if(!entry.showcase||typeof entry.showcase!=='object'||!https(entry.showcase.url))throw Error('Showcase needs a public HTTPS destination.');
      for(const [key,max] of [['actionLabel',40],['version',80]])if(entry.showcase[key]!==undefined&&(typeof entry.showcase[key]!=='string'||!entry.showcase[key].trim()||entry.showcase[key].length>max||/[<>\u0000-\u001f]/.test(entry.showcase[key])))throw Error('Showcase download labels must be concise plain text.');
      for(const [key,max] of [['label',60],['summary',160]])if(typeof entry.showcase[key]!=='string'||!entry.showcase[key].trim()||entry.showcase[key].length>max||/[<>\u0000-\u001f]/.test(entry.showcase[key]))throw Error('Showcase needs concise plain-text labels and summaries.');
    }
  }
  return data;
}
