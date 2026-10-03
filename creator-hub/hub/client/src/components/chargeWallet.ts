/** Presentation only: confirmed balance delta flies into the existing wallet. */
export function chargeWallet(wallet: HTMLElement, from: number, to: number, count: (value: number) => void, onArrival = () => {}) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const target = wallet.getBoundingClientRect();
  const visible = target.top >= 0 && target.bottom <= innerHeight && target.left >= 0 && target.right <= innerWidth;
  if (!visible || motion.matches || document.documentElement.dataset.hubEffects === 'off') {onArrival(); count(to); return () => {};}
  let source = document.querySelector('.unlock-object')?.getBoundingClientRect();
  const frame = document.querySelector<HTMLIFrameElement>('.playtest-wheel iframe');
  const stage = frame?.contentDocument?.querySelector('#stage')?.getBoundingClientRect();
  if (!source && frame && stage) {
    const box = frame.getBoundingClientRect();
    source = new DOMRect(box.left + stage.left, box.top + stage.top, stage.width, stage.height);
  }
  const startX = source ? source.left + source.width / 2 : innerWidth / 2;
  const startY = source ? source.top + source.height / 2 : innerHeight / 2;
  const endX = target.left + target.width / 2, endY = target.top + target.height / 2;
  const layer = document.createElement('div'); layer.setAttribute('aria-hidden','true');
  Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'11000',overflow:'hidden'});
  document.body.append(layer);
  // Scale spectacle by this confirmed gain, not the account's lifetime balance.
  const gain=Math.max(0,to-from);
  const level=gain>=1500?3:gain>150?2:1;
  const big=level===3;
  const particleCount=big?(innerWidth<600?36:48):level===2?28:14;
  const duration=big?1100:level===2?950:850;
  const stagger=big?22:28;
  const collectionDuration=big?1600:Math.max(900,(particleCount-1)*stagger+250);
  const endAt=duration+collectionDuration+300;
  const animations: Animation[] = [];
  for (let i = 0; i < particleCount; i++) {
    const spark = document.createElement('i'); spark.textContent = '✦';
    const color = ['#c9eb00','#ff3cba','#59f5ff','#f3a9ff'][i % 4];
    Object.assign(spark.style,{position:'absolute',left:'0',top:'0',fontStyle:'normal',fontSize:`${(big?30:level===2?26:22) + i % 4 * (big?8:5)}px`,color,textShadow:`0 0 12px ${color}`});
    layer.append(spark);
    const bend = (i % 2 ? 1 : -1) * Math.min(innerWidth*.28,60 + (i%12)*8 + (level-1)*35);
    animations.push(spark.animate([
      {transform:`translate(${startX}px,${startY}px) scale(.3)`,opacity:0},
      {transform:`translate(${Math.max(24,Math.min(innerWidth-40,startX + bend))}px,${startY - 70}px) scale(1.1)`,opacity:1,offset:.25},
      {transform:`translate(${Math.max(20,Math.min(innerWidth-40,endX + bend * .3))}px,${endY + 45}px) scale(.8)`,opacity:1,offset:.8},
      {transform:`translate(${endX}px,${endY}px) scale(.2)`,opacity:0}
    ],{duration,delay:big?Math.floor(i/(particleCount/3))*440+(i%(particleCount/3))*18:i*stagger,easing:'cubic-bezier(.3,.05,.5,1)',fill:'both'}));
  }
  if(big){
    // Arrival shockwaves surround the wallet without covering its number.
    for(let wave=0;wave<3;wave++){
      const ring=document.createElement('i');
      Object.assign(ring.style,{position:'absolute',left:`${target.left}px`,top:`${target.top}px`,width:`${target.width}px`,height:`${target.height}px`,borderRadius:'999px',border:`3px solid ${wave%2?'#ff3cba':'#c9eb00'}`,boxShadow:'0 0 24px #ff3cba',boxSizing:'border-box'});
      layer.append(ring);
      animations.push(ring.animate([{transform:'scale(.96)',opacity:0},{transform:'scale(1.05)',opacity:1,offset:.16},{transform:'scale(1.65,2.1)',opacity:0}],{duration:850,delay:duration+wave*440,fill:'both',easing:'ease-out'}));
      for(let i=0;i<8;i++){
        const fleck=document.createElement('i');fleck.textContent='✦';
        const angle=Math.PI*(.12+i*.11),reach=50+(i%3)*24;
        Object.assign(fleck.style,{position:'absolute',left:`${target.left+target.width*i/7}px`,top:`${target.bottom}px`,color:i%2?'#ff3cba':'#c9eb00',fontSize:'24px',fontStyle:'normal',textShadow:'0 0 10px currentColor'});
        layer.append(fleck);
        animations.push(fleck.animate([{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1.2)',offset:.12},{opacity:0,transform:`translate(${Math.cos(angle)*reach}px,${Math.sin(angle)*reach}px) rotate(90deg) scale(.2)`}],{duration:650,delay:duration+wave*440+i*12,fill:'both',easing:'ease-out'}));
      }
    }
  }
  let request = 0, stopped = false, pulse: Animation | undefined;
  const start = performance.now(); count(from);
  let arrived=false;
  function arrive(){if(!arrived){arrived=true;onArrival();}}
  const observer = new MutationObserver(cancelIfDisabled);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-hub-effects']});
  window.addEventListener('resize',relocate); window.addEventListener('scroll',relocate,{passive:true});
  motion.addEventListener('change',cancelIfDisabled); document.addEventListener('visibilitychange',cancelIfDisabled);
  function stop() {if(stopped)return;stopped=true;cancelAnimationFrame(request);animations.forEach(a=>a.cancel());pulse?.cancel();layer.remove();window.removeEventListener('resize',relocate);window.removeEventListener('scroll',relocate);observer.disconnect();motion.removeEventListener('change',cancelIfDisabled);document.removeEventListener('visibilitychange',cancelIfDisabled);}
  function relocate(){arrive();count(to);stop();}
  function cancelIfDisabled(){if(document.hidden || motion.matches || document.documentElement.dataset.hubEffects==='off'){arrive();count(to);stop();}}
  function tick(now:number){
    const elapsed=now-start;
    if(elapsed>=duration && !pulse) {window.dispatchEvent(new CustomEvent('ootle-wallet-payout', {detail: gain}));arrive();pulse=wallet.animate(big?[
      {transform:'scale(1)',filter:'brightness(1)'},
      {transform:'scale(1.12) rotate(-1deg)',filter:'brightness(1.7)',boxShadow:'0 0 65px #ff3cba, inset 0 0 18px #c9eb00',offset:.12},
      {transform:'scale(1.035) rotate(0deg)',filter:'brightness(1.2)',offset:.25},
      {transform:'scale(1.13) rotate(1deg)',filter:'brightness(1.8)',boxShadow:'0 0 80px #c9eb00, inset 0 0 18px #ff3cba',offset:.4},
      {transform:'scale(1.04)',filter:'brightness(1.2)',offset:.55},
      {transform:'scale(1.14) rotate(-1deg)',filter:'brightness(1.8)',boxShadow:'0 0 85px #ff3cba, inset 0 0 18px #c9eb00',offset:.72},
      {transform:'scale(1)',filter:'brightness(1)',boxShadow:'0 0 0 transparent'}
    ]:[
      {transform:'scale(1)',filter:'brightness(1)',boxShadow:'0 0 0 transparent'},
      {transform:`scale(${big?1.11:level===2?1.075:1.04})`,filter:`brightness(${big?1.9:level===2?1.7:1.5})`,boxShadow:`0 0 ${big?70:level===2?42:20}px #ff3cba, inset 0 0 16px #c9eb00`,offset:.3},
      {transform:'scale(1)',filter:'brightness(1)',boxShadow:'0 0 0 transparent'}
    ],{duration:collectionDuration+200,easing:'ease-out'});}
    const progress=Math.max(0,Math.min(1,(elapsed-duration)/collectionDuration));
    const counted=big?progress*progress*(3-2*progress):1-Math.pow(1-progress,3);
    count(Math.round(from+(to-from)*counted));
    if(elapsed>=endAt){count(to);stop();return;}
    request=requestAnimationFrame(tick);
  }
  request=requestAnimationFrame(tick); return stop;
}
