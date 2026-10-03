export type Attribute={name:string;value:string;mutable:boolean};
export type CommerceDraft={sale:{mode:string;price:string;currencyLabel:string;inventory:number};nft:{enabled:boolean;preset:string;collectionName:string;symbol:string;supplyCap:number;mintAuthority:string;transferable:boolean;burnable:boolean;updateAuthority:string;attributes:Attribute[]}};
export const MARKET_TEMPLATE:{id:string;name:string;repository:string;revision:string;path:string;methods:string[];adaptation:string};
export const NFT_TEMPLATE:Omit<typeof MARKET_TEMPLATE,'methods'>;
export const NFT_PRESETS:Array<{id:string;name:string;attributes:Attribute[];transferable:boolean;burnable:boolean;updateAuthority:string}>;
export function newCommerceDraft(preset?:string):CommerceDraft;
export function validateCommerceDraft(input:unknown):CommerceDraft;
