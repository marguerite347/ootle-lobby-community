import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import SubscribeForm from './SubscribeForm';
import './LobbyUpdates.css';

export default function LobbyUpdates() {
  const {hash} = useLocation();
  const [open,setOpen] = useState(hash==='#newsletter');
  useEffect(()=>{if (hash==='#newsletter') setOpen(true);},[hash]);
  return <details id="newsletter" className="lobby-newsletter" open={open} onToggle={event=>setOpen(event.currentTarget.open)}>
      <summary><span className="newsletter-toggle">{open?'Close signup':'Send me the good stuff'}</span></summary>
      {open && <div className="lobby-newsletter-form"><SubscribeForm showIntro={false}/></div>}
    </details>;
}
