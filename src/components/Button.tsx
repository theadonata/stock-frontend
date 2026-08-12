import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

// Single shared Button so tap-target size and focus styling are defined once.
// min-h-[44px] satisfies the spec's "large tap targets (>=44px)" requirement
// for one-handed warehouse-floor entry; focus-visible ring covers the
// accessibility baseline ("focus states visible"). Primary uses the brass
// accent color -- the one accent this app spends its "boldness" on.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brass text-white shadow-card hover:bg-brass-dark active:bg-brass-dark",
  secondary:
    "bg-white text-ink border border-stone-light hover:bg-canvas active:bg-stone-light/40",
  danger: "bg-rust text-white hover:bg-rust-dark active:bg-rust-dark",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass
        disabled:cursor-not-allowed disabled:opacity-50
        ${fullWidth ? "w-full" : ""}
        ${VARIANT_CLASSES[variant]}
        ${className}`}
      disabled={disabled}
      {...rest}
    />
  );
}
