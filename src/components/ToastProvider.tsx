import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// Lightweight toast notification system -- deliberately not a dependency,
// per the spec's "a lightweight toast solution is fine -- no heavy library
// needed". Toasts are used for network/API failures; form validation errors
// are shown inline next to the field instead (see FormField).

interface Toast {
  id: number;
  message: string;
  variant: "error" | "success" | "info";
}

interface ToastContextValue {
  showToast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    // Auto-dismiss after 5s so failed-request toasts don't pile up while
    // staff keep working -- they're informational, not blocking.
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Top of the viewport, below the fixed mobile bottom nav's opposite
          edge -- placed at the top on both viewports (rather than bottom on
          mobile / top on desktop) so it's consistently the first thing seen
          regardless of device, and never overlaps the bottom nav bar. */}
      <div
        className="fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`w-full max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.variant === "error"
                ? "bg-rust"
                : t.variant === "success"
                  ? "bg-moss"
                  : "bg-ink-soft"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 leading-none opacity-80 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Throws loudly if used outside the provider -- catches wiring mistakes at
// dev time rather than silently no-op-ing toasts in production.
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
