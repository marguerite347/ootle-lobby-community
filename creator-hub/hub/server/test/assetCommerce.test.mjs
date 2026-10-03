import {test} from 'node:test';import assert from 'node:assert/strict';
import {newCommerceDraft,validateCommerceDraft,NFT_PRESETS} from '../../shared/assetCommerce.mjs';
test('every preset can be customized without sharing mutable defaults',()=>{
 for(const p of NFT_PRESETS){const a=newCommerceDraft(p.id);a.nft.enabled=true;assert.equal(validateCommerceDraft(a).nft.preset,p.id);}
 const a=newCommerceDraft('equipment');a.nft.attributes[0].value='999';assert.equal(newCommerceDraft('equipment').nft.attributes[0].value,'1');
});
test('reject ambiguous amount, impossible permissions and duplicate traits',()=>{
 for(const price of ['-1','1e2','NaN','0','01','1.000000001']){const a=newCommerceDraft();a.sale.mode='fixed-price';a.sale.price=price;assert.throws(()=>validateCommerceDraft(a));}
 const a=newCommerceDraft('equipment');a.nft.updateAuthority='none';assert.throws(()=>validateCommerceDraft(a),/authority/);
 const b=newCommerceDraft();b.nft.attributes.push({...b.nft.attributes[0]});assert.throws(()=>validateCommerceDraft(b),/unique/);
 for(const value of [null,{},false])assert.throws(()=>validateCommerceDraft(value));
});
test('extra network claims do not survive normalization',()=>{
 const a=newCommerceDraft();a.minted=true;a.transactionId='fake';const b=validateCommerceDraft(a);assert.equal(b.minted,undefined);assert.equal(b.transactionId,undefined);
});
