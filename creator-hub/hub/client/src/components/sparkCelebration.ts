/** Page-level presentation only. Reuses the approved AI Spark mark without polygon-confetti video. */
export function sparkCelebration(frame: HTMLIFrameElement, stage: {x: number; y: number; radius: number}, intense: boolean) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.hubEffects === 'off') return () => {};
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, {position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '90', overflow: 'hidden'});
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {position: 'absolute', width: '100%', height: '100%'});
  layer.append(canvas); document.body.append(layer);
  const context = canvas.getContext('2d')!;
  const width = innerWidth, height = innerHeight, ratio = Math.min(devicePixelRatio, 2);
  canvas.width = width * ratio; canvas.height = height * ratio; context.scale(ratio, ratio);
  const rect = frame.getBoundingClientRect();
  const origin = {x: rect.left + stage.x, y: rect.top + stage.y};
  const colors = ['#c9eb00', '#ff3cba', '#59f5ff', '#f3a9ff'];
  const particles = Array.from({length: intense ? 220 : 64}, (_, i) => {
    const angle = Math.PI * 2 * Math.random();
    const speed = Math.min(width, 1200) * (intense ? .45 + Math.random() * .65 : .3 + Math.random() * .45);
    return {angle, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (intense ? 320 : 190),
      size: 8 + Math.random() * (intense ? 34 : 19), color: colors[i % colors.length], delay: intense ? (i % 3) * .32 + Math.random() * .16 : Math.random() * .28, turn: Math.random() * 6};
  });
  // Rasterize the existing Spark mark once per color, not hundreds of glowing glyphs per frame.
  const sprites = colors.map(color => {
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 96;
    const paint = sprite.getContext('2d')!;
    paint.fillStyle = color; paint.shadowColor = color; paint.shadowBlur = 12;
    paint.font = '56px sans-serif'; paint.textAlign = 'center'; paint.textBaseline = 'middle';
    paint.fillText('✦', 48, 48); return sprite;
  });
  const rain = intense ? Array.from({length: 100}, (_, i) => ({
    x: Math.random() * width, speed: 150 + Math.random() * 220,
    delay: .55 + Math.random() * 1.15, size: 10 + Math.random() * 22,
    drift: (Math.random() - .5) * 110, sprite: i % sprites.length,
  })) : [];
  const bolts = Array.from({length: 14}, (_, i) => ({
    angle: i / 14 * Math.PI * 2, bend: (Math.random() - .5) * .3,
    length: 80 + Math.random() * 160, color: colors[i % colors.length],
  }));
  let request = 0, stopped = false;
  const start = performance.now();
  function stop() {
    if (stopped) return; stopped = true;
    cancelAnimationFrame(request); layer.remove();
    observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
    motion.removeEventListener('change', preferences); window.removeEventListener('resize', stop);
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const preferences = () => {if (motion.matches || document.documentElement.dataset.hubEffects === 'off') stop();};
  const visibility = () => {if (document.hidden) stop();};
  const observer = new MutationObserver(preferences);
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-hub-effects']});
  motion.addEventListener('change', preferences); document.addEventListener('visibilitychange', visibility);
  window.addEventListener('resize', stop);
  function tick(now: number) {
    if (stopped) return;
    const elapsed = (now - start) / 1000;
    if (elapsed > 4.1) {stop(); return;}
    const bounds = frame.getBoundingClientRect();
    const x = bounds.left + stage.x, y = bounds.top + stage.y;
    // Composite the shower above stripes, then occlude only wheel/fire and payout text.
    context.clearRect(0, 0, width, height);
    if (intense) {
      // Three expanding discharges, never a full-screen flash. The pointer/result stay clear.
      for (let wave = 0; wave < 3; wave++) {
        const age = elapsed - wave * .32;
        if (age < 0 || age > .8) continue;
        const radius = stage.radius * (1.12 + age * 1.8);
        context.save(); context.globalAlpha = (1 - age / .8) * .85;
        context.lineWidth = 3.5 * (1 - age / .8);
        for (const bolt of bolts) {
          context.strokeStyle = bolt.color; context.shadowColor = bolt.color; context.shadowBlur = 12; context.beginPath();
          for (let step = 0; step < 6; step++) {
            const a = bolt.angle + (step % 2 ? bolt.bend : -bolt.bend);
            const r = radius + step / 5 * bolt.length;
            const bx = x + Math.cos(a) * r, by = y + Math.sin(a) * r;
            if (step === 0) context.moveTo(bx, by); else context.lineTo(bx, by);
          }
          context.stroke();
        }
        context.restore();
      }
      for (const drop of rain) {
        const age = elapsed - drop.delay;
        if (age < 0) continue;
        const px = drop.x + Math.sin(age * 2) * drop.drift;
        const py = -40 + age * drop.speed + 60 * age * age;
        context.globalAlpha = Math.min(1, age * 5) * Math.min(1, (4.1-elapsed)/.65);
        context.drawImage(sprites[drop.sprite],px-drop.size,py-drop.size,drop.size*2,drop.size*2);
      }
    }
    for (const p of particles) {
      const t = elapsed - p.delay;
      if (t < 0) continue;
      const px = origin.x + Math.cos(p.angle) * stage.radius + p.vx * t;
      const py = origin.y + Math.sin(p.angle) * stage.radius + p.vy * t + 165 * t * t;
      context.save(); context.translate(px, py); context.rotate(p.turn + t * 2);
      context.globalAlpha = Math.min(1, t * 7) * Math.max(0, 1 - t / 3.6);
      if (intense) context.drawImage(sprites[colors.indexOf(p.color)], -p.size, -p.size, p.size*2, p.size*2);
      else {context.fillStyle=p.color;context.shadowColor=p.color;context.shadowBlur=12;context.font=`${p.size}px sans-serif`;context.textAlign='center';context.fillText('✦',0,0);}
      context.restore();
    }
    context.save();
    context.globalAlpha=1;context.globalCompositeOperation='destination-out';
    const halo=context.createRadialGradient(x,y,stage.radius*1.18,x,y,stage.radius*1.58);
    halo.addColorStop(0,'#000');halo.addColorStop(1,'transparent');
    context.fillStyle=halo;context.beginPath();context.arc(x,y,stage.radius*1.58,0,Math.PI*2);context.fill();
    // Protect only actual glyph boxes, not a blank rectangle through the ray field.
    for(const node of frame.contentDocument?.querySelectorAll('#phase,#reward,#win-unit') || []){
      const text=node as HTMLElement;
      if(text.hidden)continue;
      const range=text.ownerDocument.createRange();range.selectNodeContents(text);
      for(const box of range.getClientRects()){
        context.fillStyle='#000';context.fillRect(bounds.left+box.left-6,bounds.top+box.top-6,box.width+12,box.height+12);
      }
    }
    context.restore();
    request = requestAnimationFrame(tick);
  }
  request = requestAnimationFrame(tick);
  return stop;
}
