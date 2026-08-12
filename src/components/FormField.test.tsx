import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./FormField";

// FormField underlies every data-entry form in the app, so its
// label-association and error-announcement behavior (both accessibility
// requirements from the spec) get direct coverage here rather than only
// being exercised indirectly through page-level tests.
describe("FormField", () => {
  it("associates the label with the input via htmlFor/id", () => {
    render(<FormField label="Quantity" name="quantity" value="" onChange={() => {}} />);
    const input = screen.getByLabelText("Quantity");
    expect(input).toBeInTheDocument();
  });

  it("shows an inline error message when provided", () => {
    render(
      <FormField label="Amount" name="amount" value="" onChange={() => {}} error="Amount is required." />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Amount is required.");
    expect(screen.getByLabelText("Amount")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not render an error element when there is no error", () => {
    render(<FormField label="Note" name="note" value="" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
