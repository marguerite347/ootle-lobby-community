import {useEffect, useId, useRef, useState} from 'react';
import {CHAT_GREETING_EVENT} from '../chat/chatSidebarState';

const art = '/seasonal/october-2026';

/** A contained, one-shot vignette. It never travels into the reading column. */
export default function ConcoctionArt() {
  const id = useId().replace(/:/g, '');
  const scene = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState(0);
  const [helloRequest, setHelloRequest] = useState(0);

  useEffect(() => {
    if (!helloRequest) return;
    // The spider reaches the bottom of its 4.8s greeting at 38%.
    const timer = window.setTimeout(() => window.dispatchEvent(new Event(CHAT_GREETING_EVENT)), 1900);
    return () => window.clearTimeout(timer);
  }, [helloRequest]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setGreeting(1);
        observer.disconnect();
      }
    }, {threshold: 0.5});
    if (scene.current) observer.observe(scene.current);
    return () => observer.disconnect();
  }, []);

  return <div className="concoction-art" ref={scene}>
    <svg className="concoction-potion" viewBox="0 0 1254 1254" role="img" aria-label="Tari’s confidential concoction: a glass potion bottle filled with bubbling lime liquid">
      <defs>
        <filter id={`${id}-liquid-soft`}><feGaussianBlur stdDeviation="12"/></filter>
        <mask id={`${id}-liquid`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
          <g fill="white" filter={`url(#${id}-liquid-soft)`}>
            <path d="M300 636 Q609 530 932 662 L982 794 Q655 843 298 672Z"/>
            <path d="M288 913 Q592 1055 924 991 Q820 1190 579 1138 Q384 1122 288 913Z"/>
          </g>
        </mask>
        <radialGradient id={`${id}-bubble`} cx="32%" cy="25%" r="75%">
          <stop stopColor="#ffffec" stopOpacity=".95"/>
          <stop offset=".28" stopColor="#eeff9b" stopOpacity=".45"/>
          <stop offset=".7" stopColor="#b7ed18" stopOpacity=".1"/>
          <stop offset="1" stopColor="#eeff9b" stopOpacity=".75"/>
        </radialGradient>
      </defs>
      <image href={`${art}/confidential-potion.png`} width="1254" height="1254"/>
      <g className="potion-effect potion-liquid-glow" mask={`url(#${id}-liquid)`} aria-hidden="true">
        <image href={`${art}/confidential-potion.png`} width="1254" height="1254"/>
      </g>
      <g aria-hidden="true">
        {[[490,707,23],[620,738,30],[806,729,21],[565,670,17],[761,701,26]].map(([x,y,r], index) => <g key={index} transform={`translate(${x} ${y})`}>
          <circle className={`potion-effect potion-bubble potion-bubble-${index}`} r={r} fill={`url(#${id}-bubble)`} stroke="#f4ffc2" strokeWidth="3"/>
        </g>)}
      </g>
    </svg>
    <div className="autumn-corner">
      <div key={greeting} className={`autumn-scene${greeting ? ' is-greeting' : ''}`} aria-hidden="true">
        <svg className="corner-web" viewBox="0 0 160 160" fill="none">
          <path d="M160 0L0 0M160 0L4 62M160 0L42 118M160 0L98 156M160 0V160M128 0Q129 13 131 12Q133 24 137 24Q148 28 148 32Q151 32 160 32M96 0Q98 24 101 24Q106 47 115 45Q137 57 135 59Q141 66 160 64M56 0Q59 41 64 39Q72 76 86 74Q118 91 121 96Q132 107 160 104M8 0Q13 60 20 57Q29 111 52 108Q99 131 104 143Q122 155 160 152"/>
        </svg>
        <div className="spider-visit"><span className="spider-silk"/><img src={`${art}/friendly-spider.png`} alt="" width="1254" height="1254"/></div>
        <img className="corner-pumpkin" src={`${art}/pumpkin-leaves.png`} alt="" width="1254" height="1254"/>
      </div>
      <button className="spider-greeting" type="button" onClick={() => {setGreeting(count => count + 1); setHelloRequest(count => count + 1);}} aria-label="Replay the spider and pumpkin greeting">Say hello</button>
    </div>
  </div>;
}
