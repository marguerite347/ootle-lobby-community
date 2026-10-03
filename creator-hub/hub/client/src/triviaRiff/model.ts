import type {Game} from '../components/DailyTrivia';
export const RITUAL_ART = {
  witchcraft: {name: 'Cauldron & spellbook', left: '/seasonal/october-2026/ritual-cauldron-v2.png', right: '/seasonal/october-2026/ritual-spellbook-v3.png'},
  concoction: {name: 'Confidential concoction', left: '/seasonal/october-2026/confidential-potion.png', right: '/seasonal/october-2026/ritual-spellbook-v3.png'},
} as const;
export type TriviaQuestion = {question: string; answers: [string, string, string, string]; correctIndex: number; explanation: string};
export type TriviaRiff = {
  version: 1;
  source: 'daily-ritual';
  title: string;
  subtitle: string;
  accent: string;
  artwork: keyof typeof RITUAL_ART;
  questions: TriviaQuestion[];
};
export function newTriviaRiff(): TriviaRiff {
  return {version: 1, source: 'daily-ritual', title: 'My Daily Ritual', subtitle: 'One question. A little magic.', accent: '#d5ef4b', artwork: 'witchcraft',
    questions: [{question: 'What makes a Riff your own?', answers: ['A meaningful creative change', 'Renaming a folder only', 'Removing the credits', 'Changing the download date'], correctIndex: 0, explanation: 'A Riff builds on the original experience with a meaningful creative change. Try changing this question, its answers and the artwork.'}]};
}
function boundedText(value: unknown, max: number): value is string {return typeof value === 'string' && value.length <= max;}
export function readTriviaRiff(value: unknown): TriviaRiff | null {
  if (!value || typeof value !== 'object') return null;
  const riff = value as TriviaRiff;
  if (riff.version !== 1 || riff.source !== 'daily-ritual' || !boundedText(riff.title, 80) || !boundedText(riff.subtitle, 160)) return null;
  if (typeof riff.accent !== 'string' || !/^#[0-9a-f]{6}$/i.test(riff.accent) || !Object.prototype.hasOwnProperty.call(RITUAL_ART, riff.artwork)) return null;
  if (!Array.isArray(riff.questions) || riff.questions.length < 1 || riff.questions.length > 20) return null;
  if (!riff.questions.every(question => question && boundedText(question.question, 240) && boundedText(question.explanation, 600) &&
    Array.isArray(question.answers) && question.answers.length === 4 && question.answers.every(answer => boundedText(answer, 140)) &&
    Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4)) return null;
  return structuredClone(riff);
}
export function triviaRiffError(riff: TriviaRiff): string {
  if (!readTriviaRiff(riff)) return 'This Riff contains unsupported settings.';
  if (!riff.title.trim()) return 'Give your Riff a title.';
  const empty = riff.questions.findIndex(question => !question.question.trim() || question.answers.some(answer => !answer.trim()) || !question.explanation.trim());
  return empty < 0 ? '' : `Complete the question, four answers and takeaway for question ${empty + 1}.`;
}

/** Carry the revealed question into a Riff without copying balances or an unanswered round. */
export function riffFromGame(game: Game | null): TriviaRiff {
  const riff = newTriviaRiff();
  const round = game?.round;
  if (!game || !['won', 'super', 'complete', 'lost'].includes(game.phase) || !round?.question || !round.explanation || round.options?.length !== 4) return riff;
  const correctIndex = round.options.findIndex(option => option.text === round.correctAnswer);
  if (correctIndex < 0) return riff;
  const candidate = {...riff, questions: [{question: round.question, answers: round.options.map(option => option.text) as TriviaQuestion['answers'], correctIndex, explanation: round.explanation}]};
  return readTriviaRiff(candidate) || riff;
}
