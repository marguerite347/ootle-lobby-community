import {Link} from 'react-router-dom';

/** One lobby section, named the same way as the main navigation. */
export default function LobbyTrail({section}: {section: string}) {
  return <nav className="lobby-trail" aria-label="Lobby section">
    <Link to="/">Ootle Lobby</Link>
    <span aria-hidden="true">/</span>
    <strong>{section}</strong>
  </nav>;
}
