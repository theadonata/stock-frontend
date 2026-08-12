import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Deletion is destructive and can't be undone, so every "Delete" row action
// routes through this instead of firing the request straight from the
// table -- one extra deliberate tap, with the record's own description in
// the message so it's clear exactly what's about to go away.
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onCancel}>
      <p className="mb-5 text-sm text-stone-dark">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? "Deleting..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
