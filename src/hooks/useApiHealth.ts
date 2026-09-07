import { useQuery } from "@tanstack/react-query";
import { HealthApi } from "../api/resources";

// Backs the small "API status" indicator on the dashboard -- lets someone
// booting the app locally for the first time confirm the frontend can
// actually reach the backend's /healthz endpoint, before any auth-gated
// data has loaded. Polled rather than fetched once so a backend restart
// during a dev session is reflected without a manual page reload.
export function useApiHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: HealthApi.check,
    retry: false,
    refetchInterval: 30_000,
  });
}
