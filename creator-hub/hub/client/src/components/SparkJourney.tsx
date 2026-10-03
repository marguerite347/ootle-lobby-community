import {useEffect, useRef, useState} from 'react';
import './SparkJourney.css';

/** One entrance per mount. A deliberate hover/focus can replay the finite sequence. */
export function useRewardEntrance<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [run, setRun] = useState(0);
  const seen = useRef(false);
  const replay = () => { seen.current = true; setRun(value => value + 1); };
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (!seen.current && entries.some(entry => entry.isIntersecting)) {
        seen.current = true;
        setRun(value => value + 1);
        observer.disconnect();
      }
    }, {threshold: 0.5});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return {ref, run, replay};
}

export default function SparkJourney() {
  const {ref, run, replay} = useRewardEntrance<HTMLOListElement>();
  return <ol ref={ref} className="spark-journey" aria-label="Your reward journey" tabIndex={0}
    onMouseEnter={replay} onFocus={replay}>
    <li key={`answer-${run}`} data-animate={run > 0}><span className="journey-badge" aria-hidden="true">✓</span><div><strong className="journey-answer-label">Answer 1 Q</strong></div></li>
    <li key={`bank-${run}`} data-animate={run > 0}><span className="journey-badge" aria-hidden="true">✦</span><div><strong>Bank your W</strong></div></li>
    <li key={`spin-${run}`} data-animate={run > 0}><span className="journey-badge" aria-hidden="true">×</span><div><strong>Spin for Boost</strong></div></li>
  </ol>;
}
