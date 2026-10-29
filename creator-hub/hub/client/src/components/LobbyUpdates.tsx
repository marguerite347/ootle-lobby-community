import {useState} from 'react';
import SubscribeForm from './SubscribeForm';
import GameNightBanner from './GameNightBanner';
import './LobbyUpdates.css';

export default function LobbyUpdates() {
  const [open,setOpen] = useState(false);
  return <div className="lobby-updates">
    <details className="lobby-newsletter" onToggle={event=>setOpen(event.currentTarget.open)}>
      <summary><span><strong>A little Tari in your inbox.</strong><span>Launch news, new builds and community highlights.</span></span><span className="newsletter-toggle">{open?'Close signup':'Newsletter signup'} <span aria-hidden="true">{open?'−':'+'}</span></span></summary>
      {open && <div className="lobby-newsletter-form"><SubscribeForm/></div>}
    </details>
    <GameNightBanner/>
  </div>;
}
