import { useLayoutEffect, useRef } from "react";

// Live thousand-separated number input, used for every amount/price/quantity
// field (purchase price, sale/expense amounts, stock quantity). A plain
// type="number" input can't display grouping separators at all (browsers
// strip anything that isn't a digit/./-), so this renders as text +
// inputMode="decimal" (still brings up the numeric keypad on mobile) and
// does the grouping/parsing itself -- formatting as "1.500.000" while
// typing, matching the same id-ID grouping formatCurrency() already uses
// everywhere else in the app.
//
// Whole numbers only, deliberately: every amount in this app is already
// displayed with zero decimal places (see formatCurrency's
// maximumFractionDigits: 0) and stock quantities are whole units (pcs,
// roll), so there's no real case for decimals here. Restricting to digits
// also removes a nasty ambiguity that a decimal-supporting version of this
// hit -- once a grouping dot is echoed back into the input's own value,
// re-parsing the whole string on the next keystroke can't tell that dot
// apart from a real decimal point the user typed, and silently truncates
// everything after it. Digits-only sidesteps the problem entirely.
interface NumberFieldProps {
  label: string;
  name: string;
  value: string; // plain digit string, e.g. "1500000" -- no separators
  onChange: (raw: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
}

function parseTypedValue(text: string): string {
  let cleaned = "";
  for (const char of text) {
    if (char >= "0" && char <= "9") cleaned += char;
  }
  return cleaned;
}

// id-ID thousand grouping (dots), e.g. raw "1500000" -> "1.500.000".
function formatDisplayValue(raw: string): string {
  if (!raw) return "";
  return Number(raw).toLocaleString("id-ID");
}

function countDigits(text: string): number {
  let count = 0;
  for (const char of text) {
    if (char >= "0" && char <= "9") count++;
  }
  return count;
}

// Finds the character index in `formatted` right after the Nth digit --
// used to translate a caret position from what the user just typed into the
// equivalent spot in the freshly-regrouped display, since the number of
// grouping dots before the caret can change on every keystroke (typing the
// 4th digit of "999" -> "9.999" inserts a dot before where the caret was).
function caretIndexForDigitCount(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] >= "0" && formatted[i] <= "9") {
      count++;
      if (count === digitCount) return i + 1;
    }
  }
  return formatted.length;
}

export function NumberField({ label, name, value, onChange, error, hint, placeholder }: NumberFieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const inputRef = useRef<HTMLInputElement>(null);
  // Digit count before the caret at the moment of the last keystroke -- set
  // synchronously in onChange, then consumed once in the layout effect
  // below to restore the caret to the equivalent spot in the newly
  // regrouped display, before the browser paints.
  const pendingCaretDigitCount = useRef<number | null>(null);

  const displayValue = formatDisplayValue(value);

  useLayoutEffect(() => {
    if (pendingCaretDigitCount.current === null || !inputRef.current) return;
    const pos = caretIndexForDigitCount(displayValue, pendingCaretDigitCount.current);
    inputRef.current.setSelectionRange(pos, pos);
    pendingCaretDigitCount.current = null;
  }, [displayValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const caretPos = e.target.selectionStart ?? e.target.value.length;
    pendingCaretDigitCount.current = countDigits(e.target.value.slice(0, caretPos));
    onChange(parseTypedValue(e.target.value));
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-[44px] rounded-lg border bg-white px-3 py-2 font-mono text-base tabular-nums text-ink
          placeholder:text-stone placeholder:font-sans
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass
          ${error ? "border-rust" : "border-stone-light"}`}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-stone">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-rust">
          {error}
        </p>
      )}
    </div>
  );
}
