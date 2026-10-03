import {readFileSync,writeFileSync,mkdirSync,renameSync,statSync} from 'node:fs';
import path from 'node:path';
import {runtimeDir} from './paths.mjs';
export const TRELLO_BOARD_ID = 'ari:cloud:trello::board/workspace/6ab5465b65104f5d16cd7934/6ab546b403efae97f2a5fba6';
export const snapshotPath = path.join(runtimeDir,'cache','trello-marketing-calendar.json');
const MAX_BYTES=2_000_000;

export function normalizeSnapshot(input) {
  if(input?.boardId!==TRELLO_BOARD_ID || input.hasNextPage!==false || !Array.isArray(input.lists)) throw new Error('Expected a complete snapshot of the authorized board');
  const timestamp=Date.parse(input.syncedAt);
  if(!Number.isFinite(timestamp) || timestamp>Date.now()+60_000) throw new Error('Invalid sync timestamp');
  const seen=new Set();
  const lists=input.lists.map(list=>{
    if(typeof list.id!=='string' || typeof list.name!=='string' || !Array.isArray(list.cards)) throw new Error('Invalid list');
    return {id:list.id,name:list.name,cards:list.cards.map(card=>{
      if(seen.has(card.id))throw new Error('Duplicate card');
      seen.add(card.id);
      if(typeof card.id!=='string' || typeof card.name!=='string' || typeof card.url!=='string') throw new Error('Invalid card');
      return {id:card.id,name:card.name,url:card.url,closed:card.closed===true,
        due:card.due?.date ?? null,start:card.startedAt ?? null,dueComplete:card.due?.complete===true || card.complete===true,
        labels:(card.labels||[]).map(label=>({name:String(label.name || label.color || '')}))};
    })};
  });
  return {boardId:input.boardId,syncedAt:new Date(timestamp).toISOString(),lists};
}

export function writeSnapshot(snapshot,file=snapshotPath) {
  const previous=readSnapshot(file);
  if(previous && Date.parse(previous.syncedAt)>Date.parse(snapshot.syncedAt))throw new Error('Refusing an older snapshot');
  const data=JSON.stringify(snapshot);
  if(Buffer.byteLength(data)>MAX_BYTES)throw new Error('Snapshot too large');
  mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
  const temporary=file+'.'+process.pid+'.tmp';
  writeFileSync(temporary,data,{mode:0o600});renameSync(temporary,file);
}

export function readSnapshot(file=snapshotPath) {
  try {
    if(statSync(file).size>MAX_BYTES)throw new Error('Snapshot too large');
    const data=JSON.parse(readFileSync(file,'utf8'));
    if(data.boardId!==TRELLO_BOARD_ID || !Array.isArray(data.lists) || !Number.isFinite(Date.parse(data.syncedAt)))throw new Error('Invalid snapshot');
    return data;
  } catch(error) {if(error.code==='ENOENT')return null;throw error;}
}
