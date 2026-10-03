import {createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject} from 'react';
import {riffFromGame} from '../triviaRiff/model';
import {queueWalletAward} from './walletAward';
import {chargeWallet} from './chargeWallet';
import {Link, useLocation} from 'react-router-dom';
import confetti from 'canvas-confetti';
import './DailyTrivia.css';
import {nextTriviaCopy, TRIVIA_COPY} from './triviaCopy';
import SparkReactor from './SparkReactor';
import SparkUnlock from './SparkUnlock';
import PlaytestWheel from './PlaytestWheel';
import SparkJourney, {useRewardEntrance} from './SparkJourney';
import {isRewardPlaytest, playtestRequest} from './rewardPlaytest';
import {IDLE_READY_CHROME, SETTLED_KEEP_CHROME, VAULT_CHARGE_HERO_SRC, VAULT_DISC_BADGE_SRC, VAULT_DISC_FACE_SRC, VAULT_DISC_POINTER_SRC, VAULT_DISC_RIM_PNG, VAULT_DISC_RIM_SRC, isKeptBaseSettle} from './vaultChargeArt';
import {createSparkAudio} from './sparkAudio';
import {
  ANSWER_SELECTION_HOLD_MS,
  COIN_COUNT,
  COUNT_UP_MS,
  LAND_BEAT_MS,
  REVEAL_HOLD_MS,
  bonusSparks,
  countUpValue,
  celebrationLabel,
  confettiCount,
  decorativeMotionAllowed,
  formatPathPercent,
  landingTier,
  payoutPreview,
  reactorMood,
  replayCredits,
  revealHoldMs,
  revealTier,
  settledRevealTier,
  shouldPlayCue,
  spinDurationMs,
  superIdleRotation,
  superWedgeCenter,
  superWheelGradient,
  superWheelRotation,
  vaultHeading,
  wheelRotationDegrees,
  type CelebrationKind,
  type RevealTier,
  type SparkCue,
  type SuperSpinRow,
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
  cinematic: boolean;
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
type Celebration = {amount: number; kind: CelebrationKind; effective?: number; tier: RevealTier};
type FocusTarget = 'question' | 'spin' | 'result';
type SpinKind = 'stage' | 'super';
type DiscBeat = 'idle' | 'press' | 'wind' | 'travel' | 'land';

const Trivia = createContext<TriviaContext | null>(null);
const CONFETTI_COLORS = ['#dcfa53', '#C9EB00', '#813BF5', '#ffffff'];

async function request(action = '', input?: object): Promise<Game> {
  if (isRewardPlaytest()) return playtestRequest(action, input);
  const response = await fetch('/api/daily-trivia' + (action ? '/' + action : ''), action ? {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Hub-Trivia': '1'},
    body: JSON.stringify(input || {}),
  } : {});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not load the daily challenge.');
  return result;
}

function motionAllowed() {
  return decorativeMotionAllowed(
    document.documentElement.dataset.hubEffects === 'off',
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
}

export function TriviaProvider({children, requestGame = request, cinematic = isRewardPlaytest()}: {children: ReactNode; requestGame?: typeof request; cinematic?: boolean}) {
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
      const delay = action === 'spin' || action === 'super' ? (cinematic ? 6600 : spinDurationMs(motionAllowed())) : action === 'answer' && next.phase === 'won' ? 10000 : 0;
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

  return <Trivia.Provider value={{cinematic, game, error, busy, clockOffset, displayBalance, rewardAward, play, reload: () => void play(), revealBalance}}>{children}</Trivia.Provider>;
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
  const {cinematic, game, error, busy, play, reload, clockOffset, revealBalance} = useTrivia();
  // A full reload clears every in-flight animation and the header balance along with the round.
  const resetRound = () => request('reset').then(() => window.location.reload(), reload);
  const [now, setNow] = useState(Date.now());
  const [away, setAway] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinKind, setSpinKind] = useState<SpinKind | null>(null);
  const [discBeat, setDiscBeat] = useState<DiscBeat>('idle');
  const [freshSettle, setFreshSettle] = useState(false);
  const [discSnap, setDiscSnap] = useState(false);
  const [gatewayHold, setGatewayHold] = useState(false);
  const [finaleCopy, setFinaleCopy] = useState<string>(TRIVIA_COPY.finale[0]);
  useLayoutEffect(() => {
    if (game?.phase !== 'complete' || !game.round?.id) return;
    try { setFinaleCopy(nextTriviaCopy('finale', game.round.id, window.localStorage)); }
    catch { setFinaleCopy(TRIVIA_COPY.finale[0]); }
  }, [game?.phase, game?.round?.id]);
  const [answerCopy, setAnswerCopy] = useState<string>(TRIVIA_COPY.win[0]);
  const [playtestEnding, setPlaytestEnding] = useState<'playing' | 'settling' | 'message' | 'rest'>('playing');
  useEffect(() => {
    if (!cinematic) return;
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
  const [replaying, setReplaying] = useState(false);
  const audio = useRef<ReturnType<typeof createSparkAudio> | null>(null);
  const soundOn = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout>>();
  const spinTimer = useRef<ReturnType<typeof setTimeout>>();
  const replayTimer = useRef<ReturnType<typeof setTimeout>>();
  const revealGeneration = useRef(0);
  const focusTarget = useRef<FocusTarget | null>(null);
  const pendingSpinFocus = useRef(false);
  const skipRequested = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const spinRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

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
      clearTimeout(revealTimer.current);
      clearTimeout(spinTimer.current);
      clearTimeout(replayTimer.current);
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
    if (!cinematic || !expired || busy || !roundId || refreshedExpiry.current === roundId) return;
    // The simulator settles expiry on a read. Refresh once, never submit an answer.
    refreshedExpiry.current = roundId;
    reload();
  }, [expired, busy, game?.round?.id, reload]);
  const revealing = celebration !== null;
  const mood = reactorMood(game?.phase, revealing, expired);
  const rotation = wheelRotationDegrees(game?.round?.spinIndex);

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

  function celebrate(amount: number, kind: CelebrationKind, effective = 0) {
    const tier = revealTier(kind, amount, effective);
    const generation = revealGeneration.current + 1;
    revealGeneration.current = generation;
    clearTimeout(revealTimer.current);
    setCelebration({amount, kind, effective, tier});
    // The base collectible waits for the player's explicit continuation.
    if (kind !== 'base') revealTimer.current = setTimeout(() => {
      if (revealGeneration.current === generation) setCelebration(null);
    }, revealHoldMs(kind));
    const particles = confettiCount(tier);
    if (!cinematic && particles > 0 && motionAllowed()) {
      confetti({
        particleCount: particles,
        spread: tier === 'top' ? 78 : 54,
        startVelocity: tier === 'top' ? 32 : 22,
        origin: {x: 0.62, y: 0.42},
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
    }
    if (tier !== 'quiet' && kind !== 'base') cue('win');
  }

  useEffect(() => {
    if (game?.phase !== 'playing' || remaining <= 0 || remaining > 5) return;
    cue('tick');
  }, [remaining, game?.phase]);

  useEffect(() => {
    const target = focusTarget.current;
    if (!target || celebration || spinning) return;
    if (target === 'question' && game?.phase === 'playing') headingRef.current?.focus({preventScroll: true});
    else if (target === 'spin' && (game?.phase === 'won' || game?.phase === 'super')) spinRef.current?.focus({preventScroll: true});
    else if (target === 'result' && (game?.phase === 'lost' || game?.phase === 'complete')) resultRef.current?.focus({preventScroll: true});
    else return;
    focusTarget.current = null;
  }, [game?.phase, celebration, spinning]);

  async function start() {
    enableSound();
    cue('start');
    focusTarget.current = 'question';
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
      focusTarget.current = 'spin';
      celebrate(result.round?.base || 0, 'base');
    }
    else if (result?.phase === 'lost') {
      focusTarget.current = 'result';
      cue('miss');
    }
  }

  function holdGateway() {
    setGatewayHold(true);
    setDiscBeat('land');
    setDiscSnap(true);
    revealGeneration.current += 1;
    clearTimeout(revealTimer.current);
    setCelebration(null);
    revealBalance();
    focusTarget.current = 'spin';
  }

  function finishSpin(result: Game, kind: SpinKind, animate: boolean) {
    setSpinning(false);
    setSpinKind(null);
    if (kind === 'stage' && result.phase === 'super') {
      holdGateway();
      return;
    }
    setDiscBeat('idle');
    focusTarget.current = 'result';
    setFreshSettle(animate);
    if (!animate) {
      revealGeneration.current += 1;
      clearTimeout(revealTimer.current);
      setCelebration(null);
      revealBalance();
      return;
    }
    if (kind === 'super') {
      const stageTotal = (result.round?.base || 0) * 5;
      celebrate(bonusSparks(stageTotal, result.round?.total || 0), 'super', result.round?.effectiveMultiplier || 0);
      return;
    }
    celebrate(bonusSparks(result.round?.base || 0, result.round?.total || 0), 'bonus', result.round?.effectiveMultiplier || 0);
  }

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runSpin(action: SpinKind) {
    enableSound();
    setSpinning(true);
    setSpinKind(action);
    skipRequested.current = false;
    setDiscSnap(false);
    const motion = motionAllowed();
    if (action === 'stage' && motion) setDiscBeat('press');
    const pending = play(action === 'stage' ? 'spin' : 'super', {roundId: game?.round?.id});
    if (action === 'stage' && motion) {
      await wait(120);
      if (!skipRequested.current) setDiscBeat('wind');
      await wait(180);
    }
    const result = await pending;
    if (!result) {
      setSpinning(false);
      setSpinKind(null);
      setDiscBeat('idle');
      return;
    }
    const animate = !skipRequested.current && motion;
    if (!animate) {
      finishSpin(result, action, false);
      return;
    }
    if (action === 'stage') setDiscBeat('travel');
    cue('spin');
    clearTimeout(spinTimer.current);
    spinTimer.current = setTimeout(() => landSpin(result, action), spinDurationMs(true));
  }

  /** Hold on the landed wedge so the player sees the wheel decide before the payout covers it. */
  function landSpin(result: Game, action: SpinKind) {
    if (action !== 'stage' || result.phase === 'super') {
      finishSpin(result, action, true);
      return;
    }
    setDiscBeat('land');
    spinTimer.current = setTimeout(() => finishSpin(result, action, true), LAND_BEAT_MS);
  }

  function spin() {
    void runSpin('stage');
  }

  function takeSuper() {
    void runSpin('super');
  }

  function continueSuper() {
    pendingSpinFocus.current = true;
    setGatewayHold(false);
    setDiscBeat('idle');
  }

  useLayoutEffect(() => {
    if (!pendingSpinFocus.current || gatewayHold) return;
    const nextAction = spinRef.current;
    if (!nextAction) return;
    pendingSpinFocus.current = false;
    nextAction.focus();
  }, [gatewayHold]);

  async function declineSuper() {
    setGatewayHold(false);
    setDiscBeat('idle');
    const result = await play('decline', {roundId: game?.round?.id});
    if (result?.phase === 'complete') focusTarget.current = 'result';
  }

  function skipAnimation() {
    skipRequested.current = true;
    clearTimeout(spinTimer.current);
    revealGeneration.current += 1;
    clearTimeout(revealTimer.current);
    setCelebration(null);
    setSpinning(false);
    setSpinKind(null);
    revealBalance();
    if (game?.phase === 'super' || gatewayHold) {
      setDiscSnap(true);
      setGatewayHold(true);
      setDiscBeat('land');
      focusTarget.current = 'spin';
      return;
    }
    setDiscBeat('idle');
    focusTarget.current = 'result';
  }

  function replay() {
    if (replayCredits() !== 0) return;
    setReplaying(true);
    celebrate(game?.round?.total || 0, 'replay');
    clearTimeout(replayTimer.current);
    replayTimer.current = setTimeout(() => setReplaying(false), REVEAL_HOLD_MS);
  }

  const tier = celebration?.tier ?? null;
  const answered = game != null && game.phase !== 'ready' && game.phase !== 'playing';
  const sectionClass = [
    'daily-spark',
    'spark-showcase',
    cinematic || game?.phase === 'ready' ? 'is-ready-invitation' : '',
    answered ? 'is-answered' : '',
    revealing ? 'is-winning' : '',
    tier === 'top' && motionAllowed() ? 'is-impact' : '',
    spinning ? 'is-spinning' : '',
    game?.phase === 'playing' && remaining <= 5 ? 'is-urgent' : '',
    away ? 'is-away' : '',
  ].filter(Boolean).join(' ');

  return <section className={sectionClass} id={sectionId} data-reveal={tier ?? undefined} aria-labelledby="daily-spark-title">
    <div className="spark-atmosphere" aria-hidden="true"><i /><i /><i /><span>✦</span></div>
    <SparkIntro hours={hours} minutes={minutes} game={game} cinematic={cinematic} presentation={presentation} />
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
      {!cinematic && (game?.phase === 'lost' || expired) && <SparkMiss
        game={game}
        headline={answerCopy}
        expired={expired}
        busy={busy}
        mood={mood}
        resultRef={resultRef}
        onReload={reload}
      />}
      {!cinematic && game && chosenId === null && celebration?.kind !== 'base' && (game.phase === 'won' || game.phase === 'super' || game.phase === 'complete') && <SparkVault
        game={game}
        spinning={spinning}
        spinKind={spinKind}
        replaying={replaying}
        busy={busy}
        rotation={rotation}
        mood={mood}
        spinRef={spinRef}
        resultRef={resultRef}
        onSpin={spin}
        onSuper={takeSuper}
        onContinue={continueSuper}
        onDecline={declineSuper}
        onSkip={skipAnimation}
        onReplay={replay}
        discBeat={discBeat}
        discSnap={discSnap}
        gatewayHold={gatewayHold}
        hours={hours}
        minutes={minutes}
        countUp={freshSettle && !celebration}
      />}
      {cinematic && game && ['playing', 'settling'].includes(playtestEnding) && ['won', 'super', 'complete'].includes(game.phase) && <PlaytestWheel warming={celebration?.kind === 'base'} game={game} onCue={cue} play={(action, input) => {enableSound(); return play(action, input);}} onSettled={() => {revealBalance(); if (game.phase === 'complete') setPlaytestEnding('settling');}} />}
      {playtestEnding === 'message' && game && <div className="spark-finished" data-win={game.phase !== 'lost' || undefined} role="status">
        {game.phase !== 'lost' && <div className="reward-rays" aria-hidden="true" />}
        <SparkReactor mood={mood} />
        <h2 className="reward-type">{game.phase === 'lost' ? answerCopy : finaleCopy}</h2>
        {game.phase === 'lost' ? <><p>No AI Sparks this round.</p><strong>{game.round?.correctAnswer}</strong></> : <><strong className="reward-type">{(game.round?.total || 0).toLocaleString()}</strong><p>AI Sparks banked. Go create.</p></>}
      </div>}
      {error && <div className="spark-error" role="alert"><p>{error}</p><button type="button" className="btn" disabled={busy} onClick={reload}>Check my round</button></div>}
      {celebration?.kind === 'base' && game ? <SparkUnlock inline={cinematic} amount={celebration.amount} balance={game.balance} headline={answerCopy} onReveal={() => {revealBalance(); cue('win');}} onContinue={() => setCelebration(null)} /> : celebration && <VaultReveal celebration={celebration} answerCopy={answerCopy} />}
    </div>
    {cinematic && playtestEnding === 'rest' && game?.round?.explanation && <div className="spark-creator-takeaway"><strong>Creator takeaway</strong><p>{game.round.explanation}</p></div>}
    {(game?.phase === 'ready' || playtestEnding === 'rest') && <SparkJourney />}
    {!presentation && <div className="spark-build-notes"><Link className="spark-riff-link" to="/create/trivia" state={{triviaSeed: riffFromGame(game)}}>Riff this Game</Link></div>}
    {cinematic && <div className="reward-playtest-bar"><button type="button" className="spark-test-again" title="Playtest: simulated AI Sparks. No daily attempt used." aria-description="Restarts the playtest with simulated AI Sparks; no daily attempt is used." onClick={onRestart || (() => window.location.reload())}>{presentation ? 'Play again ↻' : 'Test again ↻'}</button></div>}
    {!cinematic && game?.canReset && game.phase !== 'ready' && <div className="reward-playtest-bar"><button type="button" className="spark-test-again" disabled={busy} title="Testing: clears your current round and removes the AI Sparks it earned so you can play again." onClick={resetRound}>Reset trivia ↻</button></div>}
  </section>;
}

function SparkIntro({hours, minutes, game, cinematic, presentation}: {hours: number; minutes: number; game: Game | null; cinematic: boolean; presentation?: TriviaPresentation}) {
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
        <p className="spark-rules-note">{presentation ? 'Practice rounds are replayable. ' : 'One question per day. Resets at 00:00 UTC. '}AI Sparks are in-app credits, not TARI or cash. {cinematic ? 'This playtest uses simulated rewards.' : 'No purchase, transfer or redemption.'}</p>
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

function SparkMiss({headline, game, expired, busy, mood, resultRef, onReload}: {
  headline: string;
  game: Game | null;
  expired: boolean;
  busy: boolean;
  mood: ReturnType<typeof reactorMood>;
  resultRef: RefObject<HTMLHeadingElement>;
  onReload: () => void;
}) {
  return <div className="spark-finished">
    <SparkReactor mood={mood} />
    <h2 ref={resultRef} tabIndex={-1}>{expired ? 'Clock’s out.' : headline}</h2>
    <p>{expired ? 'The twenty seconds ended. Today’s attempt is complete.' : game?.round?.reason && game.round.reason !== 'Not this time. Keep that new knowledge.' ? game.round.reason : 'No Sparks this round. Here’s the answer to keep.'}</p>
    {expired
      ? <button type="button" className="btn" onClick={onReload} disabled={busy}>Reveal the answer</button>
      : <><strong>{game?.round?.correctAnswer}</strong><p>{game?.round?.explanation}</p></>}
    <Link to="/learn">Find your next spark in Learn</Link>
  </div>;
}

function SparkVault({game, spinning, spinKind, replaying, busy, rotation, mood, spinRef, resultRef, onSpin, onSuper, onContinue, onDecline, onSkip, onReplay, discBeat, discSnap, gatewayHold, hours, minutes, countUp}: {
  game: Game;
  spinning: boolean;
  spinKind: SpinKind | null;
  replaying: boolean;
  busy: boolean;
  rotation: number;
  mood: ReturnType<typeof reactorMood>;
  spinRef: RefObject<HTMLButtonElement>;
  resultRef: RefObject<HTMLHeadingElement>;
  onSpin: () => void;
  onSuper: () => void;
  onContinue: () => void;
  onDecline: () => void;
  onSkip: () => void;
  onReplay: () => void;
  discBeat: DiscBeat;
  discSnap: boolean;
  gatewayHold: boolean;
  hours: number;
  minutes: number;
  countUp: boolean;
}) {
  const stageSpinning = spinning && spinKind === 'stage';
  const superSpinning = spinning && spinKind === 'super';
  const showDisc = game.phase === 'won' || stageSpinning || gatewayHold;
  const showSuper = ((game.phase === 'super' && !stageSpinning) || superSpinning) && !gatewayHold;
  const settled = game.phase === 'complete' && !spinning && !gatewayHold;
  const multiplier = game.multipliers[game.round?.spinIndex ?? -1];
  const base = game.round?.base || 0;
  const total = game.round?.total || 0;
  const preview = payoutPreview(base);
  const heading = gatewayHold
    ? '5× hit. Super unlocked.'
    : showDisc
      ? 'Let the wheel cook.'
      : vaultHeading({
        spinning,
        superSpin: superSpinning,
        phase: game.phase,
        base,
        total,
        effective: game.round?.effectiveMultiplier,
        superFactor: game.round?.superFactor,
        superDeclined: game.round?.superDeclined,
      });
  const kicker = gatewayHold
    ? '5× LANDED · GATEWAY'
    : showDisc
      ? (stageSpinning ? 'SPINNING' : 'ONE SPIN LEFT')
      : showSuper
        ? 'BONUS ROUND'
        : settled
          ? 'SETTLED'
          : 'BASE SECURED';
  return <div className="spark-bonus" data-banked={total} data-super-offer={showSuper && !superSpinning ? 'open' : undefined} data-gateway={gatewayHold ? 'hold' : undefined}>
    {mood === 'ignited' && !settled && <div className="spark-charge"><SparkReactor mood="ignited" /></div>}
    {showDisc
      ? <div className="vault-copy">
        <div className="vault-bank"><strong>{base}</strong><span>Sparks banked · base locked</span></div>
        <span>{kicker}</span>
        <h2 ref={resultRef} tabIndex={-1}>{heading}</h2>
        <p>{gatewayHold ? `${total} Sparks banked path · optional Super next.` : 'Preview what you keep before you commit.'}</p>
      </div>
      : <div className={settled ? 'spark-bonus-copy spark-safe' : 'spark-bonus-copy'}>
        <span>{kicker}</span>
        <h2 ref={settled || showSuper ? resultRef : undefined} tabIndex={settled || showSuper ? -1 : undefined}>{heading}</h2>
      </div>}
    {showDisc && <VaultDisc multipliers={game.multipliers} rotation={rotation} beat={discBeat} landed={gatewayHold} snap={discSnap} landedValue={discBeat === 'land' ? multiplier : undefined} />}
    {showDisc && <PayoutStrip preview={preview} />}
    {showSuper && <SuperWheel game={game} spinning={superSpinning} />}
    {showSuper && <SuperOdds game={game} />}
    {settled && <VaultLedger game={game} multiplier={multiplier} mood={mood} replaying={replaying} onReplay={onReplay} countUp={countUp} />}
    <div className={settled ? 'spark-safe spark-settle-action' : undefined}>
    <VaultAction
      game={game}
      spinning={spinning}
      busy={busy}
      multiplier={multiplier}
      gatewayHold={gatewayHold}
      spinRef={spinRef}
      onSpin={onSpin}
      onSuper={onSuper}
      onContinue={onContinue}
      onDecline={onDecline}
      onSkip={onSkip}
      hours={hours}
      minutes={minutes}
      settled={settled}
    />
    </div>
    {settled && <details className="spark-lesson"><summary>The takeaway from today’s question</summary><p>{game.round?.explanation}</p></details>}
  </div>;
}

function PayoutStrip({preview}: {preview: ReturnType<typeof payoutPreview>}) {
  return <div className="vault-preview" aria-label="payout preview">
    <span><b>{preview.kept}</b>IF 1×</span>
    <span><b>{preview.midLow}–{preview.midHigh}</b>IF 2×/3×</span>
    <span className="is-rare"><b>{preview.gateway}+</b>IF 5× → Super</span>
  </div>;
}

function VaultDisc({multipliers, rotation, beat, landed, snap, landedValue}: {
  multipliers: number[];
  rotation: number;
  beat: DiscBeat;
  landed: boolean;
  snap: boolean;
  landedValue?: number;
}) {
  const turning = beat === 'travel' || beat === 'land' || landed;
  const freeze = snap || !turning || !motionAllowed();
  const [faceReady, setFaceReady] = useState(false);
  const [badgeReady, setBadgeReady] = useState(false);
  const [pointerReady, setPointerReady] = useState(false);
  const [rimReady, setRimReady] = useState(false);
  const beatClass = ['vault-disc', faceReady ? 'has-pack-face' : '', badgeReady ? 'has-pack-badge' : '', pointerReady ? 'has-pack-pointer' : '', rimReady ? 'has-pack-rim' : '', beat === 'press' ? 'is-press' : '', beat === 'wind' ? 'is-wind' : '', beat === 'travel' ? 'is-travel' : '', landed ? 'is-land-5x' : '', beat === 'land' && !landed ? `is-landing is-landing-${landingTier(landedValue)}` : ''].filter(Boolean).join(' ');
  return <div className="vault-stage">
    {(landed || landedValue != null) && <div className="vault-landed-value" role="status">{landed ? 5 : landedValue}× <span>Multiplier locked</span></div>}
    <div className={beatClass} data-wedges={multipliers.length} data-art="authored-lobby-vault-disc">
    <div className="vault-glow" aria-hidden="true" />
    <div className="vault-pointer" aria-hidden="true" />
    <DiscPlate className="vault-plate vault-plate-pointer" src={VAULT_DISC_POINTER_SRC} onReady={() => setPointerReady(true)} />
    <div className="vault-rim" aria-hidden="true" />
    <div className={freeze ? 'vault-spin is-snapped' : 'vault-spin'} style={{transform: `rotate(${turning ? rotation : 0}deg)`, '--spin': `${turning ? rotation : 0}deg`} as CSSProperties}>
      <DiscPlate className="vault-plate vault-plate-rim" src={VAULT_DISC_RIM_PNG} fallbackSrc={VAULT_DISC_RIM_SRC} onReady={() => setRimReady(true)} />
      <div className="vault-face" />
      <DiscPlate className="vault-plate vault-plate-face" src={VAULT_DISC_FACE_SRC} onReady={() => setFaceReady(true)} />
      <div className="vault-lift" />
      <div className="vault-seams" />
      <div className="vault-foil" />
      <span className="vault-seal">5× · Super path</span>
      <DiscPlate className="vault-plate vault-plate-badge" src={VAULT_DISC_BADGE_SRC} onReady={() => setBadgeReady(true)} />
      {multipliers.map((value, index) => <span key={`${value}-${index}`} className={value === 5 ? 'vault-label is-gateway' : 'vault-label'} style={{'--a': `${index * 60 + 30}deg`} as CSSProperties}>{value}×</span>)}
    </div>
    <div className="vault-hub" data-art="authored-lobby-vault-charge" aria-hidden="true">
      <img alt="" src={VAULT_CHARGE_HERO_SRC} />
    </div>
    </div>
  </div>;
}

function DiscPlate({className, src, fallbackSrc, onReady}: {
  className: string;
  src: string;
  fallbackSrc?: string;
  onReady: () => void;
}) {
  const [source, setSource] = useState(src);
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img
    className={className}
    alt=""
    src={source}
    onLoad={onReady}
    onError={() => {
      if (fallbackSrc && source !== fallbackSrc) {
        setSource(fallbackSrc);
        return;
      }
      setFailed(true);
    }}
  />;
}

function SuperWheel({game, spinning}: {game: Game; spinning: boolean}) {
  const rows = game.superSpins || [];
  const factor = game.round?.superFactor;
  const rotation = spinning && factor ? superWheelRotation(rows, factor) : superIdleRotation(rows);
  const snap = !spinning || !motionAllowed();
  const [pointerReady, setPointerReady] = useState(false);
  const wrapClass = ['spark-wheel-wrap', 'is-super', pointerReady ? 'has-pack-pointer' : ''].filter(Boolean).join(' ');
  return <div className={wrapClass} data-art="authored-lobby-vault-disc">
    <div className="wheel-energy" aria-hidden="true" />
    <span className="spark-wheel-pointer" aria-hidden="true" />
    <DiscPlate className="vault-plate vault-plate-pointer" src={VAULT_DISC_POINTER_SRC} onReady={() => setPointerReady(true)} />
    {/* Stage rim PNG bakes “5× · Super path”. Super arcs stay on the foil CSS rim. */}
    <div className="vault-rim" aria-hidden="true" />
    <div
      className={snap ? 'spark-wheel is-super is-snapped' : 'spark-wheel is-super'}
      style={{transform: `rotate(${rotation}deg)`, '--spin': `${rotation}deg`, background: superWheelGradient(rows)} as CSSProperties}
      aria-hidden="true"
    >
      {rows.map((row) => <span key={row.factor} className={row.effective === 50 ? 'vault-label is-gateway' : 'vault-label'} style={{'--a': `${superWedgeCenter(rows, row.factor)}deg`} as CSSProperties}>{row.effective}×</span>)}
    </div>
    <div className="spark-wheel-hub" data-art="authored-lobby-vault-charge" aria-hidden="true">
      <img alt="" src={VAULT_CHARGE_HERO_SRC} />
    </div>
  </div>;
}

function SuperOdds({game}: {game: Game}) {
  const rows = game.superSpins || [];
  return <div className="spark-super-panel" data-super-odds="published">
    <p className="spark-odds">Super Spin chances after a 5× wedge. Arc size matches the percent. Overall chance of 50× is {formatPathPercent(game.maxPathPercent ?? 0.5)}.</p>
    <ul className="spark-super-odds">
      {rows.map((row) => <li key={row.factor}>
        <b>{row.effective}×</b>
        <i style={{width: `${row.percent}%`}} />
        <span>{row.percent}%</span>
      </li>)}
    </ul>
  </div>;
}

/** Counts the banked value up from the base once, after the payout overlay clears. The server total is final either way. */
function useCountUp(from: number, to: number, run: boolean): number {
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (!run || from >= to || !motionAllowed()) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const next = countUpValue(from, to, (now - start) / COUNT_UP_MS);
      setValue(next);
      if (next !== to) frame = requestAnimationFrame(step);
    };
    setValue(from);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [from, to, run]);
  return value;
}

function VaultLedger({game, multiplier, mood, replaying, onReplay, countUp}: {
  game: Game;
  multiplier: number | undefined;
  mood: ReturnType<typeof reactorMood>;
  replaying: boolean;
  onReplay: () => void;
  countUp: boolean;
}) {
  const total = game.round?.total || 0;
  const shownTotal = useCountUp(game.round?.base || 0, total, countUp);
  const superFactor = game.round?.superFactor;
  const declined = Boolean(game.round?.superDeclined);
  const reveal = settledRevealTier(game.round?.effectiveMultiplier, superFactor);
  const keptBase = isKeptBaseSettle(game.round);
  return <div className="spark-victory" data-reveal={reveal ?? 'settled'}>
    <div className="spark-decor"><SparkReactor mood={mood === 'ignited' ? 'ignited' : 'settled'} /></div>
    {keptBase && <p className="spark-vault-caption">{SETTLED_KEEP_CHROME.caption}</p>}
    <div className="spark-victory-stats spark-safe" data-count={superFactor ? 4 : 3}>
      <span><b>{game.round?.base}</b>BASE</span>
      {superFactor
        ? <><span><b>5×</b>STAGE</span><span><b>{game.round?.effectiveMultiplier}×</b>EFFECTIVE</span></>
        : declined
          ? <span><b>5×</b>KEPT</span>
          : <span><b>{multiplier ? `${multiplier}×` : '—'}</b>MULTIPLIER</span>}
      <span className={shownTotal === total ? 'is-banked' : 'is-banked is-counting'}><b>{shownTotal.toLocaleString()}</b>BANKED</span>
    </div>
    <button type="button" className="spark-replay spark-safe" disabled={replaying} onClick={onReplay}>
      Replay the celebration <small>Visual replay · no extra points</small>
    </button>
  </div>;
}

function VaultAction({game, spinning, busy, multiplier, gatewayHold, spinRef, onSpin, onSuper, onContinue, onDecline, onSkip, hours, minutes, settled}: {
  game: Game;
  spinning: boolean;
  busy: boolean;
  multiplier: number | undefined;
  gatewayHold: boolean;
  spinRef: RefObject<HTMLButtonElement>;
  onSpin: () => void;
  onSuper: () => void;
  onContinue: () => void;
  onDecline: () => void;
  onSkip: () => void;
  hours: number;
  minutes: number;
  settled: boolean;
}) {
  if (gatewayHold) {
    return <>
      <button type="button" className="btn primary spark-play" ref={spinRef} onClick={onContinue}>Continue to Super</button>
      <button type="button" className="spark-replay" onClick={onDecline} disabled={busy}>
        Keep {game.round?.total} · skip Super <small>Decline · no extra points</small>
      </button>
    </>;
  }
  if (spinning) {
    return <>
      <button type="button" className="btn primary spark-play is-spinning" disabled>Spinning…</button>
      <button type="button" className="spark-replay" onClick={onSkip}>Skip to the result</button>
    </>;
  }
  if (game.phase === 'won') {
    return <button type="button" className="btn primary spark-play" ref={spinRef} onClick={onSpin} disabled={busy}>
      Spin once
    </button>;
  }
  if (game.phase === 'super') {
    return <>
      <p role="status">5× is already banked. Super Spin is optional.</p>
      <button type="button" className="btn primary spark-play" ref={spinRef} onClick={onSuper} disabled={busy}>
        Take the Super Spin <span aria-hidden="true">✦</span>
      </button>
      <button type="button" className="spark-replay" onClick={onDecline} disabled={busy}>
        Keep the 5× <small>Decline · no extra points</small>
      </button>
    </>;
  }
  const effective = game.round?.effectiveMultiplier;
  const keptBase = isKeptBaseSettle(game.round);
  const saved = game.round?.superDeclined
    ? 'Keep the 5× · Decline · no extra points'
    : keptBase
      ? SETTLED_KEEP_CHROME.support
      : game.round?.superFactor === 1
        ? '5× held · no extra Sparks.'
        : effective === 50
          ? `${game.round?.total?.toLocaleString()} Sparks banked. Top path only.`
          : `${effective || multiplier || '—'}× · ${game.round?.total?.toLocaleString()} Sparks banked.`;
  return <>
    <p role="status">{saved}</p>
    {keptBase && <p className="spark-sparks-note">{SETTLED_KEEP_CHROME.sparksNote}</p>}
    <Link className={keptBase ? 'btn spark-play is-outline' : 'btn spark-play'} to="/create">
      {keptBase ? SETTLED_KEEP_CHROME.action : 'Keep the creative streak going'}
    </Link>
    {settled && <p className="spark-claimed-clock">Today’s vault is claimed · next drop in {hours}h {minutes}m (00:00 UTC).</p>}
  </>;
}

function VaultReveal({celebration, answerCopy}: {celebration: Celebration; answerCopy: string}) {
  const label = celebrationLabel(celebration.kind, celebration.amount, celebration.effective);
  const prefix = celebration.kind === 'replay' || celebration.tier === 'quiet' ? '' : '+';
  return <div className="spark-jackpot" data-answer={celebration.kind === 'base' || undefined} data-reveal={celebration.tier} role="status">
    {celebration.kind === 'base' && <div className="spark-answer-impact" aria-hidden="true"><span /><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div>}
    {celebration.kind === 'base' && <div className="spark-answer-rain" aria-hidden="true">
      {Array.from({length: 64}, (_, index) => <i key={index} style={{
        '--spark-x': `${(index * 37 + 7) % 100}%`,
        '--spark-delay': `${(index % 8) * 48}ms`,
        '--spark-size': `${20 + (index % 5) * 10}px`,
        '--spark-drift': `${(index % 2 ? 1 : -1) * (12 + index % 5 * 8)}px`,
      } as CSSProperties}>✦</i>)}
    </div>}
    {celebration.tier === 'top' && <div className="spark-coin-rain" aria-hidden="true">
      {Array.from({length: COIN_COUNT}, (_, index) => <i key={index} style={{'--coin': index} as CSSProperties}>✦</i>)}
    </div>}
    <span>{celebration.tier === 'quiet' ? '' : label.kicker}</span>
    <strong>{celebration.tier === 'quiet' ? (celebration.kind === 'base' ? answerCopy : label.kicker) : `${prefix}${celebration.amount.toLocaleString()}`}</strong>
    <b>{label.detail}</b>
    {celebration.kind === 'base' && <em className="spark-answer-award">+{celebration.amount.toLocaleString()} Sparks banked</em>}
  </div>;
}
