import {Link} from 'react-router-dom';
import './Workbench.css';

export default function Workbench() {
  return <section className="workbench-home" aria-labelledby="workbench-title">
    <header><h1 id="workbench-title">Workbench</h1><p>Templates, creator tools, and skills for your next Ootle project.</p></header>
    <div className="workbench-tools">
      <section><h2>Templates</h2><p>Start with Ootle code and guides.</p><Link to="/ootle-templates">Browse Ootle templates</Link><a href="https://github.com/tari-project/wasm-template/tree/main/wasm_templates" target="_blank" rel="noreferrer">Open template source</a></section>
      <section><h2>Creator tools</h2><p>Make something you can play and share.</p><Link to="/create/trivia">Riff the Daily Ritual</Link><Link to="/create/guessing-game">Make a guessing game</Link><Link to="/create/video">Create a video</Link></section>
      <section><h2>Build with your agent</h2><p>Give your tools the right Ootle context.</p><Link to="/skills">Explore skills</Link><Link to="/skills/developer-setup">Set up your tools</Link><a href="/agent-start">Agent quick start</a></section>
    </div>
  </section>;
}
