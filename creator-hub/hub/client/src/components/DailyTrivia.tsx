import {createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject} from 'react';
import {riffFromGame} from '../triviaRiff/model';
import {queueWalletAward} from './walletAward';
import {chargeWallet} from './chargeWallet';
import {Link, useLocation} from 'react-router-dom';
import './DailyTrivia.css';
import {nextTriviaCopy, TRIVIA_COPY} from './triviaCopy';
import SparkReactor from './SparkReactor';
import SparkUnlock from './SparkUnlock';
import PlaytestWheel from './PlaytestWheel';
import SparkJourney, {useRewardEntrance} from './SparkJourney';
import {playtestRequest} from './rewardPlaytest';
import {IDLE_READY_CHROME} from './vaultChargeArt';
import {createSparkAudio} from './sparkAudio';
import {
  ANSWER_SELECTION_HOLD_MS, decorativeMotionAllowed, formatPathPercent,
  reactorMood, revealTier, shouldPlayCue, type RevealTier, type SparkCue, type SuperSpinRow,
} from './sparkPresentation';

type Round = {
  id: string;
  deadline: number;
  question?: string;
  options?: {id: string; text: string}[];
  explanation?: string;
  correctAnswer?: string;
  reason?: string;
  base?: number;
  total?: number;
  spinIndex?: number | null;
  superFactor?: number | null;
  superDeclined?: boolean;
  effectiveMultiplier?: number | null;
};
export type Game = {
  balance: number;
  day: number;
  serverNow: number;
  resetAt: number;
  phase: 'ready' | 'playing' | 'won' | 'lost' | 'complete' | 'super';
  round: Round | null;
  multipliers: number[];
  superSpins?: SuperSpinRow[];
  maxPathPercent?: number;
  canReset?: boolean;
};
export type TriviaPresentation = {title: string; subtitle: string; leftArt: string; rightArt: string};
type TriviaContext = {
  game: Game | null;
  error: string;
  busy: boolean;
  clockOffset: number;
  displayBalance: number | null;
  rewardAward: {from: number; to: number} | null;
  play: (action: string, input?: object) => Promise<Game | null>;
  reload: () => void;
  revealBalance: () => void;
};
type Celebration = {amount: number; tier: RevealTier};
const Trivia = createContext<TriviaContext | null>(null);

function motionAllowed() {
  return decorativeMotionAllowed(
    document.documentElement.dataset.hubEffects === 'off',
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
}

export function TriviaProvider({children, requestGame = playtestRequest}: {children: ReactNode; requestGame?: typeof playtestRequest}) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [clockOffset, setOffset] = useState(0);
  const [displayBalance, setDisplayBalance] = useState<number | null>(null);
  const [rewardAward, setRewardAward] = useState<{from: number; to: number} | null>(null);
  const pendingAward = useRef<{from: number; to: number} | null>(null);
  const lock = useRef(false);
  const balanceTimer = useRef<ReturnType<typeof setTimeout>>();
  const serverBalance = useRef<number | null>(null);

  function revealBalance() {
    clearTimeout(balanceTimer.current);
    if (serverBalance.current != null) setDisplayBalance(serverBalance.current);
    if (pendingAward.current) {setRewardAward(pendingAward.current); pendingAward.current = null;}
  }

  async function play(action = '', input?: object) {
    if (lock.current) return null;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const submittedAt = Date.now();
      const next = await requestGame(action, input);
      const receivedAt = Date.now();
      // Submit immediately; hold only presentation so the press remains visible.
      if (action === 'answer') {
        await new Promise(resolve => setTimeout(resolve, Math.max(0, ANSWER_SELECTION_HOLD_MS - (receivedAt - submittedAt))));
      }
      setGame(next);
      const prior = serverBalance.current;
      if (['answer','spin','super'].includes(action) && prior !== null && next.balance > prior) pendingAward.current = queueWalletAward(pendingAward.current, prior, next.balance);
      serverBalance.current = next.balance;
      setOffset(next.serverNow - receivedAt);
      clearTimeout(balanceTimer.current);
      const delay = action === 'spin' || action === 'super' ? 6600 : action === 'answer' && next.phase === 'won' ? 10000 : 0;
      if (delay > 0) balanceTimer.current = setTimeout(revealBalance, delay);
      else revealBalance();
      return next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Please try again.');
      return null;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    void play();
    const refresh = () => {
      if (document.visibilityState === 'visible') void play();
    };
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearTimeout(balanceTimer.current);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    if (!game) return;
    const timer = setTimeout(() => void play(), Math.max(1000, game.resetAt - (Date.now() + clockOffset) + 100));
    return () => clearTimeout(timer);
  }, [game?.day, clockOffset]);

  return <Trivia.Provider value={{game, error, busy, clockOffset, displayBalance, rewardAward, play, reload: () => void play(), revealBalance}}>{children}</Trivia.Provider>;
}

function useTrivia() {
  const context = useContext(Trivia);
  if (!context) throw new Error('TriviaProvider missing');
  return context;
}

export function SparkBalance() {
  const {pathname} = useLocation();
  const {displayBalance, rewardAward, game} = useTrivia();
  const [energy, setEnergy] = useState(0);
  const energyRef = useRef(0);
  const wallet = useRef<HTMLAnchorElement>(null);
  const [shown, setShown] = useState<number | null>(null);
  const lastAward = useRef<typeof rewardAward>(null);
  useEffect(() => {
    if (rewardAward && rewardAward !== lastAward.current && wallet.current && rewardAward.to === displayBalance) {
      lastAward.current = rewardAward;
      energyRef.current = Math.min(3, energyRef.current + 1);
      const nextEnergy=energyRef.current;
      return chargeWallet(wallet.current, rewardAward.from, rewardAward.to, setShown, () => setEnergy(nextEnergy));
    }
    setShown(displayBalance);
    setEnergy(energyRef.current);
  }, [displayBalance, rewardAward, pathname]);
  useEffect(() => {
    if (game?.phase === 'ready' || game?.phase === 'lost') {energyRef.current = 0; setEnergy(0);}
    if (game?.phase !== 'complete') return;
    const timer = setTimeout(() => {energyRef.current = 0; setEnergy(0);}, 10000);
    return () => clearTimeout(timer);
  }, [game?.phase, rewardAward]);
  const anticipating = displayBalance !== null && game && game.balance > displayBalance && ['super','complete'].includes(game.phase);
  const label = shown !== null ? shown.toLocaleString() : '—';
  return <Link ref={wallet} to="/#daily-spark" className={`spark-balance${anticipating ? ' is-charging' : ''}`} data-energy={energy} title="Free Hub points · no cash value · preview browser identity">
    <span aria-hidden="true">✦</span>
    <strong>{label}</strong>
    <span>AI Sparks<small>Daily Ritual</small></span>
  </Link>;
}

export default function DailyTrivia({presentation, onRestart, sectionId = 'daily-spark'}: {presentation?: TriviaPresentation; onRestart?: () => void; sectionId?: string} = {}) {
  const {game, error, busy, play, reload, clockOffset, revealBalance} = useTrivia();
  const [now, setNow] = useState(Date.now());
  const [away, setAway] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [finaleCopy, setFinaleCopy] = useState<string>(TRIVIA_COPY.finale[0]);
  useLayoutEffect(() => {
    if (game?.phase !== 'complete' || !game.round?.id) return;
    try { setFinaleCopy(nextTriviaCopy('finale', game.round.id, window.localStorage)); }
    catch { setFinaleCopy(TRIVIA_COPY.finale[0]); }
  }, [game?.phase, game?.round?.id]);
  const [answerCopy, setAnswerCopy] = useState<string>(TRIVIA_COPY.win[0]);
  const [playtestEnding, setPlaytestEnding] = useState<'playing' | 'settling' | 'message' | 'rest'>('playing');
  useEffect(() => {
    if (game?.phase === 'lost' && playtestEnding === 'playing') setPlaytestEnding('message');
    if (playtestEnding !== 'settling' && playtestEnding !== 'message') return;
    const timer = setTimeout(() => setPlaytestEnding(playtestEnding === 'settling' ? 'message' : 'rest'), playtestEnding === 'settling' ? 4500 : 6000);
    return () => clearTimeout(timer);
  }, [game?.phase, playtestEnding]);

  useLayoutEffect(() => {
    if (!game?.round?.id || !['won', 'lost'].includes(game.phase)) return;
    const outcome = game.phase === 'won' ? 'win' : 'miss';
    try { setAnswerCopy(nextTriviaCopy(outcome, game.round.id, window.localStorage)); }
    catch { setAnswerCopy(TRIVIA_COPY[outcome][0]); }
  }, [game?.round?.id, game?.phase]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const audio = useRef<ReturnType<typeof createSparkAudio> | null>(null);
  const soundOn = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    const onVisibility = () => {
      const hidden = document.hidden;
      setAway(hidden);
      audio.current?.setAudible(!hidden && soundOn.current);
    };
    const onPayout = (event: Event) => {
      const gain = (event as CustomEvent<number>).detail;
      if (Number.isFinite(gain) && gain > 0) cue(gain >= 1500 ? 'jackpot' : gain > 150 ? 'bigPayout' : 'payout');
    };
    window.addEventListener('ootle-wallet-payout', onPayout);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener('ootle-wallet-payout', onPayout);
      document.removeEventListener('visibilitychange', onVisibility);
      audio.current?.dispose();
    };
  }, []);

  const remaining = Math.min(20, Math.max(0, Math.ceil(((game?.round?.deadline || 0) - now - clockOffset) / 1000)));
  const reset = Math.max(0, Math.ceil(((game?.resetAt || 0) - now - clockOffset) / 1000));
  const hours = Math.floor(reset / 3600);
  const minutes = Math.floor((reset % 3600) / 60);
  const expired = game?.phase === 'playing' && remaining === 0 && chosenId === null;
  const refreshedExpiry = useRef<string | null>(null);
  useEffect(() => {
    const roundId = game?.round?.id;
    if (!expired || busy || !roundId || refreshedExpiry.current === roundId) return;
    // The simulator settles expiry on a read. Refresh once, never submit an answer.
    refreshedExpiry.current = roundId;
    reload();
  }, [expired, busy, game?.round?.id, reload]);
  const revealing = celebration !== null;
  const mood = reactorMood(game?.phase, revealing, expired);

  function cue(kind: SparkCue) {
    if (!shouldPlayCue(soundOn.current, document.hidden)) return;
    audio.current?.play(kind);
  }

  function enableSound() {
    // Audio review is paused; keep cues available for the licensed sound pass.
    const audioReviewEnabled = false;
    if (!audioReviewEnabled) return;
    try {
      audio.current ??= createSparkAudio();
      void audio.current.enable().catch(() => { soundOn.current = false; });
      soundOn.current = true;
    } catch {
      audio.current?.dispose();
      audio.current = null;
      soundOn.current = false;
    }
  }

  useEffect(() => {
    if (game?.phase !== 'playing' || remaining <= 0 || remaining > 5) return;
    cue('tick');
  }, [remaining, game?.phase]);

  useEffect(() => {
    if (game?.phase === 'playing') headingRef.current?.focus({preventScroll: true});
  }, [game?.phase]);

  async function start() {
    enableSound();
    cue('start');
    await play('start');
  }

  async function answer(optionId: string) {
    enableSound();
    if (busy || chosenId !== null) return;
    setChosenId(optionId);
    cue('select');
    const result = await play('answer', {roundId: game?.round?.id, optionId});
    setChosenId(null);
    if (result?.phase === 'won') {
      const amount = result.round?.base || 0;
      setCelebration({amount, tier: revealTier('base', amount)});
    }
    else if (result?.phase === 'lost') {
      cue('miss');
    }
  }

  const tier = celebration?.tier ?? null;
  const answered = game != null && game.phase !== 'ready' && game.phase !== 'playing';
  const sectionClass = [
    'daily-spark',
    'spark-showcase',
    'is-ready-invitation',
    answered ? 'is-answered' : '',
    revealing ? 'is-winning' : '',
    tier === 'top' && motionAllowed() ? 'is-impact' : '',
    game?.phase === 'playing' && remaining <= 5 ? 'is-urgent' : '',
    away ? 'is-away' : '',
  ].filter(Boolean).join(' ');

  return <section className={sectionClass} id={sectionId} data-reveal={tier ?? undefined} aria-labelledby="daily-spark-title">
    <div className="spark-atmosphere" aria-hidden="true"><i /><i /><i /><span>✦</span></div>
    <SparkIntro hours={hours} minutes={minutes} game={game} presentation={presentation} />
    <div className="spark-game">
      <div className="spark-game-top">
        <span>YOUR DAILY PLAY</span>
      </div>
      {!game && !error && <p role="status">Opening today’s vault…</p>}
      {(game?.phase === 'ready' || playtestEnding === 'rest') && game && <SparkReady presentation={presentation} locked={playtestEnding === 'rest'} busy={busy} game={game} onStart={start} />}
      {game?.phase === 'playing' && !expired && <SparkQuestion
        game={game}
        remaining={remaining}
        busy={busy}
        chosenId={chosenId}
        headingRef={headingRef}
        onAnswer={answer}
      />}
      {game && ['playing', 'settling'].includes(playtestEnding) && ['won', 'super', 'complete'].includes(game.phase) && <PlaytestWheel warming={celebration !== null} game={game} onCue={cue} play={(action, input) => {enableSound(); return play(action, input);}} onSettled={() => {revealBalance(); if (game.phase === 'complete') setPlaytestEnding('settling');}} />}
      {playtestEnding === 'message' && game && <div className="spark-finished" data-win={game.phase !== 'lost' || undefined} role="status">
        {game.phase !== 'lost' && <div className="reward-rays" aria-hidden="true" />}
        <SparkReactor mood={mood} />
        <h2 className="reward-type">{game.phase === 'lost' ? answerCopy : finaleCopy}</h2>
        {game.phase === 'lost' ? <><p>No AI Sparks this round.</p><strong>{game.round?.correctAnswer}</strong></> : <><strong className="reward-type">{(game.round?.total || 0).toLocaleString()}</strong><p>AI Sparks banked. Go create.</p></>}
      </div>}
      {error && <div className="spark-error" role="alert"><p>{error}</p><button type="button" className="btn" disabled={busy} onClick={reload}>Check my round</button></div>}
      {celebration && game && <SparkUnlock inline amount={celebration.amount} balance={game.balance} headline={answerCopy} onReveal={() => {revealBalance(); cue('win');}} onContinue={() => setCelebration(null)} />}
    </div>
    {playtestEnding === 'rest' && game?.round?.explanation && <div className="spark-creator-takeaway"><strong>Creator takeaway</strong><p>{game.round.explanation}</p></div>}
    {(game?.phase === 'ready' || playtestEnding === 'rest') && <SparkJourney />}
    {!presentation && <div className="spark-build-notes"><Link className="spark-riff-link" to="/create/trivia" state={{triviaSeed: riffFromGame(game)}}>Riff this Game</Link></div>}
    <div className="reward-playtest-bar"><button type="button" className="spark-test-again" title="Playtest: simulated AI Sparks. No daily attempt used." aria-description="Restarts the playtest with simulated AI Sparks; no daily attempt is used." onClick={onRestart || (() => window.location.reload())}>{presentation ? 'Play again ↻' : 'Test again ↻'}</button></div>
  </section>;
}

function SparkIntro({hours, minutes, game, presentation}: {hours: number; minutes: number; game: Game | null; presentation?: TriviaPresentation}) {
  const superOdds = game?.superSpins?.length ? game.superSpins : [
    {effective: 5, percent: 60}, {effective: 10, percent: 25},
    {effective: 25, percent: 12}, {effective: 50, percent: 3},
  ];
  const maxPath = formatPathPercent(game?.maxPathPercent ?? 0.5);
  return <div className="spark-intro">
    <div className="spark-kicker spark-product-title"><span className="spark-live-dot" /><span className="spark-product-name">{presentation?.title || 'The Daily Ritual'} <small>{presentation?.subtitle || 'One question. A little magic.'}</small></span><span>FREE TO PLAY</span></div>
    <h1 id="daily-spark-title" className="spark-loot-drop"><span>{IDLE_READY_CHROME.heading}</span><br />{' '}<em>{IDLE_READY_CHROME.emphasis}</em></h1>

    {!presentation && <div className="spark-reset spark-drop-timer" aria-label={`Next drop in ${hours} hours and ${minutes} minutes`} title="Resets at 00:00 UTC"><span className="spark-drop-label">Next Drop</span><strong><span>{String(hours).padStart(2, '0')}<small>h</small></span><i aria-hidden="true">:</i><span>{String(minutes).padStart(2, '0')}<small>m</small></span></strong></div>}
    <details className="spark-rules">
      <summary>How to play & rewards</summary>
      <div className="spark-rules-content">
        <ol>
          <li><strong>Answer 1 Q.</strong> Get it right in 20 seconds for <b>100 AI Sparks</b>. Answer within 8 seconds for <b>150</b>.</li>
          <li><strong>Spin for a boost.</strong> Multiply your answer reward by <b>1×–5×</b>. Land 5× to unlock Super Spin.</li>
          <li><strong>Go Super.</strong> Multiply your banked winnings again. <b>1× keeps your haul.</b> Skipping keeps it too.</li>
        </ol>
        <details className="spark-odds">
          <summary>See the odds</summary>
          <p>First spin: 1× and 2× each have a 33.33% chance. 3× and 5× each have a 16.67% chance.</p>
          <p>Super Spin multiplies your banked winnings:</p>
          <ul>{superOdds.map(row => <li key={row.effective}><b>{row.effective / 5}×</b><span>{Number(row.percent.toFixed(2))}%</span></li>)}</ul>
          <p>Top payout across both spins: about {maxPath} of correct-answer rounds. Percentages are rounded.</p>
        </details>
        <p className="spark-rules-note">Practice rounds are replayable. AI Sparks are in-app credits, not TARI or cash. This playtest uses simulated rewards.</p>
      </div>
    </details>
  </div>;
}

function SparkReady({busy, game, onStart, locked = false, presentation}: {busy: boolean; game: Game; onStart: () => void; locked?: boolean; presentation?: TriviaPresentation}) {
  const entrance = useRewardEntrance<HTMLButtonElement>();
  return <div className="spark-ready ritual-ready">
    <div className="ritual-props" aria-hidden="true">
      <span className="ritual-prop ritual-cauldron"><img src={presentation?.leftArt || "/seasonal/october-2026/ritual-cauldron-v2.png"} alt="" width="1254" height="1254" draggable={false}/><i className="ritual-bubble"/><i className="ritual-bubble"/><i className="ritual-bubble"/></span>
      <span className="ritual-prop ritual-spellbook"><img src={presentation?.rightArt || "/seasonal/october-2026/ritual-spellbook-v3.png"} alt="" width="1254" height="1254" draggable={false}/><i className="ritual-sparkle"/><i className="ritual-sparkle"/><i className="ritual-sparkle"/></span>
    </div>
    <button type="button" className="spark-crystal-trigger" aria-label="Reveal trivia with the crystal" disabled={busy || locked} onClick={onStart}>
      <SparkReactor mood="idle" />
    </button>
    {game.balance > 0 && <p className="spark-carry">{locked ? `${game.balance.toLocaleString()} AI Sparks banked.` : `Your ${game.balance.toLocaleString()} AI Sparks carry over. Today adds to that same balance.`}</p>}
    <button type="button" className="btn primary spark-play spark-question-cta" ref={entrance.ref} onMouseEnter={entrance.replay} onFocus={entrance.replay} disabled={busy || locked} onClick={onStart}>
      <span>{locked ? 'Today’s ritual complete' : busy ? 'Opening…' : 'Begin today’s ritual'}</span>
      <span key={entrance.run} className="question-sheen" data-animate={entrance.run > 0} aria-hidden="true" />
    </button>
  </div>;
}

function SparkQuestion({game, remaining, busy, chosenId, headingRef, onAnswer}: {
  game: Game;
  remaining: number;
  busy: boolean;
  chosenId: string | null;
  headingRef: RefObject<HTMLHeadingElement>;
  onAnswer: (optionId: string) => void;
}) {
  const speed = remaining > 12;
  const urgent = remaining <= 5;
  const label = urgent ? 'FINAL SECONDS' : speed ? 'SPEED BONUS ACTIVE' : 'KEEP THE SPARK ALIVE';
  return <div className="spark-question">
    <div className="spark-charge"><SparkReactor mood="live" /></div>
    <div className="spark-timer">
      <span>{label}</span>
      <strong aria-label={`${remaining} seconds remaining`}>{remaining}<small>s</small></strong>
    </div>
    <div className="spark-time-track" aria-hidden="true"><i style={{width: `${remaining / 20 * 100}%`}} /></div>
    <h2 ref={headingRef} tabIndex={-1}>{game.round?.question}</h2>
    <div className={`spark-answers${chosenId ? ' is-locked' : ''}`} role="group" aria-label="Answers">
      {game.round?.options?.map((option, index) => <button
        type="button"
        key={option.id}
        disabled={busy}
        className={chosenId === option.id ? 'is-chosen' : undefined}
        aria-pressed={chosenId === option.id}
        onClick={() => onAnswer(option.id)}
      >
        <span>{'ABCD'[index]}</span>{option.text}<b aria-hidden="true">{chosenId === option.id ? '◆' : ''}</b>
      </button>)}
    </div>
    <p className={`spark-hint${chosenId ? ' spark-lock-status' : ''}`} role="status">{chosenId ? 'LOCKED IN · Checking your answer…' : '100 for a correct answer · 150 within 8 seconds'}</p>
  </div>;
}
