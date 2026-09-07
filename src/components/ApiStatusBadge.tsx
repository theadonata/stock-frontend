import { useApiHealth } from "../hooks/useApiHealth";

// Small, quiet status pill that renders the result of the backend's
// /healthz check -- the frontend-side half of STOCK-17's "boots and talks
// to the backend end-to-end" proof, surfaced somewhere a person actually
// looks (the dashboard) rather than a dedicated screen of its own.
export function ApiStatusBadge() {
  const { data, isLoading, isError } = useApiHealth();

  const online = !isLoading && !isError && data?.status === "ok";
  const label = isLoading ? "Checking API..." : online ? "API online" : "API unreachable";
  const dotColor = isLoading ? "bg-stone" : online ? "bg-moss" : "bg-rust";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-light bg-white px-2.5 py-1 text-xs font-medium text-stone">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
