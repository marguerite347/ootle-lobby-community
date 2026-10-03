import {describe, expect, it, vi} from 'vitest';
import {newTriviaRiff, readTriviaRiff, triviaRiffError, riffFromGame} from './model';
import {createPlaytestRequest} from '../components/rewardPlaytest';

describe('Daily Ritual Riffs', () => {
  it('round-trips authored content and rejects unsafe or malformed art and answer keys', () => {
    const riff = newTriviaRiff();
    expect(readTriviaRiff(JSON.parse(JSON.stringify(riff)))).toEqual(riff);
    expect(readTriviaRiff({...riff, artwork: '__proto__'})).toBeNull();
    expect(readTriviaRiff({...riff, accent: 'url(javascript:bad)'})).toBeNull();
    expect(readTriviaRiff({...riff, questions: [{...riff.questions[0], correctIndex: 4}]})).toBeNull();
    expect(readTriviaRiff({...riff, questions: []})).toBeNull();
    expect(triviaRiffError({...riff, questions: [{...riff.questions[0], answers: ['', 'B', 'C', 'D']}]})).toContain('question 1');
  });
  it('uses the authored answer and takeaway through both wheels without network writes', async () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No network allowed'));
    const question = {...newTriviaRiff().questions[0], correctIndex: 2, explanation: 'Custom takeaway'};
    const play = createPlaytestRequest(0, () => 1000, 20, {question});
    const started = await play('start');
    const input = {roundId: started.round!.id, optionId: '2'};
    expect(started.round?.correctAnswer).toBe(question.answers[2]);
    expect((await play('answer', input)).balance).toBe(150);
    expect((await play('spin', input)).balance).toBe(750);
    expect((await play('super', input)).balance).toBe(15000);
    const settled = await play('super', input);
    expect(settled.balance).toBe(15000);
    expect(settled.round?.explanation).toBe('Custom takeaway');
    expect(network).not.toHaveBeenCalled(); network.mockRestore();
  });
  it('rejects the old first-answer assumption and settles expiration once', async () => {
    let time = 1000;
    const question = {...newTriviaRiff().questions[0], correctIndex: 3};
    const play = createPlaytestRequest(0, () => time, 20, {question});
    const start = await play('start');
    expect((await play('answer', {roundId: start.round!.id, optionId: '0'})).phase).toBe('lost');
    const expired = createPlaytestRequest(0, () => time, 20, {question});
    await expired('start'); time += 20000;
    expect((await expired()).phase).toBe('lost');
    expect((await expired()).balance).toBe(0);
  });
  it('carries a revealed daily question into the editor without carrying points or leaking an active answer', async () => {
    const play = createPlaytestRequest(0, () => 1000);
    const active = await play('start');
    expect(riffFromGame(active)).toEqual(newTriviaRiff());
    const answered = await play('answer', {roundId: active.round!.id, optionId: '0'});
    const riff = riffFromGame(answered);
    expect(riff.questions[0].question).toBe(answered.round!.question);
    expect(riff.questions[0].answers[0]).toBe(answered.round!.correctAnswer);
    expect(riff).not.toHaveProperty('balance');
  });
  it('keeps separate Riffs and the original daily playtest isolated', async () => {
    const edited = createPlaytestRequest(0, () => 1000, 20, {question: {...newTriviaRiff().questions[0], question: 'My edited question'}});
    const original = createPlaytestRequest(0, () => 1000);
    const start = await edited('start');
    await edited('answer', {roundId: start.round!.id, optionId: '0'});
    expect((await original()).balance).toBe(0);
    expect((await original('start')).round?.question).not.toBe('My edited question');
  });
  it('supports ordinary first-wheel settlement and Super decline with random spins', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const custom = {question: newTriviaRiff().questions[0], randomSpins: true};
    const play = createPlaytestRequest(0, () => 1000, 20, custom);
    const start = await play('start'), input = {roundId: start.round!.id, optionId: '0'};
    await play('answer', input);
    expect((await play('spin', input)).phase).toBe('complete');
    expect((await play('spin', input)).balance).toBe(150);
    random.mockReturnValue(.99);
    const superPlay = createPlaytestRequest(0, () => 1000, 20, custom);
    const second = await superPlay('start'), next = {roundId: second.round!.id, optionId: '0'};
    await superPlay('answer', next);
    expect((await superPlay('spin', next)).phase).toBe('super');
    expect((await superPlay('decline', next)).balance).toBe(750);
    expect((await superPlay('super', next)).balance).toBe(750);
    random.mockRestore();
  });
});
