import { useEffect, useId, useState } from 'react';
import { getProgressStore } from '../engine/progressStore';

export default function SiteMenu({ trackHref }: { trackHref: string }) {
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const id = useId();

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
