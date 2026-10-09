import type {RiffSettings} from './riff';

export function guessingPreview(settings: RiffSettings): string {
  const config = JSON.stringify(settings).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>Guessing game preview</title><style>
*{box-sizing:border-box}body{margin:0;color:#f6f3ff;background:#090c23;font:16px/1.5 system-ui,sans-serif}main{max-width:620px;margin:auto;padding:32px 24px;text-align:center}small{color:#c1b1e3;letter-spacing:.13em;font-size:11px}h1{font-size:clamp(24px,5vw,38px);line-height:1.12;margin:18px 0}p{color:#c7c2d6}.orb{width:66px;height:66px;margin:20px auto;border-radius:22px;display:grid;place-items:center;background:#352456;border:1px solid #7850a3;color:var(--accent);font-size:32px;transform:rotate(-7deg)}.numbers{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:22px 0}button{font:inherit;cursor:pointer;border-radius:12px;min-height:46px;border:1px solid #65527b;background:#201c38;color:#fff}button:hover,button[aria-pressed=true]{background:var(--accent);color:#111323}button:focus-visible{outline:3px solid white;outline-offset:3px}button:disabled{opacity:.4;cursor:default}.primary{padding:12px 20px;background:var(--accent);color:#111323;font-weight:700}.actions{display:flex;justify-content:center;flex-wrap:wrap;gap:10px}.status{min-height:3em}.guesses{font-size:13px;color:#bfb4d6;min-height:20px}.result{font-size:26px;font-weight:800;color:var(--accent);min-height:40px;margin:12px 0}#restart{padding:10px 18px}footer{font-size:11px;color:#968ba8;margin-top:22px}@media(max-width:360px){main{padding:22px 14px}.numbers{gap:6px}}
</style></head><body><main data-settings="${config}"><small>YOUR GUESSING GAME</small><h1 id="title"></h1><p id="prompt"></p><div class="orb" aria-hidden="true">?</div><p class="status" id="status" role="status"></p><div class="numbers" id="numbers" role="group" aria-label="Choose a number"></div><div class="actions"><button class="primary" id="guess" disabled>Lock in guess</button><button id="reveal" disabled>Reveal number</button></div><p class="guesses" id="guesses"></p><p class="result" id="result" role="status"></p><button id="restart" hidden>Start a new round ↻</button><footer>Browser simulation · no wallet or real rewards</footer></main><script>
const config = JSON.parse(document.querySelector('main').dataset.settings);
document.documentElement.style.setProperty('--accent',config.accent);
document.getElementById('title').textContent=config.title;
document.getElementById('prompt').textContent=config.prompt;
let picks=[],selected=null,finished=false;
const byId=id=>document.getElementById(id);
for(let number=0;number<=10;number++){
 const button=document.createElement('button');button.textContent=String(number);button.setAttribute('aria-pressed','false');
 button.onclick=()=>{selected=number;render()};byId('numbers').append(button);
}
function render(){
 const full=picks.length>=config.maxPlayers;
 byId('status').textContent=finished?'Round complete':full?'Everyone is in. Reveal the secret number.':'Player '+(picks.length+1)+' of '+config.maxPlayers+' · choose 0–10';
 Array.from(byId('numbers').children).forEach((button,index)=>{button.disabled=finished||full;button.setAttribute('aria-pressed',String(index===selected))});
 byId('guess').disabled=finished||full||selected===null;byId('reveal').disabled=finished||picks.length===0;
 byId('guesses').textContent=picks.map((value,index)=>'Player '+(index+1)+': '+value).join(' · ');
 byId('restart').hidden=!finished;
}
byId('guess').onclick=()=>{if(selected===null||finished||picks.length>=config.maxPlayers)return;picks.push(selected);selected=null;render()};
byId('reveal').onclick=()=>{
 if(finished||!picks.length)return;
 const random=crypto.getRandomValues(new Uint8Array(1))[0]%11;
 const winner=picks.indexOf(random);finished=true;
 byId('result').textContent='The number was '+random+'. '+(winner<0?'No winner this round.':'Player '+(winner+1)+' wins '+config.prizeName+'!');render();
};
byId('restart').onclick=()=>{picks=[];selected=null;finished=false;byId('result').textContent='';render()};
render();
new ResizeObserver(()=>parent.postMessage({type:'guessing-preview-size',height:Math.ceil(document.querySelector('main').getBoundingClientRect().height)},'*')).observe(document.querySelector('main'));
</script></body></html>`;
}
