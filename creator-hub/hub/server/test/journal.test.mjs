import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publishedArticles,journalHtml,journalFeed,launch} from '../journal.mjs';
import {createSubscriptionHandler,subscriptionConfiguration,validateSubscription} from '../subscriptions.mjs';
const fixture={email:' Test@Example.com ',topics:['launch','journal','journal'],consent:true};
const environment={SUBSCRIPTION_WEBHOOK_URL:'https://provider.example/signup',SUBSCRIPTION_WEBHOOK_TOKEN:'test-only',SUBSCRIPTION_PRIVACY_URL:'https://provider.example/privacy'};
function response(){return {code:200,data:null,set(){return this;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};}
test('published articles contain sources and review metadata, future posts stay hidden',()=>{
 const articles=publishedArticles(new Date('2026-09-24'));assert.equal(articles.length,3);assert.equal(publishedArticles(new Date('2026-09-01')).length,0);
 for(const article of articles){assert.ok(article.sources.length);assert.ok(article.sections.length>=4);assert.ok(article.reviewedAt);assert.ok(article.description.length<200);}
 assert.equal(Date.parse(launch.target),Date.UTC(2026,10,11,11,11));
});
test('article HTML includes crawlable copy, canonical metadata and escaped JSON-LD',()=>{
 const article=publishedArticles(new Date('2026-09-24'))[0];
 const html=journalHtml('<title>Hub</title><div id="root"></div>',article,'https://hub.example');
 assert.ok(html.includes(article.sections[0][1]));assert.match(html,/application\/ld\+json/);assert.ok(html.includes('https://hub.example/blog/'+article.slug));
 const escaped=journalHtml('<title>Hub</title><div id="root"></div>',{...article,title:'</script><script>bad()</script>'});assert.ok(!escaped.includes('<script>bad()'));assert.match(escaped,/&lt;script&gt;/);
 assert.match(journalFeed('https://hub.example'),/<rss version="2.0">/);
});
test('reject malformed input and missing consent or topics',()=>{
 for(const input of [null,[],{},0,{...fixture,email:0},{...fixture,email:'a@b'},{...fixture,topics:null},{...fixture,topics:[]},{...fixture,topics:['unknown']},{...fixture,consent:'yes'},{...fixture,website:'bot'}])assert.throws(()=>validateSubscription(input));
 assert.deepEqual(validateSubscription(fixture).topics,['journal','launch']);assert.equal(validateSubscription(fixture).email,'test@example.com');
});
test('unconfigured provider fails closed without transmitting any address',async()=>{
 assert.equal(subscriptionConfiguration({}).available,false);
 const handler=createSubscriptionHandler({env:{},fetcher:()=>{throw Error('Must not call');}});const res=response();await handler({body:fixture},res);assert.equal(res.code,503);
});
test('confirmed durable handoff is pending only; retries share idempotency key and time out safely',async()=>{
 const calls=[];const handler=createSubscriptionHandler({env:environment,now:()=>100000,fetcher:async(url,options)=>{calls.push(options);return {ok:true,json:async()=>({status:'pending_confirmation'})};}});
 for(let i=0;i<2;i++){const res=response();await handler({body:fixture,ip:'test'},res);assert.equal(res.code,202);assert.match(res.data.message,/not subscribed until/);}
 assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);assert.equal(JSON.parse(calls[0].body).doubleOptIn,true);
 const failure=createSubscriptionHandler({env:environment,fetcher:async()=>({ok:true,json:async()=>({status:'unknown'})})});const res=response();await failure({body:fixture,ip:'test'},res);assert.equal(res.code,502);
});
test('rate limit rejects excess attempts and recovers next minute',async()=>{
 let now=100000;const handler=createSubscriptionHandler({env:environment,now:()=>now,fetcher:async()=>({ok:true,json:async()=>({status:'pending_confirmation'})})});
 for(let i=0;i<6;i++){const res=response();await handler({body:fixture,ip:'test'},res);assert.equal(res.code,i===5?429:202);}
 now+=60000;const res=response();await handler({body:fixture,ip:'test'},res);assert.equal(res.code,202);
});
