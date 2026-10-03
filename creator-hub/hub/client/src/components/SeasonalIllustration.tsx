import {useId} from 'react';

type Scene = 'vault' | 'bug' | 'builder';
const ART = {
  vault: {file: 'spooky-vault-scene.png', width: 1536, height: 1024, alt: 'A hooded Tari turtle shining a flashlight at a glowing secret vault'},
  bug: {file: 'ootlejuice-bug.png', width: 1280, height: 1280, alt: 'A violet Ootlejuice bug splashing in luminous green goo'},
  builder: {file: 'witch-builder-scene.png', width: 1536, height: 1024, alt: 'Tari turtle and ghost building with glowing code blocks'},
};
const BLOCK_FACES = ['M556 408 L655 383 L673 511 L561 538Z', 'M652 541 L792 541 L796 676 L654 674Z', 'M608 704 L757 706 L757 840 L608 834Z'];
const VAULT_SEAM = 'M932 415 C972 320 1047 296 1110 330 C1155 355 1179 406 1186 452 M1190 610 C1182 706 1128 788 1040 807 C1003 811 969 789 956 759 M925 498 L927 836 L968 840';
const DROPS = [{x: 1155, y: 533, rx: 66, ry: 64}, {x: 1150, y: 838, rx: 75, ry: 75}, {x: 121, y: 759, rx: 67, ry: 53}];

/** One source-coordinate system keeps local effects registered to the contained artwork. */
export default function SeasonalIllustration({scene, className = ''}: {scene: Scene; className?: string}) {
  const id = useId().replace(/:/g, '');
  const art = ART[scene];
  const source = `/seasonal/october-2026/${art.file}`;
  const picture = <image href={source} width={art.width} height={art.height}/>;
  return <svg className={`season-illustration ${className}`} viewBox={`0 0 ${art.width} ${art.height}`} role="img" aria-label={art.alt}>
    <defs>
      <radialGradient id={`${id}-light`}><stop stopColor="#f3ffac" stopOpacity=".9"/><stop offset="1" stopColor="#deff66" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-beam`}><stop stopColor="#fffbd0" stopOpacity=".8"/><stop offset="1" stopColor="#e8ff94" stopOpacity="0"/></linearGradient>
      <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
      {scene === 'bug' && <>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="1280"><rect width="1280" height="1280" fill="white"/>{DROPS.map((drop, index) => <ellipse key={index} cx={drop.x} cy={drop.y} rx={drop.rx} ry={drop.ry} fill="black"/>)}</mask>
        {DROPS.map((drop, index) => <clipPath key={index} id={`${id}-drop-${index}`}><ellipse cx={drop.x} cy={drop.y} rx={drop.rx} ry={drop.ry}/></clipPath>)}
      </>}
      {scene === 'vault' && <mask id={`${id}-beam-area`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><path d="M829 616 L1015 507 L1045 711 L841 693Z" fill="white" filter={`url(#${id}-soft)`}/></mask>}
      {scene === 'vault' && <mask id={`${id}-door-area`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><path d={VAULT_SEAM} fill="none" stroke="white" strokeWidth="76" filter={`url(#${id}-soft)`}/></mask>}
      {scene === 'builder' && BLOCK_FACES.map((path, index) => <mask key={index} id={`${id}-block-${index}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><path d={path} fill="white" filter={`url(#${id}-soft)`}/></mask>)}
    </defs>
    <g className="scene-base" mask={scene === 'bug' ? `url(#${id}-body)` : undefined}>{picture}</g>
    {scene === 'vault' && <g className="scene-effect scene-beam-light" mask={`url(#${id}-beam-area)`} aria-hidden="true">{picture}</g>}
    {scene === 'vault' && <g className="scene-effect scene-vault-glow" aria-hidden="true">
      <g className="scene-vault-light" mask={`url(#${id}-door-area)`}>{picture}</g>
      <path className="scene-vault-bloom" d={VAULT_SEAM} fill="none" stroke="#dcff81" strokeWidth="28" filter={`url(#${id}-soft)`}/>
    </g>}
    {scene === 'vault' && <g className="scene-effect scene-flashlight" aria-hidden="true">
      <path d="M844 619 L1030 494 L1045 714 L853 679Z" fill={`url(#${id}-beam)`} filter={`url(#${id}-soft)`}/>
      <ellipse cx="846" cy="648" rx="42" ry="55" fill={`url(#${id}-light)`}/>
      <ellipse cx="1029" cy="583" rx="95" ry="146" fill={`url(#${id}-light)`} opacity=".45"/>
    </g>}
    {scene === 'bug' && <g aria-hidden="true">
      {DROPS.map((_, index) => <g key={index} className={`scene-juice-drop scene-juice-drop-${index}`}><g clipPath={`url(#${id}-drop-${index})`}>{picture}</g></g>)}
      <g className="scene-effect scene-juice-ripple"><ellipse cx="409" cy="941" rx="76" ry="15" fill="none" stroke="#efffa7" strokeWidth="5"/><ellipse cx="868" cy="1004" rx="60" ry="12" fill="none" stroke="#efffa7" strokeWidth="4"/></g>
    </g>}
    {scene === 'builder' && <g aria-hidden="true">
      {BLOCK_FACES.map((_, index) => <g key={index} className={`scene-effect scene-block-light scene-block-light-${index}`} mask={`url(#${id}-block-${index})`}>{picture}</g>)}
      {[[634,310],[704,426],[594,569],[621,634],[798,719]].map(([x,y], index) => <g key={index} transform={`translate(${x} ${y})`}><path className={`scene-effect scene-block-glint scene-block-glint-${index}`} d="M0 -20 L5 -5 L18 0 L5 5 L0 20 L-5 5 L-18 0 L-5 -5Z" fill={index % 2 ? '#f6e7ff' : '#efffa3'}/></g>)}
    </g>}
  </svg>;
}
