export type NetworkState='mainnet'|'testnet'|'both'|'unconfirmed';
export type NetworkEntry={ref:string;state:NetworkState;mainnetUrl?:string;testnetUrl?:string;checkedAt:string;evidenceUrl:string;evidence:string;mainnetPlan?:string;deploymentEvidence?:{url:string;observedAt:string;detail:string}};
export function inNetwork(entry:{state:string},network:string):boolean;
export function validateNetworkStatus(data:unknown,knownRefs:Set<string>):{schemaVersion:1;entries:NetworkEntry[]};
