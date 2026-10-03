import * as THREE from 'three';

// The authored Envato animation remains the motion source. Sample its actual
// frames for lighting rather than running an unrelated procedural orbit.
export function createSpiralOrbit(scene, reduced, transparentStage = false, layered = false) {
  const video = document.createElement('video');
  video.src = new URL('./spiral.mp4',import.meta.url).href;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.ShaderMaterial({
    transparent: true, premultipliedAlpha: transparentStage, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { orbitSide: {value: layered ? -1 : 0}, map: {value: texture}, strength: {value: 1}, tailFade: {value: 1}, transparentStage: {value: transparentStage ? 1 : 0} },
    vertexShader: 'varying vec2 vUv; varying float worldZ; void main(){vUv=uv;worldZ=(modelMatrix*vec4(position,1.)).z;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform sampler2D map; uniform float strength; uniform float tailFade; uniform float transparentStage; varying vec2 vUv; varying float worldZ; uniform float orbitSide;
      void main(){if(orbitSide<0.0 && worldZ>=0.0)discard;if(orbitSide>0.0 && worldZ<0.0)discard;vec3 source=texture2D(map,vUv).rgb; float light=max(source.r,source.g);
      vec3 tint=mix(vec3(.58,.22,1.),vec3(.78,1.,.08),smoothstep(.25,.75,vUv.x));
      float edge=smoothstep(0.,.18,vUv.x)*smoothstep(0.,.18,1.-vUv.x)*smoothstep(0.,.18,vUv.y)*smoothstep(0.,.18,1.-vUv.y);
      gl_FragColor=vec4(mix(tint,vec3(1.),pow(light,3.)*.4)*light*strength*edge*tailFade,mix(1.,clamp(light*strength*edge*tailFade,0.,1.),transparentStage));}`
  });
  // Source spiral is centered at (0.5, 0.40) in texture UVs and expands
  // from almost zero radius. Reserve a physical hole around the whole gem.
  function orbitPosition(u,v,target=new THREE.Vector3()) {
    const x=(u-.5)*16/9, y=v-.40;
    const radius=Math.hypot(x,y);
    const distance=1.12+Math.min(radius,.85)*1.25;
    return target.set(x/Math.max(radius,.0001)*distance,y/Math.max(radius,.0001)*distance,0);
  }
  const geometry=new THREE.PlaneGeometry(1,1,160,90);
  const positions=geometry.attributes.position,uvs=geometry.attributes.uv;
  for(let i=0;i<positions.count;i++){
    const point=orbitPosition(uvs.getX(i),uvs.getY(i));
    positions.setXYZ(i,point.x,point.y,point.z);
  }
  geometry.computeBoundingSphere();
  const plane = new THREE.Mesh(geometry,material);
  plane.position.y = 0;
  plane.rotation.set(-1.15,0,-.20);
  plane.visible = false; // Never expose an uninitialized video texture.
  scene.add(plane);
  let front;
  if(layered){
    plane.renderOrder=0;
    material.stencilWrite=true;material.stencilRef=1;material.stencilFunc=THREE.NotEqualStencilFunc;
    const frontMaterial=material.clone();frontMaterial.stencilWrite=false;
    frontMaterial.uniforms={...material.uniforms,orbitSide:{value:1}};
    front=new THREE.Mesh(geometry,frontMaterial);front.rotation.copy(plane.rotation);front.position.copy(plane.position);front.renderOrder=4;front.visible=false;scene.add(front);
  }
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=36;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  const lights=Array.from({length:8},(_,i)=>{
    const light=new THREE.PointLight(i%4<2?0x9955ff:0xc9eb00,0,5,2);
    scene.add(light);return light;
  });
  let enabled=true,lastFrame=-1;
  video.addEventListener('loadeddata',()=>{if(reduced)video.currentTime=2;else video.play().catch(()=>{});});
  video.addEventListener('error',()=>{if(document.querySelector('#status'))document.querySelector('#status').textContent='Spiral media missing. Restore the licensed asset.';});
  function smoothFade(value) {
    const t=THREE.MathUtils.clamp(value,0,1);
    return t*t*(3-2*t);
  }
  function tailEnvelope() {
    return 1-smoothFade((video.currentTime-2.55)/1.25);
  }
  function sampleLights(energy) {
    if(video.readyState<2)return;
    context.drawImage(video,0,0,64,36);
    const pixels=context.getImageData(0,0,64,36).data;
    const bins=Array.from({length:8},()=>({weight:0,x:0,y:0}));
    for(let y=0;y<36;y++)for(let x=0;x<64;x++){
      const brightness=Math.max(pixels[(y*64+x)*4],pixels[(y*64+x)*4+1])/255;
      const u=x/64,v=1-y/36;
      const edge=smoothFade(u/.18)*smoothFade((1-u)/.18)
        *smoothFade(v/.18)*smoothFade((1-v)/.18);
      const weight=brightness*brightness*edge*tailEnvelope();
      const bin=bins[Math.floor(y/18)*4+Math.floor(x/16)];
      const point=orbitPosition(x/64,1-y/36);
      bin.weight+=weight;bin.x+=point.x*weight;bin.y+=point.y*weight;
    }
    plane.updateMatrixWorld();
    bins.forEach((bin,i)=>{
      const light=lights[i];light.intensity=enabled?Math.min(4,bin.weight*.14)*(1+energy):0;
      if(bin.weight<.001)return;
      light.position.set(bin.x/bin.weight,bin.y/bin.weight,.20);
      plane.localToWorld(light.position);
    });
  }
  return {
    video,
    setLighting(value){enabled=value;sampleLights(0);},
    dispose(){video.pause();video.removeAttribute('src');video.load();texture.dispose();},
    update(energy,paused,width=innerWidth){
      const decoded = video.readyState >= 2 && !video.seeking;
      plane.visible = decoded;
      if(front)front.visible = decoded;
      if(paused&&!video.paused)video.pause();
      if(!paused&&video.paused&&video.readyState>=2)video.play().catch(()=>{});
      plane.scale.setScalar(width<600?.82:1);
      if(front)front.scale.copy(plane.scale);
      video.playbackRate=1+energy*.4;
      material.uniforms.strength.value=1+energy*.5;
      material.uniforms.tailFade.value=tailEnvelope();
      const frame=Math.floor(video.currentTime*30);
      if(frame!==lastFrame||energy>0){sampleLights(energy);lastFrame=frame;}
    }
  };
}
