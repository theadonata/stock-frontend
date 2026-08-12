// Small formatting helpers shared across report/list pages so currency and
// date display stay consistent (and so the "derived display value" logic
// the spec calls out for testing lives in one testable place).

export function formatCurrency(amount: number): string {
  // Indonesian Rupiah, matching the source spreadsheet's currency (this is a
  // bags/accessories business in Indonesia per the spec's background).
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Net profit = gross profit - total expenses. Pulled out as a pure function
// (rather than inlined in the Reports page) so it has a direct unit test --
// this is exactly the kind of "client-side derived display value" the
// testing strategy in the spec calls out.
export function computeNetProfit(grossProfit: number, totalExpenses: number): number {
  return grossProfit - totalExpenses;
}
