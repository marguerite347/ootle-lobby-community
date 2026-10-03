type Point = {x:number;y:number;time:number};
type Spark = Point & {vx:number;vy:number;life:number;size:number};

/** Bounded, movement-driven canvas effect. No React renders or idle animation loop. */
export function createCometCursor(canvas: HTMLCanvasElement) {
 const context = canvas.getContext('2d');
 let frame = 0;
 let points: Point[] = [];
 let sparks: Spark[] = [];
 let pointer: Point | null = null;
 let head: Point | null = null;
 let lastEmission = 0;
 let target: Point | null = null;
 let lastFrame = 0;
 let width = 0, height = 0, scale = 1;

 function hide() {
  cancelAnimationFrame(frame); frame = 0;
  points = []; sparks = []; pointer = null; head = null; target = null; lastFrame = 0;
  context?.clearRect(0, 0, width, height);
  canvas.style.opacity = '0';
 }

 function resize() {
  const nextScale = Math.min(devicePixelRatio || 1, 2);
  if(width === innerWidth && height === innerHeight && scale === nextScale) return;
  width = innerWidth; height = innerHeight; scale = nextScale;
  canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
  context!.setTransform(scale, 0, 0, scale, 0, 0);
 }

 function glow(x:number, y:number, radius:number, opacity:number) {
  const gradient = context!.createRadialGradient(x,y,0,x,y,radius);
  gradient.addColorStop(0, `rgba(248,255,218,${opacity})`);
  gradient.addColorStop(.2, `rgba(216,245,100,${opacity * .8})`);
  gradient.addColorStop(.5, `rgba(190,137,255,${opacity * .45})`);
  gradient.addColorStop(1, 'rgba(153,97,255,0)');
  context!.fillStyle = gradient;
  context!.fillRect(x-radius,y-radius,radius*2,radius*2);
 }

 function paint(now:number) {
  if(!context || !pointer || !head) {hide(); return;}
  resize(); context.clearRect(0,0,width,height);
  const elapsed = Math.min(50, Math.max(0, now-lastFrame));
  lastFrame = now;
  // A time-based follower removes pointer-event jitter without moving the real cursor.
  if(target && now-pointer.time < 160) {
   const blend = 1-Math.exp(-elapsed/90);
   const dx = target.x-head.x, dy = target.y-head.y;
   if(Math.hypot(dx,dy)>.4) {
    head={x:head.x+dx*blend,y:head.y+dy*blend,time:now};
    points.push(head); points=points.slice(-40);
    if(now-lastEmission>36) {
     lastEmission=now;
     sparks.push({...head,vx:(Math.random()-.5)*24,vy:(Math.random()-.5)*24,
      life:480+Math.random()*180,size:.6+Math.random()*.7});
     sparks=sparks.slice(-24);
    }
   }
  }
  points = points.filter(point => now-point.time < 480);
  sparks = sparks.filter(spark => now-spark.time < spark.life);
  context.save();
  // Keep the native pointer and the text directly beneath it unobstructed.
  context.beginPath(); context.rect(0,0,width,height);
  context.moveTo(pointer.x+10,pointer.y);
  context.arc(pointer.x,pointer.y,10,0,Math.PI*2,true); context.clip('evenodd');
  context.lineCap = 'round'; context.lineJoin = 'round';
  for(let index=1; index<points.length; index++) {
   const previous=points[index-1], point=points[index];
   const strength=Math.max(0,1-(now-point.time)/480);
   const taper=strength*strength;
   context.beginPath(); context.moveTo(previous.x,previous.y); context.lineTo(point.x,point.y);
   context.strokeStyle=`rgba(176,119,255,${taper*.18})`;
   context.lineWidth=2+14*taper; context.stroke();
   context.strokeStyle=`rgba(206,167,255,${taper*.5})`;
   context.lineWidth=.3+5*taper; context.stroke();
   context.strokeStyle=`rgba(245,250,204,${taper*.8})`;
   context.lineWidth=.2+1.6*taper; context.stroke();
  }
  for(const spark of sparks) {
   const age=(now-spark.time)/1000;
   const fade=1-(now-spark.time)/spark.life;
   const x=spark.x+spark.vx*age, y=spark.y+spark.vy*age+8*age*age;
   glow(x,y,spark.size*3,fade*.45);
   context.fillStyle=`rgba(229,244,168,${fade*.8})`;
   context.beginPath(); context.arc(x,y,spark.size*fade,0,Math.PI*2); context.fill();
  }
  const headFade=Math.max(0,1-(now-head.time)/380);
  if(headFade>0) {
   glow(head.x,head.y,17,headFade*.65);
   context.fillStyle=`rgba(255,255,231,${headFade})`;
   context.beginPath(); context.arc(head.x,head.y,2.5*headFade,0,Math.PI*2); context.fill();
  }
  context.restore();
  canvas.style.opacity='1';
  frame=points.length || sparks.length ? requestAnimationFrame(paint) : 0;
  if(!frame) hide();
 }

 function move(x:number,y:number) {
  if(!context) return;
  const now=performance.now();
  const previous=pointer;
  pointer={x,y,time:now};
  if(!previous) return;
  const dx=x-previous.x, dy=y-previous.y, distance=Math.hypot(dx,dy);
  if(distance>180 || now-previous.time>200) {
   hide(); pointer={x,y,time:now}; return;
  }
  if(distance<1) return;
  const ux=dx/distance, uy=dy/distance;
  target={x:x-ux*19,y:y-uy*19,time:now};
  if(!head) {head={x:previous.x,y:previous.y,time:now};lastFrame=now;}
  if(!frame) frame=requestAnimationFrame(paint);
 }
 return {move,hide};
}
