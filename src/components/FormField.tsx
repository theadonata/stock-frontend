import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

// Shared labeled input used by every data-entry form (sales, stock in/out,
// expenses). Bundles the <label htmlFor> + <input id> pairing required for
// accessible forms, plus an inline error slot -- per the spec, form
// validation errors are shown inline (not as toasts, which are reserved for
// network/API failures).
//
// type="number" with inputMode="decimal"/"numeric" (passed via props by
// callers) brings up the numeric keypad on mobile, which is the whole point
// of "numeric input types for quantities/amounts" in the spec.
export function FormField({ label, name, error, hint, className = "", ...rest }: FormFieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  // Number inputs get tabular mono figures too -- staff are typing amounts
  // and quantities into these fields, so the input should already look like
  // the ledger-style numbers it will become once saved.
  const isNumeric = rest.type === "number";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-[44px] rounded-lg border bg-white px-3 py-2 text-base text-ink
          placeholder:text-stone
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass
          ${isNumeric ? "font-mono tabular-nums" : ""}
          ${error ? "border-rust" : "border-stone-light"}
          ${className}`}
        {...rest}
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
