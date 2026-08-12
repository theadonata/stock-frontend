import { useMemo } from "react";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { useSales } from "../hooks/useSales";
import { useExpenses } from "../hooks/useExpenses";
import { useInventoryLedger, computeCurrentStock } from "../hooks/useInventoryLedger";
import { formatCurrency } from "../lib/format";

// Landing page after login: a quick "how's the business doing right now"
// snapshot, cheaper than opening the full Reports screen. All figures are
// derived client-side from the same list endpoints the Sales/Expenses/Stock
// pages already use, so there's no separate "dashboard summary" backend
// endpoint to keep in sync.
export function DashboardPage() {
  const salesQuery = useSales();
  const expensesQuery = useExpenses();
  const ledgerQuery = useInventoryLedger();

  const totalSales = useMemo(
    () => (salesQuery.data ?? []).reduce((sum, s) => sum + s.amount, 0),
    [salesQuery.data],
  );
  const totalExpenses = useMemo(
    () => (expensesQuery.data ?? []).reduce((sum, e) => sum + e.amount, 0),
    [expensesQuery.data],
  );
  const stockByProduct = useMemo(
    () => computeCurrentStock(ledgerQuery.data ?? []),
    [ledgerQuery.data],
  );
  const totalUnitsInStock = useMemo(
    () => Object.values(stockByProduct).reduce((sum, qty) => sum + qty, 0),
    [stockByProduct],
  );

  const isLoading = salesQuery.isLoading || expensesQuery.isLoading || ledgerQuery.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Dashboard" subtitle="How the business is doing right now" />
      {isLoading ? (
        <p className="text-sm text-stone">Loading summary...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-stone">Total sales</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-moss">{formatCurrency(totalSales)}</p>
          </Card>
          <Card>
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-stone">Total expenses</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-rust">{formatCurrency(totalExpenses)}</p>
          </Card>
          <Card>
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-stone">Units in stock</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink">{totalUnitsInStock}</p>
          </Card>
        </div>
      )}
      <p className="text-sm text-stone">
        Use the Reports screen for a detailed profit &amp; loss breakdown by period.
      </p>
    </div>
  );
}
