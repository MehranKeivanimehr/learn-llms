import { describe, expect, it, vi } from 'vitest';
import { createProgressStore, PROGRESS_KEY, type StorageLike } from '../../src/engine/progressStore';

class MemoryStorage implements StorageLike {
  map = new Map<string, string>();
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

describe('progress store', () => {
  it('starts empty with no notice', () => {
    const s = createProgressStore(new MemoryStorage());
    expect(s.get()).toEqual({ version: 1, levels: {} });
    expect(s.notice).toBeNull();
    expect(s.persistent).toBe(true);
    expect(s.level('inside-1')).toEqual({ solved: false });
  });

  it('markSolved saves and keeps the lowest move count', () => {
    const storage = new MemoryStorage();
    const s = createProgressStore(storage);
    s.markSolved('inside-1', 5);
    s.markSolved('inside-1', 3);
    s.markSolved('inside-1', 4);
    expect(s.level('inside-1')).toEqual({ solved: true, bestMoves: 3 });
    expect(JSON.parse(storage.getItem(PROGRESS_KEY)!)).toEqual({
      version: 1,
      levels: { 'inside-1': { solved: true, bestMoves: 3 } },
    });
  });

  it('markSolved with null moves records no best score', () => {
    const s = createProgressStore(new MemoryStorage());
    s.markSolved('inside-2', null);
    expect(s.level('inside-2')).toEqual({ solved: true });
  });

  it('markChallengePassed keeps the other fields', () => {
    const s = createProgressStore(new MemoryStorage());
    s.markSolved('inside-1', 2);
    s.markChallengePassed('inside-1');
    expect(s.level('inside-1')).toEqual({ solved: true, bestMoves: 2, challengePassed: true });
  });

  it('loads saved progress', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, levels: { 'inside-1': { solved: true, bestMoves: 2 } } }));
    expect(createProgressStore(storage).level('inside-1')).toEqual({ solved: true, bestMoves: 2 });
  });

  it('resets corrupt saved data and explains why', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_KEY, '{not json');
    const s = createProgressStore(storage);
    expect(s.get().levels).toEqual({});
    expect(s.notice).toMatch(/could not be read/);
    expect(storage.getItem(PROGRESS_KEY)).toBeNull();
  });

  it('resets an unknown version', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_KEY, JSON.stringify({ version: 2, levels: {} }));
    expect(createProgressStore(storage).notice).toMatch(/could not be read/);
  });

  it('works in memory when storage throws (private browsing)', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {},
    };
    const s = createProgressStore(storage);
    expect(s.persistent).toBe(false);
    expect(s.notice).toMatch(/won't be saved/);
    s.markSolved('inside-1', 2);
    expect(s.level('inside-1').solved).toBe(true);
  });

  it('works in memory with no storage at all', () => {
    const s = createProgressStore(null);
    expect(s.persistent).toBe(false);
    s.markSolved('inside-1', 1);
    expect(s.level('inside-1').solved).toBe(true);
  });

  it('switches to memory-only when a write fails (full quota)', () => {
    const storage = new MemoryStorage();
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    const s = createProgressStore(storage);
    expect(s.persistent).toBe(true);
    s.markSolved('inside-1', 1);
    expect(s.persistent).toBe(false);
    expect(s.notice).toMatch(/won't be saved/);
    expect(s.level('inside-1').solved).toBe(true);
  });

  it('export and import round-trip, ignoring surrounding whitespace', () => {
    const a = createProgressStore(new MemoryStorage());
    a.markSolved('inside-3', 4);
    const b = createProgressStore(new MemoryStorage());
    expect(b.importString(`\n  ${a.exportString()}  \n`)).toEqual({ ok: true });
    expect(b.get()).toEqual(a.get());
  });

  it.each([
    ['not base64 !!!'],
    [btoa('[]')],
    [btoa(JSON.stringify({ version: 1, levels: [] }))],
    [btoa(JSON.stringify({ version: 1, levels: { x: { solved: 'yes' } } }))],
    [btoa(JSON.stringify({ version: 1, levels: { x: { solved: true, bestMoves: -1 } } }))],
  ])('rejects the bad import code %s without touching progress', (code) => {
    const s = createProgressStore(new MemoryStorage());
    s.markSolved('inside-1', 2);
    const before = s.get();
    const result = s.importString(code);
    expect(result.ok).toBe(false);
    expect(s.get()).toBe(before);
  });

  it('resetAll clears everything', () => {
    const s = createProgressStore(new MemoryStorage());
    s.markSolved('inside-1', 1);
    s.resetAll();
    expect(s.get()).toEqual({ version: 1, levels: {} });
  });

  it('notifies subscribers until they unsubscribe', () => {
    const s = createProgressStore(new MemoryStorage());
    const fn = vi.fn();
    const off = s.subscribe(fn);
    s.markSolved('inside-1', 1);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    s.markSolved('inside-1', 1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('dismissNotice clears the notice', () => {
    const s = createProgressStore(null);
    s.dismissNotice();
    expect(s.notice).toBeNull();
  });

  it('markExam keeps the best exam score and the other fields', () => {
    const s = createProgressStore(new MemoryStorage());
    s.markSolved('inside-1', 2);
    s.markExam('inside-1', 3);
    s.markExam('inside-1', 5);
    s.markExam('inside-1', 4);
    expect(s.level('inside-1')).toEqual({ solved: true, bestMoves: 2, examBest: 5 });
  });

  it('a level can have an exam score without being solved', () => {
    const s = createProgressStore(new MemoryStorage());
    s.markExam('inside-2', 1);
    expect(s.level('inside-2')).toEqual({ solved: false, examBest: 1 });
  });

  it.each([[-1], [1.5], ['5']])('rejects an imported exam score of %s', (bad) => {
    const s = createProgressStore(new MemoryStorage());
    const code = btoa(JSON.stringify({ version: 1, levels: { x: { solved: true, examBest: bad } } }));
    expect(s.importString(code).ok).toBe(false);
  });
});
