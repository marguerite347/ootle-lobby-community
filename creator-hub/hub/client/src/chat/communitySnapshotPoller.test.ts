import {expect, test} from 'vitest';
import {createSnapshotPoller} from './communitySnapshotPoller';
import {mergeCommunityMessages} from './chatSidebarState';
const message = (id: string) => ({id, at:'2026-09-24T12:00:00Z', name:'Ada', body:id});
test('a local send invalidates an older read, serializes refresh, and retains unseen peers', async () => {
  const resolve: Array<(value: string[]) => void> = [];
  let shown = ['a'];
  const poller = createSnapshotPoller(() => new Promise<string[]>(done => resolve.push(done)), value => {shown=value;}, () => {});
  const pending = poller.refresh();
  shown.push('own');
  void poller.afterLocalWrite();
  void poller.refresh();
  expect(resolve).toHaveLength(1);
  resolve[0](['a','peer']);
  await Promise.resolve();
  expect(shown).toEqual(['a','own']);
  expect(resolve).toHaveLength(2);
  resolve[1](['a','peer','own']);
  await pending;
  expect(shown).toEqual(['a','peer','own']);
});
test('authoritative snapshots restore an earlier hidden message in server order', async () => {
  let current = [message('later')];
  const poller = createSnapshotPoller(async () => [message('restored'),message('later')], incoming => {
    current = mergeCommunityMessages(current, incoming, [], true);
  }, () => {});
  await poller.refresh();
  expect(current.map(item=>item.id)).toEqual(['restored','later']);
});
