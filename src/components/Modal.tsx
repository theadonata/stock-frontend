import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Shared popup used by every "add a record" form (Products, Sales, Stock,
// Expenses) -- pages now show a table/list first and an action button that
// opens this instead of an always-visible inline form, so the primary
// screen stays scannable and the form only appears when someone actually
// wants to add something.
export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Callers pass onClose as an inline arrow function, so its identity
  // changes on every render of the parent (e.g. every keystroke in the
  // form, since that updates state there too). Stashing the latest one in
  // a ref -- instead of putting it in the effect's dependency array below --
  // means the effect only re-runs on an actual isOpen transition, not on
  // every parent re-render. Without this, the effect re-ran on every
  // keystroke and re-focused the dialog container, yanking focus out of
  // whichever field the user was typing into.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Escape closes the modal, matching standard dialog behavior.
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);

    // Move focus into the dialog on open (screen readers land here) and
    // lock background scroll while it's open -- both standard modal
    // behaviors that are easy to forget and break accessibility/UX if
    // skipped. This only runs once per open/close transition (see the ref
    // comment above), not on every keystroke inside the form.
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-0 pb-0 md:items-center md:px-4 md:pb-4">
      {/* Backdrop -- clicking it closes the modal, same as Escape. */}
      <div className="absolute inset-0 bg-ink/50" aria-hidden="true" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-2xl border-t-2 border-t-brass/40 bg-white p-5 shadow-card
          focus:outline-none md:max-w-md md:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-base font-bold uppercase tracking-wide text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-stone
              hover:bg-canvas hover:text-ink
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
