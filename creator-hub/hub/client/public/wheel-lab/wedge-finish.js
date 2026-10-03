// The actual Spline faces and bevels own the finish. No projected overlay disc.
export function createWedgeFinish(panels, bevels, updateSuperFinish) {
  const colors=['#c9eb00','#a6ffd2','#59f5ff','#ff3cba','#f3a9ff','#f5ffd8'];
  let lastPaint=-Infinity,lastState='';
  function paint(now, superActive, reduced, enabled) {
    const state=`${superActive}:${reduced}:${enabled}`;
    if(state===lastState && (reduced || !enabled || now-lastPaint<42))return;
    lastState=state;lastPaint=now;
    const phase=reduced?0:now/4000;
    for(const material of panels){
      material.iridescence=enabled ? 0.8 : 0;
      material.iridescenceIOR=1.3;
      material.iridescenceThicknessRange=[120,enabled?400+Math.sin(phase)*80:400];
    }
    bevels.forEach((material,index)=>{
      const position=((phase+index/bevels.length*colors.length)%colors.length+colors.length)%colors.length;
      material.color.set(enabled?colors[Math.floor(position)]:'#563487');
      if(enabled){
        const next=material.color.clone().set(colors[(Math.floor(position)+1)%colors.length]);
        material.color.lerp(next,position%1);
      }
      material.emissive.copy(material.color);
      material.emissiveIntensity=enabled ? 0.55 : 0;
    });
    updateSuperFinish(now,superActive,reduced,enabled);
  }
  return {paint};
}
