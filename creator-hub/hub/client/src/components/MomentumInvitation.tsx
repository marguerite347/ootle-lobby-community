import {Link} from 'react-router-dom';
import './MomentumInvitation.css';

export default function MomentumInvitation() {
  return <div className="momentum-invitation">
    <div className="momentum-art" aria-hidden="true">
      <div className="momentum-ripple"/><div className="momentum-ripple ripple-two"/><div className="momentum-ripple ripple-three"/>
      <svg className="momentum-connections" viewBox="0 0 400 280"><path d="M90 75Q210 60 205 145T320 205" fill="none" stroke="#b79af1" strokeWidth="1.5" strokeDasharray="4 8"/></svg>
      <div className="momentum-seed"><svg viewBox="0 0 100 100"><path d="m50 12 34 20v39L50 91 16 71V32Z M16 32l34 20 34-20M50 52v39" fill="#322343" stroke="#dcf871" strokeWidth="2"/><path d="m50 12 34 20-34 20-34-20Z" fill="#dcf871"/></svg></div>
      <div className="momentum-satellite momentum-comment"><span>↗</span><small>A conversation</small></div>
      <div className="momentum-satellite momentum-remix"><span>⤨</span><small>A new direction</small></div>
      <span className="momentum-art-label">ONE CREATION. A RIPPLE EFFECT.</span>
    </div>
    <div className="momentum-copy"><span className="momentum-eyebrow">BE THE SPARK</span><h3>Help this lobby<br/><em>grow.</em></h3><p>Play, comment, or riff on something published.</p><div className="momentum-steps"><span>01 · Discover</span><span>02 · Connect</span><span>03 · Riff</span></div><Link className="btn primary" to="/projects?view=published">Find a creation to spark ↗</Link><p className="momentum-note">Nothing trending yet. New releases are already in Published; this board fills as community activity grows.</p></div>
  </div>;
}
