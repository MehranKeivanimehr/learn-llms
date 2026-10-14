import { useEffect, useId, useRef, useState } from 'react';
import '../styles/viz.css';

interface Props {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onCommit: (value: number) => void;
  format?: (value: number) => string;
}

/**
 * A range input plus − / + buttons. It reports a value once per release (or per button press),
 * so one drag = one move.
 */
export function KnobSlider({ label, min, max, step, value, onCommit, format = String }: Props) {
  const [draft, setDraft] = useState(value);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef({ value, onCommit });
  latest.current = { value, onCommit };
  useEffect(() => setDraft(value), [value]);

  const decimals = (String(step).split('.')[1] ?? '').length;
  const snap = (v: number) =>
    Number(Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min)).toFixed(decimals));
  const commit = (v: number) => {
    const next = snap(v);
    if (next !== latest.current.value) latest.current.onCommit(next);
    else setDraft(latest.current.value);
  };

  // React's onChange fires on every "input" event. The native "change" event fires once per
  // release on every platform, including touch drags that end in pointercancel.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onNativeChange = () => commit(Number(el.value));
    el.addEventListener('change', onNativeChange);
    return () => el.removeEventListener('change', onNativeChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="knob">
      <label htmlFor={id}>
        {label}: <output htmlFor={id}>{format(draft)}</output>
      </label>
      <div className="knob-row">
        <button type="button" className="knob-step" aria-label={`Decrease ${label}`} onClick={() => commit(latest.current.value - step)}>
          −
        </button>
        <input
          ref={inputRef}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(e) => setDraft(Number(e.currentTarget.value))}
          onPointerUp={(e) => commit(Number(e.currentTarget.value))}
          onKeyUp={(e) => commit(Number(e.currentTarget.value))}
          onBlur={(e) => commit(Number(e.currentTarget.value))}
        />
        <button type="button" className="knob-step" aria-label={`Increase ${label}`} onClick={() => commit(latest.current.value + step)}>
          +
        </button>
      </div>
    </div>
  );
}
