import { useState, type FormEvent } from "react";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "../hooks/useExpenses";
import { ApiError } from "../api/client";
import { useToast } from "../components/ToastProvider";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { NumberField } from "../components/NumberField";
import { PageHeader } from "../components/PageHeader";
import { ResponsiveTable, type Column } from "../components/ResponsiveTable";
import { formatCurrency, formatDate } from "../lib/format";
import type { Expense } from "../types/models";

// Expenses list (Biaya Operasional) + a "Log expense" action that opens the
// form in a popup, plus per-row Edit/Delete -- Edit reopens the popup
// pre-filled and switches the submit to an update; Delete always goes
// through a confirmation prompt first since it can't be undone. Category is
// a free text field rather than a fixed enum since the spreadsheet's
// operational cost categories vary by business.
export function ExpensesPage() {
  const expensesQuery = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const { showToast } = useToast();

  // null = "add" mode; an Expense = "edit" mode, form pre-filled from that
  // record and submit calls update instead of create.
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setCategory("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({});
  }

  function openAddModal() {
    setEditingExpense(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(expense: Expense) {
    setEditingExpense(expense);
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setDate(expense.date);
    setErrors({});
    setIsModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!category.trim()) next.category = "Category is required.";
    const amountNum = Number(amount);
    if (!amount || amountNum <= 0) next.amount = "Enter an amount greater than 0.";
    if (!date) next.date = "Date is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = { category: category.trim(), amount: Number(amount), date };
    const onSuccess = () => {
      showToast(editingExpense ? "Expense updated." : "Expense logged.", "success");
      resetForm();
      setIsModalOpen(false);
      setEditingExpense(null);
    };
    const onError = (err: unknown) => {
      const message = err instanceof ApiError ? err.message : "Could not save the expense.";
      showToast(message, "error");
    };

    if (editingExpense) {
      updateExpense.mutate({ id: editingExpense.id, payload }, { onSuccess, onError });
    } else {
      createExpense.mutate(payload, { onSuccess, onError });
    }
  }

  function handleConfirmDelete() {
    if (!deletingExpense) return;
    deleteExpense.mutate(deletingExpense.id, {
      onSuccess: () => {
        showToast("Expense deleted.", "success");
        setDeletingExpense(null);
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : "Could not delete the expense.";
        showToast(message, "error");
        setDeletingExpense(null);
      },
    });
  }

  const isSaving = createExpense.isPending || updateExpense.isPending;

  const columns: Column<Expense>[] = [
    { key: "date", header: "Date", cell: (e) => formatDate(e.date) },
    { key: "category", header: "Category", cell: (e) => e.category },
    { key: "amount", header: "Amount", cell: (e) => formatCurrency(e.amount), align: "right" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (e) => (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => openEditModal(e)}
            className="font-display text-xs font-semibold uppercase tracking-wide text-brass hover:text-brass-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeletingExpense(e)}
            className="font-display text-xs font-semibold uppercase tracking-wide text-rust hover:text-rust-dark"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader title="Expenses" subtitle="Operational costs (Biaya Operasional)" />
        <Button onClick={openAddModal} className="shrink-0">
          + Log expense
        </Button>
      </div>

      {expensesQuery.isLoading ? (
        <p className="text-sm text-stone">Loading...</p>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={expensesQuery.data ?? []}
          rowKey={(e) => String(e.id)}
          emptyMessage="No expenses logged yet."
        />
      )}

      <Modal
        title={editingExpense ? "Edit expense" : "Log an expense"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField
            label="Category"
            name="category"
            type="text"
            placeholder="e.g. Rent, Utilities, Transport"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
          />
          <NumberField
            label="Amount (IDR)"
            name="amount"
            value={amount}
            onChange={setAmount}
            error={errors.amount}
          />
          <FormField
            label="Date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />

          <Button type="submit" fullWidth disabled={isSaving}>
            {isSaving ? "Saving..." : editingExpense ? "Save changes" : "Log expense"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deletingExpense !== null}
        title="Delete expense?"
        message={
          deletingExpense
            ? `This permanently deletes the "${deletingExpense.category}" expense (${formatCurrency(deletingExpense.amount)}). This can't be undone.`
            : ""
        }
        isConfirming={deleteExpense.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />
    </div>
  );
}
