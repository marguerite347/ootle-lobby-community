import {useState} from 'react';
import CreatorEffects from '../components/CreatorEffects';
import {Link} from 'react-router-dom';
import {CreatorPath, GameReveal, QuestProgress, SuccessNotice} from '../components/GameKit';
import CreatorLeaderboard from '../components/CreatorLeaderboard';
export default function GameKit() {
  const [preview, setPreview] = useState(0);
  return <div className="game-kit-page">
    <header className="hero"><span className="release-label">CREATOR TOOLKIT / INTERACTIVE EXAMPLES</span><h1>Make every move<br/><span className="grad">hit different.</span></h1><p className="lede">Reusable presentation pieces from this hub. Try the interactions, then bring them into your own React project. These examples never create rewards or change your project.</p><Link className="btn" to="/create">Back to creating →</Link></header>
    <CreatorEffects/>
    <CreatorPath current={1}/>
    <div className="game-kit-grid">
      <GameReveal className="game-kit-sample"><span className="badge">MOTION / ENTRANCE</span><h2>Make an entrance.</h2><p>This panel enters once as it comes into view. Keyboard navigation stays native. Reduced-motion preferences disable movement.</p><code>GameReveal</code><p>Wrap a section, not every tile in a large collection.</p></GameReveal>
      <section className="game-kit-sample"><span className="badge">CONFIRMED SUCCESS</span><h2>A small victory.</h2><p>Show this after a save or submission succeeds. Sound is off. The effect ends in under a second.</p><button className="btn primary" onClick={() => setPreview(value => value + 1)}>Preview success effect</button>{preview > 0 && <SuccessNotice key={preview}>Preview only. Nothing was saved or awarded.</SuccessNotice>}</section>
      <section className="game-kit-sample"><span className="badge">EVENT PROGRESS</span><h2>Build toward something.</h2><QuestProgress value={2} target={5} label="Example contributions"/><p>Illustrative data: 2 of 5. In the app, this meter uses verified contributions from the challenge API. Submissions and payouts are separate.</p></section>
      <section className="game-kit-sample"><span className="badge">CREATOR STANDINGS</span><h2>An honest starting line.</h2><p>The empty podium invites participation without inventing competitors or scores. Visit Skills for the live board.</p><CreatorLeaderboard creators={[]} listings={[]} loading={false} failed={false} onJoin={() => window.location.assign('/skills')}/></section>
    </div>
    <section className="section"><h2>Use the kit in your project</h2><ol><li>Use React 18 or 19 and install <code>motion@13.4.1</code>.</li><li>Copy <code>client/src/components/GameKit.tsx</code> and <code>GameKit.css</code> from the Ootle Lobby repository. Keep both files together.</li><li>Provide theme variables: <code>--border</code>, <code>--muted</code>, <code>--text</code> and <code>--bg-elev</code>. Game accents have defaults.</li><li>Import the component you need. Connect progress to validated data and mount SuccessNotice only after confirmed success.</li><li>Test mobile, keyboard navigation and reduced motion before publishing.</li></ol><p>The leaderboard also uses React Router and its companion stylesheet. It is an example integration, not a standalone ranking service.</p><a className="btn" href="https://github.com/marguerite347/ootle-lobby/tree/main/creator-hub/hub/client/src/components">Open component source ↗</a></section>
  </div>;
}
