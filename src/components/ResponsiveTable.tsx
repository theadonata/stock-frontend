import type { ReactNode } from "react";
import { Card } from "./Card";

// Column definition: `header` labels the column (and the mobile card's
// field label), `cell` renders the value for a given row, and `key` gives
// React a stable identity for the cell across renders.
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  // Right-aligns numeric columns (amounts/quantities) in the desktop table --
  // purely a table-layout concern, so it doesn't affect the mobile cards.
  align?: "left" | "right";
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

// Reporting screens (P&L, inventory value, stock ledger) need to show
// tabular data on a phone without forcing horizontal scrolling. Rather than
// build each report page's own "table on desktop, cards on mobile" logic,
// this single component does it once: it renders a real <table> that's
// hidden below md (768px, the spec's desktop breakpoint) and a stacked list
// of <Card>s (one per row, each cell shown as a "label: value" line) that's
// hidden at md and above. Same data, same column config, two renderings.
export function ResponsiveTable<T>({ columns, rows, rowKey, emptyMessage = "No data yet." }: ResponsiveTableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-stone">{emptyMessage}</p>;
  }

  return (
    <div>
      {/* Desktop / tablet: full table, hidden on small screens. Right-aligned
          (numeric) columns get tabular mono figures so amounts/quantities
          line up in a straight column, like a real ledger. */}
      <div className="hidden overflow-x-auto rounded-xl border border-stone-light bg-white shadow-card md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-light bg-canvas text-left font-display uppercase tracking-wide text-stone-dark">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3 py-2.5 text-xs font-semibold ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-stone-light/60 last:border-0 hover:bg-canvas/60">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 text-ink ${col.align === "right" ? "text-right font-mono tabular-nums" : "text-left"}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per row, hidden at md and above */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <Card key={rowKey(row)}>
            <dl className="flex flex-col gap-1.5">
              {columns.map((col) => (
                <div key={col.key} className="flex items-baseline justify-between gap-3">
                  <dt className="font-display text-xs font-semibold uppercase tracking-wide text-stone">
                    {col.header}
                  </dt>
                  <dd className={`text-right text-sm text-ink ${col.align === "right" ? "font-mono tabular-nums" : ""}`}>
                    {col.cell(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
