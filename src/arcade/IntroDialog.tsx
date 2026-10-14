import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { splitSlides, type Slide } from './slides';

interface Props {
  levelTitle: string;
  hasDemo: boolean;
  onClose: () => void;
  onDemo: () => void;
}

export function IntroDialog({ levelTitle, hasDemo, onClose, onDemo }: Props) {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const found = splitSlides(document.getElementById('lesson')?.innerHTML ?? '');
    setSlides(found.length ? found : [{ title: levelTitle, html: '' }]);
  }, [levelTitle]);

  if (!slides) return null;
  const slide = slides[index];
  const last = index === slides.length - 1;

  return (
    <Modal labelledBy="intro-title" onClose={onClose} fallbackFocusId="terminal-input">
      <div className="modal-head">
        <p className="slide-count">
          {levelTitle} · {index + 1} of {slides.length}
        </p>
        <button type="button" aria-label="Close lesson" onClick={onClose}>
          ×
        </button>
      </div>
      <h2 id="intro-title">{slide.title || levelTitle}</h2>
      <div className="prose" dangerouslySetInnerHTML={{ __html: slide.html }} />
      <div className="modal-actions">
        <button type="button" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
          ← Back
        </button>
        <span className="spacer" />
        {last && hasDemo && (
          <button type="button" onClick={onDemo}>
            Show me
          </button>
        )}
        <button type="button" className="primary" data-autofocus onClick={last ? onClose : () => setIndex((i) => i + 1)}>
          {last ? "Let's go" : 'Next →'}
        </button>
      </div>
    </Modal>
  );
}
