import { useQuery } from "@tanstack/react-query";
import { ReportsApi } from "../api/resources";

// P&L is computed server-side on demand (never stored), so this is a
// straightforward params-keyed query -- re-fetches whenever the selected
// period changes. Real backend takes a single "YYYY-MM" period string.
export function usePnL(period: string) {
  return useQuery({
    queryKey: ["pnl", period],
    queryFn: () => ReportsApi.pnl(period),
    enabled: Boolean(period),
  });
}
