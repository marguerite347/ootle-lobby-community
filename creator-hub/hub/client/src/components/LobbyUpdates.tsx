import {useState} from 'react';
import SubscribeForm from './SubscribeForm';
import GameNightBanner from './GameNightBanner';
import './LobbyUpdates.css';

export default function LobbyUpdates() {
  const [open,setOpen] = useState(false);
  return <div className="lobby-updates">
    <details className="lobby-newsletter" onToggle={event=>setOpen(event.currentTarget.open)}>
      <summary><span><strong>Tari, delivered.</strong><span>New projects. Game nights. What’s next.</span></span><span className="newsletter-toggle">{open?'Close signup':'Keep me posted'} <span aria-hidden="true">{open?'−':'+'}</span></span></summary>
      {open && <div className="lobby-newsletter-form"><SubscribeForm showIntro={false}/></div>}
    </details>
    <GameNightBanner/>
  </div>;
}
