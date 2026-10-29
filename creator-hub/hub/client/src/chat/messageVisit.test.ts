import { expect, test, vi } from 'vitest';
import { createMessageVisit } from './messageVisit';

test('polls, searches and channel changes share one boundary until a new visit', async () => {
  const read = vi.fn().mockResolvedValueOnce('2026-10-29 12:00:00.123456+00').mockResolvedValueOnce('2026-10-29 12:01:00.654321+00');
  const visit = createMessageVisit(read);
  const [first, second] = await Promise.all([visit.start('guest-one'), visit.start('guest-one')]);
  expect(first).toBe(second);
  expect(await visit.start('guest-one')).toBe(first);
  expect(read).toHaveBeenCalledTimes(1);
  expect(await createMessageVisit(read).start('guest-one')).not.toBe(first);
});

test('failed or invalid boundaries retry without falling back to old history', async () => {
  const read = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce('bad').mockResolvedValueOnce('2026-10-29T12:00:00Z');
  const visit = createMessageVisit(read);
  await expect(visit.start('guest-one')).rejects.toThrow('Offline');
  await expect(visit.start('guest-one')).rejects.toThrow('fresh view');
  await expect(visit.start('guest-one')).resolves.toBe('2026-10-29T12:00:00Z');
});

test('changing guest accounts starts a separate view', async () => {
  const read = vi.fn().mockResolvedValueOnce('2026-10-29T12:00:00Z').mockResolvedValueOnce('2026-10-29T12:01:00Z');
  const visit = createMessageVisit(read);
  expect(await visit.start('guest-two')).not.toBe(await visit.start('guest-one'));
  expect(read).toHaveBeenCalledTimes(2);
});
