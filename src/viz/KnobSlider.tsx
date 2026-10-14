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

/** A range input that reports its value once per release, so one drag = one move. */
export function KnobSlider({ label, min, max, step, value, onCommit, format = String }: Props) {
  const [draft, setDraft] = useState(value);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // Latest value/onCommit for the native listener, which is attached once.
  const latest = useRef({ value, onCommit });
  latest.current = { value, onCommit };
  useEffect(() => setDraft(value), [value]);

  const commit = (raw: string) => {
    const v = Number(raw);
    if (v !== latest.current.value) latest.current.onCommit(v);
  };

  // React's onChange fires on every "input" event. The native "change" event fires once
  // per release on every platform, including touch drags that end in pointercancel.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onNativeChange = () => commit(el.value);
    el.addEventListener('change', onNativeChange);
    return () => el.removeEventListener('change', onNativeChange);
  }, []);

  return (
    <div className="knob">
      <label htmlFor={id}>
        {label}: <output htmlFor={id}>{format(draft)}</output>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(e) => setDraft(Number(e.currentTarget.value))}
        onPointerUp={(e) => commit(e.currentTarget.value)}
        onKeyUp={(e) => commit(e.currentTarget.value)}
        onBlur={(e) => commit(e.currentTarget.value)}
      />
    </div>
  );
}
