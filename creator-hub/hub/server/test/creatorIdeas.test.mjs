import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weeklyIdeas,readInsightLog} from '../creatorIdeas.mjs';
const now = new Date('2026-09-23T12:00:00Z');
test('same week is stable across refresh; next Monday rotates without generation', () => {
  const log=readInsightLog();
  const first=weeklyIdeas(log,now);
  assert.deepEqual(first,weeklyIdeas(log,new Date('2026-09-27T23:59:59Z')));
  assert.equal(first.weekOf,'2026-09-21');
  assert.equal(first.nextWeek,'2026-09-28');
  assert.notDeepEqual(first.ideas.map(i=>i.id),weeklyIdeas(log,new Date('2026-09-28T00:00:00Z')).ideas.map(i=>i.id));
  assert.match(first.ideas[0].brief,/Evidence: https:/);
});
test('reject unreviewed, future, expired and irrelevant entries', () => {
  const log=readInsightLog(); const base=log.entries[0];
  log.entries=[{...base,status:'draft'},{...base,reviewedAt:'2027-01-01'},{...base,expiresAt:'2026-09-22'},{...base,goalIds:['retired']}];
  assert.equal(weeklyIdeas(log,now).ideas.length,0);
  log.entries=[base]; log.goals=log.goals.map(g=>({...g,active:false}));
  assert.equal(weeklyIdeas(log,now).ideas.length,0);
});
test('review expiry yields an honest empty state instead of recycling stale claims',()=>{
  assert.equal(weeklyIdeas(readInsightLog(),new Date('2027-01-01')).ideas.length,0);
});
