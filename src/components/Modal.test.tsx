import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

// Regression test for a real bug: Modal's onClose prop is always a fresh
// inline arrow function from the caller, so its identity changes on every
// parent re-render (e.g. every keystroke in a controlled input, since that
// updates the parent's state too). The dialog's focus-on-open effect must
// not treat that as a new "open" transition, or it steals focus back to the
// dialog container mid-typing -- which is exactly what happened in the
// Sales form's "Revenue source" field before this was fixed.
function TestHarness() {
  const [isOpen, setIsOpen] = useState(true);
  const [value, setValue] = useState("");
  return (
    <Modal title="Test form" isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <label htmlFor="field">Field</label>
      <input id="field" value={value} onChange={(e) => setValue(e.target.value)} />
    </Modal>
  );
}

describe("Modal", () => {
  it("does not steal focus away from an input while the user is typing", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    const input = screen.getByLabelText("Field");
    // Typing multiple characters triggers a parent re-render (and therefore
    // a new onClose reference) after each keystroke -- if the dialog
    // re-focuses itself on every render, this text won't land in the field.
    await user.type(input, "Hello");

    expect(input).toHaveValue("Hello");
    expect(input).toHaveFocus();
  });
});
