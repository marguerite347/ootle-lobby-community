import {CREATOR_QUESTIONS} from './creatorQuestions.mjs';
import {randomInt,randomUUID} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import express from 'express';

// Author-reviewed, stable creator knowledge. Correct answers never enter a live round payload.
const LEGACY_QUESTIONS = [
 ['What does a game’s “core loop” describe?', ['The actions a player repeats','The loading screen','The file size','The end credits'], 'A core loop is the repeating cycle of actions and feedback that makes a game work.'],
 ['What makes a Riff different from simply copying?', ['A meaningful creative change','Renaming the folder only','Removing the credits','Changing the download date'], 'A Riff builds on an existing foundation with a meaningful change and appropriate credit.'],
 ['What is the best first step when testing a new game mechanic?', ['Build a small playable prototype','Write the entire soundtrack','Design every level','Buy advertising'], 'A small prototype lets you test whether the central interaction works before expanding it.'],
 ['Which makes a button feel responsive?', ['Immediate visual feedback','A silent two-second delay','An invisible hit area','Moving away from the pointer'], 'Immediate feedback connects the player’s input to the result.'],
 ['What does a checkpoint usually preserve?', ['A point of progress','Only the title screen','Every animation frame','The monitor brightness'], 'Checkpoints let players resume from a saved point of progress.'],
 ['What is a sprite sheet?', ['Several animation frames in one image','A spreadsheet of scores','An audio waveform','A multiplayer server'], 'A sprite sheet packs images or animation frames into a single texture.'],
 ['Which helps people understand a new mechanic?', ['Letting them try it with clear feedback','Showing every rule at once','Hiding the controls','Starting at maximum difficulty'], 'A small interactive example teaches through action and a visible result.'],
 ['What does “grayboxing” help you test?', ['Layout before detailed art','Audio mastering','Payment processing','Account passwords'], 'Simple shapes let you test a level’s layout, scale and movement before polishing its art.'],
 ['What is a game design constraint?', ['A deliberate limit that shapes decisions','An automatically generated level','A type of video codec','A guaranteed bug'], 'Limits on time, controls or resources can focus creative decisions.'],
 ['Why use version control for a creator project?', ['Track and recover changes','Guarantee a fun game','Replace all backups automatically','Increase screen resolution'], 'Version control records changes so collaborators can inspect and recover prior work.'],
 ['What is playtesting for?', ['Observing how people actually play','Only checking the logo','Proving everyone will like it','Replacing all debugging'], 'Watching real players exposes confusion and friction that creators can miss.'],
 ['What does a cooldown usually do?', ['Limits how frequently an action repeats','Deletes a saved game','Changes the art license','Resizes the window'], 'Cooldowns put time between uses of an action, helping shape pacing and decisions.'],
 ['Which improves accessibility in an action game?', ['Remappable controls','Information conveyed only by color','Tiny unreadable labels','Mandatory flashing effects'], 'Remappable controls let more people use a layout that works for them.'],
 ['What should you check before adding a new package?', ['Whether existing tools already solve the task','Only its logo','Only its download count','Whether its name sounds exciting'], 'Check the existing toolkit, compatibility and requirements before introducing another dependency.'],
 ];
export const QUESTIONS = [...LEGACY_QUESTIONS, ...CREATOR_QUESTIONS];
// Presentation uses the original easier pool; preserve all indices for saved rounds.
export const questionForDay = day => day % LEGACY_QUESTIONS.length;
export const MULTIPLIERS=[1,2,1,3,2,5];
export const STAGE_JACKPOT=5;
// Our Super Spin table. Blast's historical odds were not published and are not used here.
export const SUPER_SPINS=[
 {factor:1,percent:60},
 {factor:2,percent:25},
 {factor:5,percent:12},
 {factor:10,percent:3},
];
const DAY=86400000;
const fail=(status,message)=>Object.assign(new Error(message),{status});

export function superSpinTable() {
 return SUPER_SPINS.map(row=>({factor:row.factor,percent:row.percent,effective:STAGE_JACKPOT*row.factor}));
}

export function maxDailyPathPercent() {
 const jackpotSlots=MULTIPLIERS.filter(value=>value===STAGE_JACKPOT).length;
 const rare=SUPER_SPINS.find(row=>row.factor===10);
 return (jackpotSlots/MULTIPLIERS.length)*rare.percent;
}

export function selectSuperFactor(ticket) {
 if(!Number.isInteger(ticket)||ticket<0||ticket>99)throw fail(500,'Super Spin draw was invalid.');
 let cursor=0;
 for(const row of SUPER_SPINS){
  cursor+=row.percent;
  if(ticket<cursor)return row.factor;
 }
 return SUPER_SPINS[SUPER_SPINS.length-1].factor;
}

export function createDailyTrivia(root,{now=Date.now,random=randomInt}={}) {
 const file=path.join(root,'daily-trivia.json');
 const load=()=>existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{players:{}};
 function save(store) {
  mkdirSync(root,{recursive:true});
  writeFileSync(file+'.tmp',JSON.stringify(store),{mode:0o600});renameSync(file+'.tmp',file);
 }
 const day=()=>Math.floor(now()/DAY);
 function view(player) {
  const round=player.round?.day===day()?player.round:null;
  const phase=round?.phase==='playing' && now()>round.deadline?'lost':round?.phase || 'ready';
  const multiplier=round?.spinIndex==null?null:MULTIPLIERS[round.spinIndex];
  const superFactor=round?.superFactor??null;
  return {balance:player.balance,day:day(),serverNow:now(),resetAt:(day()+1)*DAY,phase,
   multipliers:MULTIPLIERS,superSpins:superSpinTable(),maxPathPercent:maxDailyPathPercent(),
   round:round?{id:round.id,deadline:round.deadline,
    ...(phase==='playing'?{question:QUESTIONS[round.question][0],options:round.options.map(({id,text})=>({id,text}))}:{}),
    ...(phase!=='playing'?{explanation:QUESTIONS[round.question][2],correctAnswer:QUESTIONS[round.question][1][0],reason:round.reason || 'Time ran out.',base:round.base||0,total:round.total||0,spinIndex:round.spinIndex ?? null,superFactor,superDeclined:Boolean(round.superDeclined),effectiveMultiplier:superFactor?STAGE_JACKPOT*superFactor:multiplier}:{}),}:null};
 }
 function get(id) {
  const store=load();return store.players[id]?view(store.players[id]):null;
 }
 function register() {
  const store=load();
  if(Object.keys(store.players).length>=10000)throw fail(503,'The preview is full. Please try again later.');
  const id=randomUUID();store.players[id]={balance:0};save(store);return id;
 }
 function settleStageSpin(player,round) {
  round.spinIndex=random(MULTIPLIERS.length);
  const multiplier=MULTIPLIERS[round.spinIndex];
  const total=round.base*multiplier;
  player.balance+=total-round.base;
  round.total=total;
  round.phase=multiplier===STAGE_JACKPOT?'super':'complete';
 }
 function settleSuperSpin(player,round) {
  if(round.phase==='complete' && round.superFactor)return;
  if(round.phase==='complete' && round.superDeclined)throw fail(409,'The Super Spin was already declined.');
  if(round.phase!=='super')throw fail(409,'A 5× wedge is required before the Super Spin.');
  const factor=selectSuperFactor(random(100));
  const total=round.base*STAGE_JACKPOT*factor;
  player.balance+=total-round.total;
  round.total=total;
  round.superFactor=factor;
  round.phase='complete';
 }
 function declineSuper(round) {
  if(round.phase==='complete' && (round.superFactor || round.superDeclined))return;
  if(round.phase!=='super')throw fail(409,'No Super Spin is open to decline.');
  round.superDeclined=true;
  round.phase='complete';
 }
 function mutate(id,operation,input={}) {
  const store=load(),player=store.players[id];
  if(!player)throw fail(401,'Your play session expired. Reload to start a new preview session.');
  let round=player.round?.day===day()?player.round:null;
  if(operation==='start') {
   if(!round) {
    const question=questionForDay(day());
    const options=QUESTIONS[question][1].map((text,index)=>({id:randomUUID(),text,correct:index===0}));
    for(let i=options.length-1;i>0;i--){const j=random(i+1);[options[i],options[j]]=[options[j],options[i]];}
    player.round={id:randomUUID(),day:day(),question,options,phase:'playing',startedAt:now(),deadline:now()+20000};
   }
  } else {
   if(!round || input.roundId!==round.id)throw fail(409,'This round is no longer active. Reload the daily challenge.');
   if(operation==='answer' && round.phase==='playing') {
    if(typeof input.optionId!=='string' || !round.options.some(option=>option.id===input.optionId))throw fail(400,'Choose one of this round’s answers.');
    const elapsed=now()-round.startedAt;
    const correct=round.options.find(option=>option.id===input.optionId).correct;
    const won=correct && elapsed>=500 && now()<=round.deadline;
    round.phase=won?'won':'lost';
    round.reason=now()>round.deadline?'Time ran out.':elapsed<500?'Answer arrived too quickly to count.':correct?'You got it!':'Not this time. Keep that new knowledge.';
    round.base=won?(elapsed<=8000?150:100):0;round.total=round.base;player.balance+=round.base;
   } else if(operation==='spin') {
    if(round.phase==='won')settleStageSpin(player,round);
    else if(round.phase!=='complete' && round.phase!=='super')throw fail(409,'Win today’s question to unlock the bonus spin.');
   } else if(operation==='super')settleSuperSpin(player,round);
   else if(operation==='decline')declineSuper(round);
  }
  save(store);return view(player);
 }
 // Testing aid: clears today's round and takes back what it paid, so the same player can replay from the start.
 function reset(id) {
  const store=load(),player=store.players[id];
  if(!player)throw fail(401,'Your play session expired. Reload to start a new preview session.');
  const round=player.round?.day===day()?player.round:null;
  if(round)player.balance=Math.max(0,player.balance-(round.total||0));
  delete player.round;
  save(store);return view(player);
 }
 return {get,register,mutate,reset};
}

const LOOPBACK_ADDRESSES=new Set(['127.0.0.1','::1','::ffff:127.0.0.1']);
const LOCAL_HOSTNAMES=new Set(['localhost','127.0.0.1','[::1]']);
// Reset is only offered to someone on the machine running the Hub, never through a proxy or public host.
export function isLocalRequest(req) {
 const hostname=(req.get('host')||'').replace(/:\d+$/,'');
 return LOOPBACK_ADDRESSES.has(req.socket?.remoteAddress) && LOCAL_HOSTNAMES.has(hostname) && !req.get('X-Forwarded-For');
}

export function dailyTriviaRouter(root,options) {
 const router=express.Router(),game=createDailyTrivia(root,options),requests=new Map();
 // TLS can terminate before Express. Use deployment configuration, never untrusted forwarded headers.
 const publicOrigin=options?.publicOrigin ? new URL(options.publicOrigin).origin : null;
 router.use((req,res,next)=>{
  res.set('Cache-Control','no-store');
  const time=Date.now(),ip=req.ip;
  for(const [key,value] of requests)if(time-value.start>60000)requests.delete(key);
  if(!requests.has(ip) && requests.size>=4096)return res.status(503).json({error:'Please try again shortly.'});
  const bucket=requests.get(ip)||{start:time,count:0};bucket.count++;requests.set(ip,bucket);
  if(bucket.count>90)return res.status(429).json({error:'Too many requests. Try again in a minute.'});
  const expectedOrigin=publicOrigin || `${req.protocol}://${req.get('host')}`;
  if(req.method==='POST' && (req.get('X-Hub-Trivia')!=='1' || (req.get('Origin') && req.get('Origin')!==expectedOrigin)))return res.status(403).json({error:'Use the daily challenge on this Hub.'});
  next();
 });
 router.use((req,res,next)=>{
  try {
   let id=req.headers.cookie?.split(';').map(part=>part.trim()).find(part=>part.startsWith('hub_trivia='))?.slice(11);
   if(!id || !/^[a-f0-9-]{36}$/.test(id) || !game.get(id)) {
    if(req.method!=='GET')return res.status(401).json({error:'Reload the daily challenge to begin.'});
    id=game.register();res.cookie('hub_trivia',id,{httpOnly:true,sameSite:'strict',secure:req.secure,maxAge:365*86400000,path:'/api/daily-trivia'});
   }
   req.triviaPlayer=id;next();
  }catch(error){next(error);}
 });
 const send=(req,res,state)=>res.json({...state,canReset:isLocalRequest(req)});
 router.get('/',(req,res)=>send(req,res,game.get(req.triviaPlayer)));
 for(const action of ['start','answer','spin','super','decline'])router.post('/'+action,(req,res,next)=>{
  try{send(req,res,game.mutate(req.triviaPlayer,action,req.body||{}));}catch(error){next(error);}
 });
 router.post('/reset',(req,res,next)=>{
  try{
   if(!isLocalRequest(req))return res.status(403).json({error:'Reset is only available on the machine running this Hub.'});
   send(req,res,game.reset(req.triviaPlayer));
  }catch(error){next(error);}
 });
 router.use((error,req,res,next)=>res.status(error.status||500).json({error:error.status?error.message:'Could not save your round. Please retry.'}));
 return router;
}
