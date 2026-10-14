import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { easeOutCubic, lerpArray } from './tween';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(QUERY);
      m.addEventListener('change', onChange);
      return () => m.removeEventListener('change', onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Smoothly animates from the previous values to `target`. Jumps instantly under reduced motion. */
export function useTween(target: number[], durationMs = 450): number[] {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const key = target.join(',');

  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = lerpArray(from, target, easeOutCubic(t));
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `key` stands in for `target`, which is a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reduced, durationMs]);

  return value;
}

/** Reveals `text` one character at a time whenever it changes. */
export function useTypewriter(text: string, msPerChar = 35): string {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(text.length);
  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(timer);
    }, msPerChar);
    return () => clearInterval(timer);
  }, [text, reduced, msPerChar]);
  return text.slice(0, count);
}
