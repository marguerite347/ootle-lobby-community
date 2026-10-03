import { describe, expect, test } from 'vitest';
import {
  STORAGE_KEYS,
  ensureClientId,
  mergeCommunityMessages,
  nextTabIndex,
  readDockPreference,
  readReportedIds,
  writeReportedIds,
  writeStoredValue,
  type KeyValueStorage,
} from './chatSidebarState';

function memoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

const throwingStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

const message = (id: string) => ({ id, at: '2026-09-24T12:00:00Z', name: 'Ada', body: id });

describe('dock preference', () => {
  test('defaults to collapsed and remembers open', () => {
    const storage = memoryStorage();
    expect(readDockPreference(storage)).toBe('collapsed');
    writeStoredValue(storage, STORAGE_KEYS.dock, 'open');
    expect(readDockPreference(storage)).toBe('open');
  });

  test('survives storage that throws', () => {
    expect(readDockPreference(throwingStorage)).toBe('collapsed');
    expect(() => writeStoredValue(throwingStorage, STORAGE_KEYS.dock, 'open')).not.toThrow();
    expect(readDockPreference(undefined)).toBe('collapsed');
  });
});

describe('client id and reports', () => {
  test('client id is created once and reused', () => {
    const storage = memoryStorage();
    const first = ensureClientId(storage);
    expect(first).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
    expect(ensureClientId(storage)).toBe(first);
    expect(ensureClientId(throwingStorage)).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
  });

  test('reported ids round-trip and ignore corrupt data', () => {
    const storage = memoryStorage();
    writeReportedIds(storage, new Set(['a', 'b']));
    expect([...readReportedIds(storage)]).toEqual(['a', 'b']);
    writeStoredValue(storage, STORAGE_KEYS.reportedIds, '{not json');
    expect(readReportedIds(storage).size).toBe(0);
  });
});

describe('mergeCommunityMessages', () => {
  test('appends new messages without duplicates', () => {
    const merged = mergeCommunityMessages([message('1'), message('2')], [message('2'), message('3')], [], false);
    expect(merged.map((item) => item.id)).toEqual(['1', '2', '3']);
  });

  test('drops removed ids and replaces on reset', () => {
    expect(mergeCommunityMessages([message('1'), message('2')], [], ['1'], false).map((item) => item.id)).toEqual(['2']);
    expect(mergeCommunityMessages([message('1')], [message('9')], [], true).map((item) => item.id)).toEqual(['9']);
  });

  test('caps rendered history', () => {
    const many = Array.from({ length: 250 }, (_, index) => message(String(index)));
    const merged = mergeCommunityMessages([], many, [], false);
    expect(merged).toHaveLength(200);
    expect(merged.at(-1)?.id).toBe('249');
  });
});

test('nextTabIndex wraps arrows and jumps with Home/End', () => {
  expect(nextTabIndex('ArrowRight', 1, 2)).toBe(0);
  expect(nextTabIndex('ArrowLeft', 0, 2)).toBe(1);
  expect(nextTabIndex('Home', 1, 2)).toBe(0);
  expect(nextTabIndex('End', 0, 2)).toBe(1);
  expect(nextTabIndex('Enter', 0, 2)).toBeNull();
});
