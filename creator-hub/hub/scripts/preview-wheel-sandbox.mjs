import http from 'node:http';
const states = new Map();
function fresh(){return {balance:150,day:Math.floor(Date.now()/86400000),serverNow:Date.now(),resetAt:Date.now()+86400000,phase:'won',round:{id:'design-fixture',deadline:Date.now(),base:150,total:150,spinIndex:null,explanation:'Design sandbox: scripted outcomes, no real rewards.'},multipliers:[1,2,1,3,2,5],superSpins:[{factor:1,percent:60,effective:5},{factor:2,percent:25,effective:10},{factor:5,percent:12,effective:25},{factor:10,percent:3,effective:50}],maxPathPercent:0.5};}
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4211');
 const token=/sandbox=([\w-]+)/.exec(req.headers.cookie||'')?.[1]||crypto.randomUUID();
 res.setHeader('Set-Cookie',`sandbox=${token}; Path=/; HttpOnly; SameSite=Strict`);
 if(url.pathname.startsWith('/api/daily-trivia')){
  let game=states.get(token)||fresh(); states.set(token,game);
  if(url.pathname.endsWith('/spin')){game.phase='super';game.balance=750;Object.assign(game.round,{spinIndex:5,total:750,effectiveMultiplier:5});}
  if(url.pathname.endsWith('/super')){game.phase='complete';game.balance=7500;Object.assign(game.round,{total:7500,superFactor:10,effectiveMultiplier:50});}
  if(url.pathname.endsWith('/decline')){game.phase='complete';game.round.superDeclined=true;}
  game.serverNow=Date.now();res.setHeader('Content-Type','application/json');res.end(JSON.stringify(game));return;
 }
 if(url.pathname==='/reset'){states.set(token,fresh());res.writeHead(302,{Location:'/#daily-spark'});res.end();return;}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(403);res.end('Sandbox: writes disabled');return;}
 try{const upstream=await fetch('http://127.0.0.1:4210'+req.url);let bytes=Buffer.from(await upstream.arrayBuffer());const type=upstream.headers.get('content-type')||'';res.setHeader('Content-Type',type);
 if(type.includes('text/html')){bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>localStorage.setItem("creator-hub:welcome:v1","seen")</script>').replace('<body>','<body><div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#fff;color:#111;padding:8px;text-align:center;font:14px sans-serif">DESIGN SANDBOX · Scripted 5× then 50× · No real rewards · <a href="/reset">Restart demo</a> · <a href="http://127.0.0.1:4210/#daily-spark">Back to your real round</a></div>'));}
 res.writeHead(upstream.status);res.end(bytes);
 }catch{res.writeHead(502);res.end('Preview unavailable');}
}).listen(4211,'127.0.0.1',()=>console.log('Scripted design sandbox http://127.0.0.1:4211/#daily-spark'));
