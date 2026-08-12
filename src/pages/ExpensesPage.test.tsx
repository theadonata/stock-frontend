import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExpensesPage } from "./ExpensesPage";
import { ToastProvider } from "../components/ToastProvider";

// Stub fetch so useExpenses' initial GET resolves to an empty list instead
// of hitting a real network -- keeps this a pure component/unit test of the
// form's client-side (inline) validation, which is what the spec's testing
// strategy asks for ("Vitest + Testing Library component tests for forms").
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderExpensesPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ExpensesPage />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("ExpensesPage form", () => {
  // The form now lives in a popup opened by the "+ Log expense" page-level
  // action button, rather than sitting inline on the page -- both tests
  // open the modal first, then submit its "Log expense" button, which is a
  // second, differently-scoped element with the same accessible name.
  async function openModal(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /\+ log expense/i }));
    return screen.getByRole("dialog", { name: /log an expense/i });
  }

  it("shows inline validation errors instead of submitting when required fields are empty", async () => {
    const user = userEvent.setup();
    renderExpensesPage();

    const dialog = await openModal(user);
    await user.click(within(dialog).getByRole("button", { name: /^log expense$/i }));

    // Submitting the empty form should surface field-level errors rather
    // than firing a network request -- fetch should only have been called
    // once, for the initial GET /expenses list on mount.
    expect(await screen.findByText("Category is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter an amount greater than 0.")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("clears the category error once the user fills it in and resubmits with other fields still invalid", async () => {
    const user = userEvent.setup();
    renderExpensesPage();

    const dialog = await openModal(user);
    await user.click(within(dialog).getByRole("button", { name: /^log expense$/i }));
    await screen.findByText("Category is required.");

    await user.type(screen.getByLabelText("Category"), "Rent");
    await user.click(within(dialog).getByRole("button", { name: /^log expense$/i }));

    expect(screen.queryByText("Category is required.")).not.toBeInTheDocument();
    // Amount was still left blank, so that error should remain.
    expect(screen.getByText("Enter an amount greater than 0.")).toBeInTheDocument();
  });
});
