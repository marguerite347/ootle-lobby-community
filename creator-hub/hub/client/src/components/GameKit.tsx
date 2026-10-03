import {useEffect, useState, type ReactNode} from 'react';
import {LazyMotion, domAnimation, m, useReducedMotion} from 'motion/react';
import './GameKit.css';

/** Shared presentation primitives. Artwork and project data stay with their owners. */
export function GameReveal({children, className = ''}: {children: ReactNode; className?: string}) {
  const reducedMotion = useReducedMotion();
  return <LazyMotion features={domAnimation} strict>
    <m.div className={className} initial={reducedMotion ? false : {opacity: 0, y: 12}}
      whileInView={{opacity: 1, y: 0}} viewport={{once: true, amount: 0.05}}
      transition={{duration: reducedMotion ? 0 : 0.25}}>{children}</m.div>
  </LazyMotion>;
}

export function QuestProgress({value, target, label}: {value: number; target: number; label: string}) {
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 1;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(value, safeTarget)) : 0;
  return <div className="quest-progress"><div><strong>{label}</strong><span>{safeValue} / {safeTarget}</span></div>
    <progress aria-label={label} value={safeValue} max={safeTarget}/>
  </div>;
}

export function CreatorPath({current = 0}: {current?: number}) {
  const stages = ['Choose a foundation', 'Compose your recipe', 'Add your assets', 'Test & publish'];
  return <ol className="creator-path" aria-label="Creation journey">{stages.map((stage, index) =>
    <li key={stage} aria-current={current === index ? 'step' : undefined}>
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><strong>{stage}</strong>
    </li>)}</ol>;
}

/** Mount only after a successful server response, never when a request starts. */
export function SuccessNotice({children}: {children: ReactNode}) {
  const [celebrating, setCelebrating] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setCelebrating(false), 900);
    return () => clearTimeout(timer);
  }, []);
  return <div className={`game-success ${celebrating ? 'is-celebrating' : ''}`} role="status">
    <span aria-hidden="true" className="game-success-mark">✓</span><div>{children}</div>
  </div>;
}
