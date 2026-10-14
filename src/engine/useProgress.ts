import { useSyncExternalStore } from 'react';
import { getProgressStore, type Progress } from './progressStore';

const EMPTY: Progress = { version: 1, levels: {} };

export function useProgress(): Progress {
  return useSyncExternalStore(
    (onChange) => getProgressStore().subscribe(onChange),
    () => getProgressStore().get(),
    () => EMPTY,
  );
}
