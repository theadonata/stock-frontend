import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiStatusBadge } from "./ApiStatusBadge";

function renderBadge() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ApiStatusBadge />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ApiStatusBadge", () => {
  it("renders 'API online' once /healthz resolves with status ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: "ok" }),
      }),
    );

    renderBadge();

    expect(await screen.findByText("API online")).toBeInTheDocument();
  });

  it("renders 'API unreachable' when the health check fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      }),
    );

    renderBadge();

    expect(await screen.findByText("API unreachable")).toBeInTheDocument();
  });
});
