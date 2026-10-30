import {useEffect,useRef,useState} from 'react';
import {useLocation} from 'react-router-dom';
import SubscribeForm from './SubscribeForm';
import './LobbyUpdates.css';

export default function LobbyUpdates() {
  const {hash} = useLocation();
  const [open,setOpen] = useState(hash==='#newsletter');
  const container = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  function closeSignup() {
    setOpen(false);
    trigger.current?.focus();
  }
  useEffect(()=>{if (hash==='#newsletter') setOpen(true);},[hash]);
  useEffect(()=>{
    if (!open) return;
    function dismissOutside(event:PointerEvent) {
      if (container.current && !event.composedPath().includes(container.current)) setOpen(false);
    }
    function dismissWithEscape(event:KeyboardEvent) {
      if (event.key==='Escape') {
        event.preventDefault();
        closeSignup();
      }
    }
    document.addEventListener('pointerdown',dismissOutside,true);
    document.addEventListener('keydown',dismissWithEscape);
    return ()=>{
      document.removeEventListener('pointerdown',dismissOutside,true);
      document.removeEventListener('keydown',dismissWithEscape);
    };
  },[open]);
  return <details ref={container} id="newsletter" className="lobby-newsletter" open={open} onToggle={event=>setOpen(event.currentTarget.open)}>
      <summary ref={trigger} aria-controls="newsletter-signup"><span className="newsletter-toggle">{open?'Close signup':'Send me the good stuff'}</span></summary>
      {open && <div id="newsletter-signup" className="lobby-newsletter-form">
        <button type="button" className="newsletter-close" aria-label="Close newsletter signup" title="Close signup" onClick={closeSignup}><span aria-hidden="true">×</span></button>
        <SubscribeForm showIntro={false}/>
      </div>}
    </details>;
}
