import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { NumberField } from "./NumberField";

// Thin wrapper so the test can observe both what's displayed (grouped) and
// the underlying raw value NumberField reports back via onChange.
function Harness({ onRawChange }: { onRawChange?: (raw: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <NumberField
      label="Amount"
      name="amount"
      value={value}
      onChange={(raw) => {
        setValue(raw);
        onRawChange?.(raw);
      }}
    />
  );
}

describe("NumberField", () => {
  it("groups digits with thousand separators as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Amount"), "1500000");

    // Regression coverage: an earlier version re-parsed the *whole* input
    // value on every keystroke, including the grouping dots it had just
    // echoed back into the field -- which got misread as a decimal point
    // and silently truncated every digit typed after the 4th one. This
    // asserts all 7 digits survive, not just the truncated "1,500000".
    expect(screen.getByLabelText("Amount")).toHaveValue("1.500.000");
  });

  it("reports a plain unformatted digit string to onChange, not the grouped display", async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    render(<Harness onRawChange={(raw) => seen.push(raw)} />);

    await user.type(screen.getByLabelText("Amount"), "2500");

    // The last reported raw value is what Number() elsewhere in the app
    // would consume -- it must never contain the grouping dots shown on
    // screen, or every amount field's validation/submission would break.
    expect(seen[seen.length - 1]).toBe("2500");
  });

  it("ignores non-digit characters typed into the field", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Amount"), "12abc34,5");

    expect(screen.getByLabelText("Amount")).toHaveValue("12.345");
  });

  it("keeps the caret in the right place after a grouping separator is inserted mid-type", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByLabelText<HTMLInputElement>("Amount");
    // "1000" formats to "1.000" (a dot inserted after the first digit) --
    // typing one more "0" should extend the number to "10.000", not get
    // swallowed or inserted at a stale caret offset.
    await user.type(input, "10000");

    expect(input).toHaveValue("10.000");
  });
});
