// INTEGRATION_GAP[LOBBY-REWARDS] (local-only): see docs/DEVELOPMENT_GAPS.md#lobby-rewards.
import {get, put, BlobError, BlobPreconditionFailedError} from '@vercel/blob';
import {createHash} from 'node:crypto';
import {setTimeout as pause} from 'node:timers/promises';
import {createDailyTrivia} from './dailyTrivia.mjs';

const MAX_WRITE_ATTEMPTS=5;
const unavailable=()=>Object.assign(new Error('Your round could not be saved. Please try again.'),{status:503});
const writeConflict=error=>error instanceof BlobPreconditionFailedError || (
 error instanceof BlobError && error.message.includes('conditional request cannot succeed due to a conflicting operation')
);

/** Private per-player records; consistent reads and conditional writes prevent lost or duplicate awards. */
export function createBlobDailyTrivia({token,client={get,put},now=Date.now,...gameOptions}={}) {
 const pathname=id=>`daily-ritual/players/${createHash('sha256').update(id).digest('hex')}.json`;
 const model=(store,time)=>createDailyTrivia('',{
  ...gameOptions,now:time===undefined?now:()=>time,
  storage:{load:()=>store,save:()=>{}},
 });
 async function read(id) {
  if(!token)throw unavailable();
  const result=await client.get(pathname(id),{token,access:'private',useCache:false});
  if(!result)return null;
  const record=await new Response(result.stream).json();
  if(record.schemaVersion!==1 || !record.player || !Number.isSafeInteger(record.player.balance))throw unavailable();
  return {store:{players:{[id]:record.player}},etag:result.blob.etag};
 }
 async function write(id,store,etag) {
  if(!token)throw unavailable();
  return client.put(pathname(id),JSON.stringify({schemaVersion:1,player:store.players[id]}),{
   token,access:'private',addRandomSuffix:false,contentType:'application/json',
   allowOverwrite:Boolean(etag),...(etag?{ifMatch:etag}:{}),
  });
 }
 async function register() {
  const store={players:{}};
  const id=model(store).register();
  await write(id,store);
  return id;
 }
 async function readState(id) {
  const snapshot=await read(id);
  return snapshot?model(snapshot.store).get(id):null;
 }
 async function update(id,operation,input) {
  const receivedAt=now();
  for(let attempt=0;attempt<MAX_WRITE_ATTEMPTS;attempt++) {
   const snapshot=await read(id);
   if(!snapshot)throw Object.assign(new Error('Reload the daily challenge to begin.'),{status:401});
   const previous=JSON.stringify(snapshot.store);
   const game=model(snapshot.store,receivedAt);
   const state=operation==='reset'?game.reset(id):game.mutate(id,operation,input);
   if(JSON.stringify(snapshot.store)===previous)return state;
   try {
    await write(id,snapshot.store,snapshot.etag);
    return state;
   } catch(error) {
    // Another instance won this update. Reload its result before considering a retry.
    if(!writeConflict(error))throw error;
    await pause(25*2**attempt);
   }
  }
  throw unavailable();
 }
 return {get:readState,register,mutate:update,reset:id=>update(id,'reset')};
}
