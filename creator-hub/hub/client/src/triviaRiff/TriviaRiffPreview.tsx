import {useEffect, useRef, useState} from 'react';
import type {TriviaRiff} from './model';

/** Loads trusted Lobby code; only validated game data crosses this frame boundary. */
export default function TriviaRiffPreview({riff, questionIndex = 0, fullRewardPath = false}: {riff: TriviaRiff; questionIndex?: number; fullRewardPath?: boolean}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1000);
  const current = useRef({riff, questionIndex, fullRewardPath});
  current.current = {riff, questionIndex, fullRewardPath};
  function send() {frame.current?.contentWindow?.postMessage({type: 'trivia-riff-config', ...current.current}, location.origin);}
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === 'trivia-riff-ready') send();
      if (event.data?.type === 'trivia-riff-size' && Number.isFinite(event.data.height)) setHeight(Math.max(300, Math.min(2600, Math.ceil(event.data.height))));
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {const timer = setTimeout(send, 350); return () => clearTimeout(timer);}, [riff, questionIndex, fullRewardPath]);
  return <iframe ref={frame} title="Daily Ritual Riff preview" className="trivia-riff-preview" src="/play/trivia-riff" onLoad={send} style={{height}} />;
}
