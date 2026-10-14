export interface TableData {
  columns: string[];
  rows: (string | number)[][];
}

export function DataTable({ columns, rows, caption }: TableData & { caption?: string }) {
  return (
    <div className="scroll-x">
      <table className="data-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{typeof cell === 'number' ? cell.toFixed(3) : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
