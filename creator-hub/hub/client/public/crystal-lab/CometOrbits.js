// Adapts three.quarks TrailDemo + FollowObjectDemo. Engine/shaders and textures
// are upstream MIT assets; this adapter only supplies paths, palette and timing.
import * as THREE from 'three';
import {BatchedRenderer,ParticleSystem,ConstantValue,IntervalValue,ConstantColor,Vector4,SphereEmitter,RenderMode,WidthOverLength,PiecewiseBezier,Bezier,ColorOverLife,ColorRange,SizeOverLife} from 'three.quarks';
export function createCometOrbits(scene){
 const batch=new BatchedRenderer();scene.add(batch);
 const loader=new THREE.TextureLoader();
 const soft=loader.load('./vendor/quarks/particle_default.png');
 const streak=loader.load('./vendor/quarks/projectile.png');
 const orbits=[];
 for(const [index,color] of [0xc9b6ff,0xc9eb00].entries()){
  const tint=new THREE.Color(color);
  const material=()=>new THREE.MeshBasicMaterial({map:soft,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const trail=new ParticleSystem({duration:100000,looping:false,startLife:new ConstantValue(100000),startSpeed:new ConstantValue(0),startSize:new ConstantValue(index===0?.095:.055),startColor:new ConstantColor(new Vector4(tint.r,tint.g,tint.b,.8)),worldSpace:true,emissionOverTime:new ConstantValue(0),emissionBursts:[{time:0,count:new ConstantValue(1),cycle:1,interval:.01,probability:1}],shape:new SphereEmitter({radius:0}),material:material(),renderMode:RenderMode.Trail,rendererEmitterSettings:{startLength:new ConstantValue(48),followLocalOrigin:true},startTileIndex:new ConstantValue(0),uTileCount:1,vTileCount:1});
  trail.addBehavior(new WidthOverLength(new PiecewiseBezier([[new Bezier(0,.025,.09,.16),0]])));
  const dust=new ParticleSystem({duration:100000,looping:true,startLife:new IntervalValue(.35,.95),startSpeed:new IntervalValue(.02,.12),startSize:new IntervalValue(.04,.09),startColor:new ConstantColor(new Vector4(tint.r,tint.g,tint.b,.7)),worldSpace:true,emissionOverTime:new ConstantValue(28),emissionBursts:[],shape:new SphereEmitter({radius:.045}),material:material(),renderMode:RenderMode.BillBoard});
  dust.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1,.9,.4,0),0]])));
  dust.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1,1,1,1),new Vector4(1,1,1,0))));
  const head=new THREE.Sprite(new THREE.SpriteMaterial({map:streak,color,blending:THREE.AdditiveBlending,depthWrite:false}));head.scale.setScalar(.22);scene.add(head);
  scene.add(trail.emitter,dust.emitter);batch.addSystem(trail);batch.addSystem(dust);
  orbits.push({trail,dust,head,index});
 }
 let phase=0;
 return {update(delta,energy,paused,beat){
  if(paused)return;
  phase+=delta*(.85+energy*1.6);
  for(const {trail,dust,head,index} of orbits){
   const angle=phase*(index?-.83:1)+index*Math.PI+.18*Math.sin(phase*1.4);
   const flourish=beat>2.4&&beat<4.2?Math.sin((beat-2.4)/1.8*Math.PI)*.4:0;
   const radius=1.65*(1-energy*.13+flourish);
   const position=new THREE.Vector3(Math.cos(angle)*radius,Math.sin(angle)*.65,Math.sin(angle)*1.15);
   position.applyAxisAngle(new THREE.Vector3(0,0,1),index?-.62:.42);
   trail.emitter.position.copy(position);dust.emitter.position.copy(position);head.position.copy(position);
   head.scale.setScalar(.22+energy*.08);
  }
  scene.updateMatrixWorld(true);batch.update(delta);
 }};
}
