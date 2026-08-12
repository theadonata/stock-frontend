import { useState } from "react";
import { usePnL } from "../hooks/usePnL";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency } from "../lib/format";

// Default period: the current month, in the "YYYY-MM" shape the backend's
// /reports/pnl endpoint expects. Gives a useful report on first load instead
// of an empty state, while still letting the owner pick any other month.
function currentMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

// P&L (Laba Rugi) is computed on demand by the backend for a single given
// month -- never stored -- so this page is just a month picker driving the
// usePnL query.
export function ReportsPage() {
  const [period, setPeriod] = useState(currentMonth());

  const pnlQuery = usePnL(period);
  const pnl = pnlQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" subtitle="Laba Rugi -- profit & loss for a chosen month" />

      <Card>
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-stone-dark">
          Profit &amp; loss period
        </h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="period" className="text-sm font-medium text-ink">
            Month
          </label>
          {/* input type="month" produces "YYYY-MM" directly, matching the
              backend's single-month period format. */}
          <input
            id="period"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="min-h-[44px] w-full max-w-xs rounded-lg border border-stone-light bg-white px-3 py-2 font-mono text-base tabular-nums text-ink
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          />
        </div>
      </Card>

      {pnlQuery.isLoading && <p className="text-sm text-stone">Loading report...</p>}

      {pnl && (
        <Card>
          <dl className="flex flex-col gap-3">
            <PnLRow label="Total sales" value={pnl.total_sales} tone="positive" />
            <PnLRow label="COGS (HPP)" value={pnl.cogs} tone="negative" />
            <PnLRow label="Gross profit" value={pnl.gross_profit} tone="total" emphasize />
            <PnLRow label="Total expenses" value={pnl.total_expenses} tone="negative" />
            {/* The dashed brass rule (matching Card's stitch-line motif)
                sets the net profit line apart as the figure that matters
                most on this page. */}
            <div className="border-t-2 border-dashed border-brass/40 pt-3">
              <PnLRow label="Net profit" value={pnl.net_profit} tone="total" emphasize />
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

// A single labeled figure in the P&L breakdown, always rendered in tabular
// mono figures so the column of amounts lines up. `tone` maps to the app's
// income/expense color convention (moss = adds to profit, rust = subtracts);
// `total` uses ink since a subtotal isn't itself a "cost" or "income" line.
// `emphasize` bolds subtotal/total lines (gross and net profit) so they
// stand out from the line items feeding into them.
function PnLRow({
  label,
  value,
  tone,
  emphasize = false,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative" | "total";
  emphasize?: boolean;
}) {
  const toneClass = tone === "positive" ? "text-moss" : tone === "negative" ? "text-rust" : "text-ink";
  return (
    <div className="flex items-baseline justify-between">
      <dt className={`text-sm ${emphasize ? "font-semibold text-ink" : "text-stone-dark"}`}>{label}</dt>
      <dd className={`font-mono tabular-nums ${emphasize ? "text-base font-bold" : "text-sm"} ${toneClass}`}>
        {tone === "negative" ? `-${formatCurrency(value)}` : formatCurrency(value)}
      </dd>
    </div>
  );
}
