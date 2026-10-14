import { useEffect, useId, useState } from 'react';
import { getProgressStore } from '../engine/progressStore';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'learnllms.theme';

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'system') delete root.dataset.theme;
  else root.dataset.theme = t;
  try {
    if (t === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, t);
  } catch {
    // Storage blocked: the theme still applies for this page view.
  }
}

const THEME_LABELS: Record<Theme, string> = { system: 'Match my device', light: 'Light', dark: 'Dark' };

export default function SiteMenu({ trackHref }: { trackHref: string }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [exported, setExported] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const id = useId();

  useEffect(() => setTheme(readTheme()), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function doImport() {
    const result = getProgressStore().importString(importText);
    setMessage(result.ok ? 'Progress imported.' : result.error);
    if (result.ok) setImportText('');
  }

  function doReset() {
    if (window.confirm('Erase all your progress? This cannot be undone.')) {
      getProgressStore().resetAll();
      setMessage('All progress was reset.');
    }
  }

  return (
    <div className="site-menu">
      <button type="button" aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen((o) => !o)}>
        ☰ Menu
      </button>
      {open && (
        <div id={`${id}-panel`} className="menu-panel">
          <a href={trackHref}>Level map</a>
          <fieldset>
            <legend>Theme</legend>
            {(Object.keys(THEME_LABELS) as Theme[]).map((t) => (
              <label key={t}>
                <input
                  type="radio"
                  name={`${id}-theme`}
                  checked={theme === t}
                  onChange={() => {
                    setTheme(t);
                    applyTheme(t);
                  }}
                />{' '}
                {THEME_LABELS[t]}
              </label>
            ))}
          </fieldset>
          <section>
            <h2>Your progress</h2>
            <button type="button" onClick={() => setExported(getProgressStore().exportString())}>
              Export progress
            </button>
            {exported !== null && (
              <>
                <label htmlFor={`${id}-export`}>Copy this code and keep it somewhere safe:</label>
                <textarea id={`${id}-export`} readOnly value={exported} rows={3} onFocus={(e) => e.currentTarget.select()} />
              </>
            )}
            <label htmlFor={`${id}-import`}>Paste a progress code to import:</label>
            <textarea id={`${id}-import`} value={importText} onChange={(e) => setImportText(e.target.value)} rows={3} />
            <button type="button" onClick={doImport} disabled={importText.trim() === ''}>
              Import progress
            </button>
            <button type="button" className="danger" onClick={doReset}>
              Reset all progress
            </button>
            {message && <p role="status">{message}</p>}
          </section>
        </div>
      )}
    </div>
  );
}
