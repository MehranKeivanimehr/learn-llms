interface Props {
  context: string[];
  vocab: string[];
  maxWords: number;
  onAdd: (word: string) => void;
  onRemove: (index: number) => void;
}

export function ContextEditor({ context, vocab, maxWords, onAdd, onRemove }: Props) {
  const full = context.length >= maxWords;
  return (
    <div className="context-editor">
      <p className="label">Context</p>
      <ul className="chips" aria-label="Context words">
        {context.map((w, i) => (
          <li key={`${w}-${i}`} className="chip">
            {w}
            <button type="button" aria-label={`Remove ${w}`} onClick={() => onRemove(i)}>
              ×
            </button>
          </li>
        ))}
        {context.length === 0 && <li className="muted">(empty)</li>}
      </ul>
      <p className="label">Add a word{full && <span className="muted"> — the context is full</span>}</p>
      <div className="chip-palette">
        {vocab.map((w) => (
          <button type="button" key={w} className="chip-button" aria-label={`Add ${w}`} disabled={full} onClick={() => onAdd(w)}>
            + {w}
          </button>
        ))}
      </div>
    </div>
  );
}
