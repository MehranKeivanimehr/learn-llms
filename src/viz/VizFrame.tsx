import { useState, type ReactNode } from 'react';
import '../styles/viz.css';
import { DataTable, type TableData } from './DataTable';

export function VizFrame({ title, table, children }: { title: string; table: TableData; children: ReactNode }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <figure className="viz">
      <figcaption>
        <span>{title}</span>
        <button type="button" className="link-button" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
          {asTable ? 'View as chart' : 'View as table'}
        </button>
      </figcaption>
      {asTable ? <DataTable {...table} /> : children}
    </figure>
  );
}
