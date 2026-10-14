import { useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

interface Props {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  variant?: 'center' | 'drawer';
  /** Focus this element id after closing when the trigger was the page itself (desktop only). */
  fallbackFocusId?: string;
}

/** Accessible dialog: focus moves in, Tab cycles inside, Escape closes, focus returns. */
export function Modal({ labelledBy, onClose, children, variant = 'center', fallbackFocusId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    (el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !el.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && previous !== document.body && document.contains(previous)) previous.focus();
      else if (fallbackFocusId && window.matchMedia('(min-width: 900px)').matches) {
        document.getElementById(fallbackFocusId)?.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (variant === 'drawer') {
    return (
      <>
        <div className="drawer-backdrop" onClick={() => closeRef.current()} />
        <div ref={ref} className="drawer" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
          {children}
        </div>
      </>
    );
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
    >
      <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}
