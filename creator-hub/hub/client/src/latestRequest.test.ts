import { expect, test } from 'vitest';
import { latestRequest } from './latestRequest';
test('an edit invalidates pending validation and export responses immediately', () => {
  const gate=latestRequest(); const validation=gate.begin(); const exported=gate.snapshot();
  gate.invalidate();
  expect(validation()).toBe(false); expect(exported()).toBe(false);
});
test('a late old response cannot replace the latest validation or failure', async () => {
  const gate=latestRequest(); let resolveOld!: (s:string)=>void; let shown='';
  const old=gate.begin();
  const pending=new Promise<string>(r=>{resolveOld=r;}).then(v=>{if(old()) shown=v;});
  const fresh=gate.begin(); if(fresh()) shown='validation failed';
  resolveOld('valid'); await pending;
  expect(shown).toBe('validation failed');
});
