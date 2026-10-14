export const PROGRESS_KEY = 'learnllms.progress';

export interface LevelProgress {
  solved: boolean;
  bestMoves?: number;
  challengePassed?: boolean;
}

export interface Progress {
  version: 1;
  levels: Record<string, LevelProgress>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ProgressStore {
  get(): Progress;
  level(id: string): LevelProgress;
  markSolved(id: string, moves: number | null): void;
  markChallengePassed(id: string): void;
  exportString(): string;
  importString(code: string): { ok: true } | { ok: false; error: string };
  resetAll(): void;
  readonly persistent: boolean;
  readonly notice: string | null;
  dismissNotice(): void;
  subscribe(fn: () => void): () => void;
}

const CORRUPT_NOTICE = 'Your saved progress could not be read, so it was reset.';
const MEMORY_NOTICE =
  "Your browser isn't letting this site save data, so your progress won't be saved after you close this tab.";

const emptyProgress = (): Progress => ({ version: 1, levels: {} });

export function parseProgress(raw: unknown): Progress | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) return null;
  if (typeof r.levels !== 'object' || r.levels === null || Array.isArray(r.levels)) return null;
  const levels: Record<string, LevelProgress> = {};
  for (const [id, value] of Object.entries(r.levels as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    const l = value as Record<string, unknown>;
    if (typeof l.solved !== 'boolean') return null;
    const entry: LevelProgress = { solved: l.solved };
    if (l.bestMoves !== undefined) {
      if (typeof l.bestMoves !== 'number' || !Number.isInteger(l.bestMoves) || l.bestMoves < 0) return null;
      entry.bestMoves = l.bestMoves;
    }
    if (l.challengePassed !== undefined) {
      if (typeof l.challengePassed !== 'boolean') return null;
      entry.challengePassed = l.challengePassed;
    }
    levels[id] = entry;
  }
  return { version: 1, levels };
}

export function createProgressStore(storage: StorageLike | null): ProgressStore {
  let persistent = storage !== null;
  let notice: string | null = null;
  let data = emptyProgress();
  const listeners = new Set<() => void>();

  if (storage) {
    try {
      const raw = storage.getItem(PROGRESS_KEY);
      if (raw !== null) {
        let parsed: Progress | null = null;
        try {
          parsed = parseProgress(JSON.parse(raw));
        } catch {
          parsed = null;
        }
        if (parsed) {
          data = parsed;
        } else {
          notice = CORRUPT_NOTICE;
          storage.removeItem(PROGRESS_KEY);
        }
      }
    } catch {
      persistent = false;
    }
  }
  if (!persistent) notice = MEMORY_NOTICE;

  const emit = () => listeners.forEach((fn) => fn());

  function save() {
    if (persistent && storage) {
      try {
        storage.setItem(PROGRESS_KEY, JSON.stringify(data));
      } catch {
        persistent = false;
        notice = MEMORY_NOTICE;
      }
    }
    emit();
  }

  function setLevel(id: string, entry: LevelProgress) {
    data = { ...data, levels: { ...data.levels, [id]: entry } };
    save();
  }

  return {
    get: () => data,
    level: (id) => data.levels[id] ?? { solved: false },
    markSolved(id, moves) {
      const prev = data.levels[id] ?? { solved: false };
      const best =
        moves === null ? prev.bestMoves : prev.bestMoves === undefined ? moves : Math.min(prev.bestMoves, moves);
      const entry: LevelProgress = { ...prev, solved: true };
      if (best !== undefined) entry.bestMoves = best;
      setLevel(id, entry);
    },
    markChallengePassed(id) {
      const prev = data.levels[id] ?? { solved: false };
      setLevel(id, { ...prev, challengePassed: true });
    },
    exportString: () => btoa(JSON.stringify(data)),
    importString(code) {
      let parsed: Progress | null = null;
      try {
        parsed = parseProgress(JSON.parse(atob(code.trim())));
      } catch {
        parsed = null;
      }
      if (!parsed) return { ok: false, error: "That doesn't look like a Learn LLMs progress code." };
      data = parsed;
      save();
      return { ok: true };
    },
    resetAll() {
      data = emptyProgress();
      save();
    },
    get persistent() {
      return persistent;
    },
    get notice() {
      return notice;
    },
    dismissNotice() {
      notice = null;
      emit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

let singleton: ProgressStore | null = null;

/** Browser-only. Use inside effects, event handlers or useSyncExternalStore callbacks. */
export function getProgressStore(): ProgressStore {
  if (singleton) return singleton;
  let storage: StorageLike | null = null;
  try {
    storage = window.localStorage;
    const probe = '__learnllms_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
  } catch {
    storage = null;
  }
  singleton = createProgressStore(storage);
  return singleton;
}
