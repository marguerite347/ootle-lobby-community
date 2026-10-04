// INTEGRATION_GAP[LOBBY-WALLET] (design-only): see docs/DEVELOPMENT_GAPS.md#lobby-wallet.
// Authoring schema only. Never serialize this as a signed Ootle transaction.
export const MARKET_TEMPLATE = {id:'tari-market',name:'Tari Market P2P marketplace',repository:'https://github.com/johnnysessa/Tari-Market',revision:'30a989d5c68d0dc30da8078ef0ae6e35946388dd',path:'contracts/xtm_market/src/lib.rs',methods:['create_listing','buy','cancel_listing'],adaptation:'Replace physical shipping/receipt settlement with digital delivery and entitlement recovery.'};
export const NFT_TEMPLATE = {id:'ootle-basic-nft',name:'Ootle native NFT resource example',repository:'https://github.com/tari-project/tari-ootle',revision:'8034f10b412ade1703cb830b8f08dee494c6b0c1',path:'crates/engine/tests/templates/nft/basic_nft/src/lib.rs',adaptation:'Replace permissive test access rules with the selected mint and game-data authorities before deployment.'};
export const NFT_PRESETS = [
 {id:'collectible',name:'Collectible / skin',attributes:[{name:'rarity',value:'common',mutable:false},{name:'skin',value:'default',mutable:false}],transferable:true,burnable:false,updateAuthority:'none'},
 {id:'equipment',name:'Equipment / evolving item',attributes:[{name:'level',value:'1',mutable:true},{name:'durability',value:'100',mutable:true},{name:'attack',value:'10',mutable:true}],transferable:true,burnable:false,updateAuthority:'game-component'},
 {id:'consumable',name:'Consumable / crafting ingredient',attributes:[{name:'effect',value:'restore-health',mutable:false},{name:'charges',value:'1',mutable:true}],transferable:true,burnable:true,updateAuthority:'game-component'},
 {id:'achievement',name:'Achievement / badge',attributes:[{name:'achievement',value:'first-creation',mutable:false}],transferable:false,burnable:false,updateAuthority:'none'},
 {id:'access-pass',name:'Access pass / ticket',attributes:[{name:'event',value:'community-jam',mutable:false},{name:'redeemed',value:'false',mutable:true}],transferable:true,burnable:true,updateAuthority:'game-component'},
 {id:'custom',name:'Custom game resource',attributes:[],transferable:true,burnable:false,updateAuthority:'creator'},
];
export function newCommerceDraft(preset='collectible'){
 const p=NFT_PRESETS.find(p=>p.id===preset)||NFT_PRESETS[0];
 return {sale:{mode:'free',price:'',currencyLabel:'TARI',inventory:1},nft:{enabled:false,preset:p.id,collectionName:'',symbol:'ITEM',supplyCap:100,mintAuthority:'creator',transferable:p.transferable,burnable:p.burnable,updateAuthority:p.updateAuthority,attributes:p.attributes.map(a=>({...a}))}};
}
export function validateCommerceDraft(input){
 const fail=m=>{throw Object.assign(new Error(m),{status:400});};
 if(!input||typeof input!=='object')fail('Invalid listing draft');
 const {sale,nft}=input;
 if(!sale||!['free','fixed-price'].includes(sale.mode)||!Number.isSafeInteger(sale.inventory)||sale.inventory<1||sale.inventory>1000000)fail('Choose a sale mode and inventory from 1 to 1,000,000.');
 if(typeof sale.price!=='string'||(sale.mode==='fixed-price'&&(!/^(0|[1-9]\d{0,11})(\.\d{1,8})?$/.test(sale.price)||Number(sale.price)<=0)))fail('Enter a positive price with up to 8 decimal places.');
 if(typeof sale.currencyLabel!=='string'||! /^[A-Za-z0-9_-]{1,16}$/.test(sale.currencyLabel))fail('Enter a currency label.');
 if(!nft||typeof nft.enabled!=='boolean'||!NFT_PRESETS.some(p=>p.id===nft.preset))fail('Choose an NFT preset.');
 if(typeof nft.collectionName!=='string'||nft.collectionName.length>120||typeof nft.symbol!=='string'||! /^[A-Z0-9]{1,12}$/.test(nft.symbol))fail('Enter a collection name up to 120 characters and an uppercase symbol.');
 if(!Number.isSafeInteger(nft.supplyCap)||nft.supplyCap<1||nft.supplyCap>1000000)fail('Supply cap must be from 1 to 1,000,000.');
 if(!['creator','game-component'].includes(nft.mintAuthority)||!['creator','game-component','none'].includes(nft.updateAuthority)||typeof nft.transferable!=='boolean'||typeof nft.burnable!=='boolean')fail('Invalid NFT permissions.');
 if(!Array.isArray(nft.attributes)||nft.attributes.length>32)fail('Use up to 32 attributes.');
 const seen=new Set();
 for(const a of nft.attributes){if(!a||typeof a.name!=='string'||! /^[a-zA-Z][a-zA-Z0-9_-]{0,47}$/.test(a.name)||seen.has(a.name)||typeof a.value!=='string'||a.value.length>500||typeof a.mutable!=='boolean')fail('Attribute names must be unique identifiers, with values up to 500 characters.');seen.add(a.name);}
 if(nft.attributes.some(a=>a.mutable)&&nft.updateAuthority==='none')fail('Mutable attributes need an update authority.');
 return {sale:{mode:sale.mode,price:sale.mode==='free'?'':sale.price,currencyLabel:sale.currencyLabel,inventory:sale.inventory},nft:{enabled:nft.enabled,preset:nft.preset,collectionName:nft.collectionName.trim(),symbol:nft.symbol,supplyCap:nft.supplyCap,mintAuthority:nft.mintAuthority,transferable:nft.transferable,burnable:nft.burnable,updateAuthority:nft.updateAuthority,attributes:nft.attributes.map(({name,value,mutable})=>({name,value,mutable}))}};
}
