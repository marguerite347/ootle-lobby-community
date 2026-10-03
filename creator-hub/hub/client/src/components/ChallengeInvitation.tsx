import {Link} from 'react-router-dom';

export default function ChallengeInvitation() {
 return <div className="challenge-invitation">
  <div className="invitation-stage" aria-hidden="true">
   <div className="invitation-orbit orbit-back"/><div className="invitation-orbit orbit-front"/>
   <div className="invitation-beam"/>
   <div className="invitation-artifact"><span className="invitation-card-label">YOUR NEXT CREATION</span>
    <svg viewBox="0 0 200 170" fill="none"><path d="m100 18 60 35v68l-60 35-60-35V53z" fill="#281d40" stroke="#c5abff" strokeWidth="2"/><path d="m40 53 60 35 60-35M100 88v68" stroke="#c5abff" strokeWidth="2"/><path d="m88 59 34 20-34 20z" fill="#d5f544"/><path d="m167 18 4 10 10 4-10 4-4 10-4-10-10-4 10-4zM28 105l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#d5f544"/></svg>
    <span className="invitation-card-footer">MAKE IT. SHOW IT.</span>
   </div>
   <span className="invitation-stage-label">THE FIRST SPARK COULD BE YOURS</span>
  </div>
  <div className="invitation-copy"><span className="release-label">NO ENTRIES YET. ALL POSSIBILITY.</span><h3>Your entry could<br/><em>start something.</em></h3><p>A tiny game. A clever Riff. A tool that makes someone’s day. Bring the first creation to this challenge—and give the community something to build on.</p>
   <div className="invitation-steps"><span><b>01</b> Pick the prompt</span><span><b>02</b> Make it work</span><span><b>03</b> Show your build</span></div>
   <div className="invitation-actions"><a className="btn primary" href="#submit">Make the first entry ↗</a><Link to="/create" className="more">Need a starting point? →</Link></div>
   <small>Have a project ready? Submit its saved version and a demo. Entries appear here awaiting review.</small>
  </div>
 </div>;
}
