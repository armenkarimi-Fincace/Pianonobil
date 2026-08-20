import type { ReactNode } from 'react';

export interface Column {
  head: ReactNode;
  width?: string;
  right?: boolean;
}

/**
 * The bordered, horizontally scrollable table. `table-layout: fixed` plus the
 * per-column widths is what keeps the numeric columns aligned down the page.
 */
export function DataTable({ columns, children }: { columns: Column[]; children: ReactNode }) {
  return (
    <div className="tbl">
      <table>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={c.right ? 'r' : undefined} style={c.width ? { width: c.width } : undefined}>
                {c.head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** The inline status pill. Unstyled by design — it inherits the surrounding text. */
export function Mark({ tone, children }: { tone?: 'ok' | 'u'; children: ReactNode }) {
  return <span className={'mark' + (tone ? ' ' + tone : '')}>{children}</span>;
}
