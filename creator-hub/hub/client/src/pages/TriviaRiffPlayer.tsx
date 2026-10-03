import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import DailyTrivia, {TriviaProvider} from '../components/DailyTrivia';
import {createPlaytestRequest} from '../components/rewardPlaytest';
import {RITUAL_ART, readTriviaRiff, type TriviaRiff} from '../triviaRiff/model';
import './TriviaRiff.css';

type Preview = {riff: TriviaRiff; questionIndex: number; fullRewardPath: boolean};
function RitualRound({preview, onRestart}: {preview: Preview; onRestart: () => void}) {
  const {riff, questionIndex, fullRewardPath} = preview;
  const request = useMemo(() => createPlaytestRequest(0, Date.now, 20, {question: riff.questions[questionIndex], randomSpins: !fullRewardPath}), []);
  const artwork = RITUAL_ART[riff.artwork];
  return <TriviaProvider requestGame={request}>
    <DailyTrivia presentation={{title: riff.title, subtitle: riff.subtitle, leftArt: artwork.left, rightArt: artwork.right}} onRestart={onRestart}/>
  </TriviaProvider>;
}
export default function TriviaRiffPlayer() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [run, setRun] = useState(0);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'trivia-riff-config') return;
      const riff = readTriviaRiff(event.data.riff);
      if (!riff) return;
      const index = event.data.questionIndex;
      const next = {riff, questionIndex: Number.isInteger(index) && index >= 0 && index < riff.questions.length ? index : 0, fullRewardPath: event.data.fullRewardPath === true};
      setPreview(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
    };
    window.addEventListener('message', receive);
    parent.postMessage({type: 'trivia-riff-ready'}, location.origin);
    const observer = new ResizeObserver(() => parent.postMessage({type: 'trivia-riff-size', height: root.current?.getBoundingClientRect().height}, location.origin));
    if (root.current) observer.observe(root.current);
    return () => {window.removeEventListener('message', receive); observer.disconnect();};
  }, []);
  return <main ref={root} className="season-shell ritual-riff-player" style={{'--riff-accent': preview?.riff.accent || '#d5ef4b'} as CSSProperties}>
    {preview ? <>
      <div className="riff-practice-note">Practice only · no real rewards</div>
      <RitualRound key={JSON.stringify(preview) + run} preview={preview} onRestart={() => setRun(value => value + 1)}/>
      {preview.riff.questions.length > 1 && <button className="btn riff-next-question" onClick={() => setPreview({...preview, questionIndex: (preview.questionIndex + 1) % preview.riff.questions.length})}>Next question ({preview.questionIndex + 1} / {preview.riff.questions.length}) →</button>}
    </> : <p role="status">Open this Riff from its editor.</p>}
  </main>;
}
