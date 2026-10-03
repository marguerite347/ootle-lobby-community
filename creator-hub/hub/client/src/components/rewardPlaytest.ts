import type {Game} from './DailyTrivia';

const PLAYTEST_SESSION_KEY = 'ootle-reward-playtest';
let sessionPlaytest = false;

const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Local previews always open the current wheel. Legacy comparison requires an explicit URL. */
export function isRewardPlaytest() {
  const choice = new URLSearchParams(window.location.search).get('rewardPlaytest');
  if (choice === '1' || choice === '0') {
    sessionPlaytest = choice === '1';
    try { sessionStorage.setItem(PLAYTEST_SESSION_KEY, choice); } catch { /* Memory fallback for restricted storage. */ }
  } else if (LOCAL_PREVIEW_HOSTS.has(window.location.hostname)) {
    // A fresh tab, cleared storage or an old opt-out must not restore the retired wheel.
    sessionPlaytest = true;
  } else {
    try { sessionPlaytest = sessionStorage.getItem(PLAYTEST_SESSION_KEY) === '1' || sessionPlaytest; } catch { /* Keep the in-memory choice. */ }
  }
  return sessionPlaytest;
}
const questions = [
  ['What does a game’s “core loop” describe?', 'The actions a player repeats', 'The loading screen', 'The file size', 'The end credits'],
  ['What makes a Riff your own?', 'A meaningful creative change', 'Renaming a folder only', 'Removing the credits', 'Changing the download date'],
  ['What makes a button feel responsive?', 'Immediate visual feedback', 'A silent two-second delay', 'An invisible hit area', 'Moving away from the pointer'],
];
export type PracticeQuestion = {question: string; answers: readonly string[]; correctIndex: number; explanation: string};
export function createPlaytestRequest(questionIndex = 0, now = () => Date.now(), superFactor: 1 | 2 | 5 | 10 | 20 = 20, custom?: {question: PracticeQuestion; randomSpins?: boolean}) {
  const question = custom ? [custom.question.question, ...custom.question.answers] : questions[questionIndex % questions.length];
  const correctIndex = custom?.question.correctIndex ?? 0;
  let game: Game = {balance: 0, day: 0, serverNow: now(), resetAt: now() + 86400000, phase: 'ready', round: null,
    multipliers: [1, 2, 1, 3, 2, 5], maxPathPercent: 100/72,
    superSpins: [1,2,5,10,20].map(factor=>({factor,effective:5*factor,percent:(factor===1?8:1)/12*100}))};
  let started = 0;
  return async (action = '', input: {roundId?: string; optionId?: string} = {}): Promise<Game> => {
    const time = now();
    if (game.phase === 'playing' && time >= game.round!.deadline) game = {...game, phase: 'lost', round: {...game.round!, reason: 'Time’s up. Bring that energy tomorrow.'}};
    if (action === 'start' && game.phase === 'ready') {
      started = time;
      game = {...game, phase: 'playing', round: {id: `playtest-${time}`, deadline: time + 20000, question: question[0],
        options: question.slice(1).map((text, index) => ({id: String(index), text})), correctAnswer: question[correctIndex + 1], explanation: custom?.question.explanation ?? question[1] + ' makes the experience work.'}};
    } else if (action && action !== 'start') {
      if (input.roundId !== game.round?.id) throw new Error('This round has ended. Try again.');
      if (action === 'answer' && game.phase === 'playing') {
        const base = time - started <= 8000 ? 150 : 100;
        game = input.optionId === String(correctIndex) ? {...game, phase: 'won', balance: base, round: {...game.round!, base, total: base}}
          : {...game, phase: 'lost', round: {...game.round!, reason: 'No Sparks this round. Here’s the answer to keep.'}};
      } else if (action === 'spin' && game.phase === 'won') {
        const spinIndex = custom?.randomSpins ? Math.floor(Math.random() * game.multipliers.length) : 5;
        const multiplier = game.multipliers[spinIndex];
        const total = game.round!.base! * multiplier;
        game = {...game, phase: multiplier === 5 ? 'super' : 'complete', balance: total, round: {...game.round!, spinIndex, total, effectiveMultiplier: multiplier}};
      } else if (action === 'super' && game.phase === 'super') {
        const factor = custom?.randomSpins ? [1,1,1,1,1,1,1,1,2,5,10,20][Math.floor(Math.random() * 12)] : superFactor;
        const total = game.round!.total! * factor;
        game = {...game, phase: 'complete', balance: total, round: {...game.round!, superFactor: factor, total, effectiveMultiplier: 5 * factor}};
      } else if (action === 'decline' && game.phase === 'super') {
        game = {...game, phase: 'complete', round: {...game.round!, superDeclined: true}};
      }
    }
    return structuredClone({...game, serverNow: time});
  };
}
let request: ReturnType<typeof createPlaytestRequest>;
export async function playtestRequest(action = '', input?: object) {
  if (!request) {
    let index = 0;
    try {index = Number(sessionStorage.getItem('ootle-playtest-question') || 0); sessionStorage.setItem('ootle-playtest-question', String(index + 1));} catch { /* Storage is optional for a disposable test. */ }
    request = createPlaytestRequest(Number.isFinite(index) ? index : 0);
  }
  return request(action, input);
}
