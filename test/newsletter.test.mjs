import test from 'node:test';
import assert from 'node:assert/strict';
import {createInspirationLobby} from '../creator-hub/hub/server/inspirationLobby.mjs';
import {newsletterConfiguration,validateTariSignup,TARI_NEWSLETTER_ENDPOINT} from '../creator-hub/hub/server/tariNewsletter.mjs';
const env={PUBLIC_SITE_URL:'https://lobby.tari.com',TARI_TURNSTILE_SITE_KEY:'configured-site-key-fixture'};
const body={email:' Test@Example.com ',token:'single-use-fixture-token',consent:true,website:''};
const headers={'Origin':env.PUBLIC_SITE_URL,'X-Tari-Newsletter':'1','Content-Type':'application/json'};
async function serve(t,options={}) {
  const app=createInspirationLobby({newsletterServices:{env,...options}});
  const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>{server.closeAllConnections();server.close();});
  return `http://127.0.0.1:${server.address().port}`;
}
const submit=(base,payload=body,extra={})=>fetch(base+'/api/subscriptions',{method:'POST',headers:{...headers,...extra},body:JSON.stringify(payload)});
test('signup requires an exact HTTPS origin, a non-test key, consent, email and token',()=>{
  for(const input of [{},{...env,TARI_TURNSTILE_SITE_KEY:''},{...env,PUBLIC_SITE_URL:'https://lobby.tari.com/path'},{...env,PUBLIC_SITE_URL:'https://a:b@lobby.tari.com'},{...env,TARI_TURNSTILE_SITE_KEY:'1x00000000000000000000AA'}])assert.equal(newsletterConfiguration(input).available,false);
  assert.equal(newsletterConfiguration(env).available,true);
  for(const input of [null,[],{...body,email:'invalid'},{...body,consent:false},{...body,token:''},{...body,token:7},{...body,token:'x'.repeat(2049)},{...body,website:'spam'}])assert.throws(()=>validateTariSignup(input));
  assert.deepEqual(validateTariSignup({...body,topics:['invented']}),{email:'test@example.com',token:body.token});
});
test('the actual public app exposes bounded signup and retains all unrelated write restrictions',async t=>{
  let calls=[];
  const base=await serve(t,{fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({success:true})};}});
  const config=await (await fetch(base+'/api/subscriptions/config')).json(); assert.equal(config.available,true);assert.equal(config.signupUrl,'https://lobby.tari.com/ootle');
  for(const origin of ['https://evil.example','https://lobby.tari.com.evil.example','null',''])assert.equal((await submit(base,body,{Origin:origin})).status,403);
  assert.equal((await submit(base,body,{'X-Tari-Newsletter':''})).status,403);
  assert.equal((await submit(base,body,{'Content-Type':'text/plain'})).status,415);
  assert.equal(calls.length,0);
  assert.equal((await submit(base,{...body,consent:false})).status,400);
  assert.equal((await fetch(base+'/api/subscriptions',{method:'POST',headers,body:'invalid-json'})).status,400);
  const result=await submit(base);assert.equal(result.status,200);assert.equal((await result.json()).success,true);
  assert.equal(calls.length,1);assert.equal(calls[0].url,TARI_NEWSLETTER_ENDPOINT);
  assert.deepEqual(JSON.parse(calls[0].options.body),{email:'test@example.com',token:body.token});
  assert.equal(calls[0].options.headers.Origin,env.PUBLIC_SITE_URL);assert.equal(calls[0].options.redirect,'error');assert.ok(calls[0].options.signal);
  for(const path of ['/api/projects','/api/subscriptions/other'])assert.equal((await fetch(base+path,{method:'POST'})).status,410);
});
test('provider errors and malformed responses never become a success or automatic retry',async t=>{
  for(const response of [{ok:false,status:403,json:async()=>({success:true})},{ok:true,json:async()=>({success:false})},{ok:true,json:async()=>({success:'true'})},{ok:true,json:async()=>{throw Error('invalid json');}},null]) {
    let calls=0;const base=await serve(t,{fetcher:async()=>{calls++;if(!response)throw Error('timeout');return response;}});
    const result=await submit(base);assert.equal(result.status,502);assert.equal((await result.json()).success,undefined);assert.equal(calls,1);
  }
});
test('unconfigured signup never forwards and burst limits recover after one minute',async t=>{
  let calls=0,clock=100000;
  const fetcher=async()=>{calls++;return {ok:true,json:async()=>({success:true})};};
  const closed=await serve(t,{env:{},fetcher});assert.equal((await submit(closed)).status,503);assert.equal(calls,0);
  const base=await serve(t,{fetcher,now:()=>clock});
  for(let i=0;i<6;i++)assert.equal((await submit(base)).status,i===5?429:200);
  assert.equal(calls,5);clock+=60000;assert.equal((await submit(base)).status,200);
});
