import {describe, expect, it} from 'vitest';
import {nextTriviaCopy, TRIVIA_COPY} from './triviaCopy';
describe('trivia copy rotation', () => {
  it('cycles independently by outcome and preserves a round on reload', () => {
    const values = new Map<string,string>();
    const storage = {getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => {values.set(key,value);}};
    expect(nextTriviaCopy('win','1',storage)).toBe(TRIVIA_COPY.win[0]);
    expect(nextTriviaCopy('win','1',storage)).toBe(TRIVIA_COPY.win[0]);
    expect(nextTriviaCopy('win','2',storage)).toBe(TRIVIA_COPY.win[1]);
    expect(nextTriviaCopy('miss','3',storage)).toBe(TRIVIA_COPY.miss[0]);
    expect(nextTriviaCopy('win','4',storage)).toBe(TRIVIA_COPY.win[2]);
    expect(nextTriviaCopy('win','5',storage)).toBe(TRIVIA_COPY.win[0]);
  });
  it('falls back safely when browser storage is unavailable', () => {
    expect(nextTriviaCopy('miss','1',{getItem:()=>{throw Error('disabled');},setItem:()=>{}})).toBe(TRIVIA_COPY.miss[0]);
  });
});
