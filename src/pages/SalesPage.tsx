import { useState, type FormEvent } from "react";
import { useSales, useCreateSale, useUpdateSale, useDeleteSale } from "../hooks/useSales";
import { useProducts } from "../hooks/useProducts";
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
import type { Sale } from "../types/models";

// Sales list + a "Log sale" action that opens the form in a popup, plus
// per-row Edit/Delete -- Edit reopens the popup pre-filled and switches the
// submit to an update; Delete always goes through a confirmation prompt
// first since it can't be undone. The real backend models a sale as a
// revenue entry keyed by free-text "source" + amount (not quantity x
// price), so the form collects a required source description, an optional
// product link, and the amount.
export function SalesPage() {
  const salesQuery = useSales();
  const productsQuery = useProducts();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();
  const { showToast } = useToast();

  // null = "add" mode; a Sale = "edit" mode, form pre-filled from that
  // record and submit calls update instead of create.
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);

  const [productId, setProductId] = useState("");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setProductId("");
    setSource("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({});
  }

  function openAddModal() {
    setEditingSale(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(sale: Sale) {
    setEditingSale(sale);
    setProductId(sale.product_id ? String(sale.product_id) : "");
    setSource(sale.source);
    setAmount(String(sale.amount));
    setDate(sale.date);
    setErrors({});
    setIsModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!source.trim()) next.source = "Enter a revenue source description.";
    const amountNum = Number(amount);
    if (!amount || amountNum <= 0) next.amount = "Enter an amount greater than 0.";
    if (!date) next.date = "Date is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      source: source.trim(),
      // product_id is optional on the backend -- only send it when a
      // product was actually selected.
      product_id: productId ? Number(productId) : undefined,
      amount: Number(amount),
      date,
    };
    const onSuccess = () => {
      showToast(editingSale ? "Sale updated." : "Sale logged.", "success");
      resetForm();
      setIsModalOpen(false);
      setEditingSale(null);
    };
    const onError = (err: unknown) => {
      const message = err instanceof ApiError ? err.message : "Could not save the sale.";
      showToast(message, "error");
    };

    if (editingSale) {
      updateSale.mutate({ id: editingSale.id, payload }, { onSuccess, onError });
    } else {
      createSale.mutate(payload, { onSuccess, onError });
    }
  }

  function handleConfirmDelete() {
    if (!deletingSale) return;
    deleteSale.mutate(deletingSale.id, {
      onSuccess: () => {
        showToast("Sale deleted.", "success");
        setDeletingSale(null);
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : "Could not delete the sale.";
        showToast(message, "error");
        setDeletingSale(null);
      },
    });
  }

  const isSaving = createSale.isPending || updateSale.isPending;
  const products = productsQuery.data ?? [];
  const productName = (id?: number) => products.find((p) => p.id === id)?.name ?? "";

  const columns: Column<Sale>[] = [
    { key: "date", header: "Date", cell: (s) => formatDate(s.date) },
    { key: "source", header: "Source", cell: (s) => s.source },
    { key: "product", header: "Product", cell: (s) => productName(s.product_id) || "-" },
    { key: "amount", header: "Amount", cell: (s) => formatCurrency(s.amount), align: "right" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (s) => (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => openEditModal(s)}
            className="font-display text-xs font-semibold uppercase tracking-wide text-brass hover:text-brass-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeletingSale(s)}
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
        <PageHeader title="Sales" subtitle="Log revenue, linked to a product or not" />
        <Button onClick={openAddModal} className="shrink-0">
          + Log sale
        </Button>
      </div>

      {salesQuery.isLoading ? (
        <p className="text-sm text-stone">Loading...</p>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={salesQuery.data ?? []}
          rowKey={(s) => String(s.id)}
          emptyMessage="No sales logged yet."
        />
      )}

      <Modal title={editingSale ? "Edit sale" : "Log a sale"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField
            label="Revenue source"
            name="source"
            type="text"
            placeholder="e.g. Penjualan Produk A"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            error={errors.source}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="product" className="text-sm font-medium text-ink">
              Product (optional)
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="min-h-[44px] rounded-lg border border-stone-light bg-white px-3 py-2 text-base text-ink"
            >
              <option value="">No product link</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

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
            {isSaving ? "Saving..." : editingSale ? "Save changes" : "Log sale"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deletingSale !== null}
        title="Delete sale?"
        message={
          deletingSale
            ? `This permanently deletes the "${deletingSale.source}" sale (${formatCurrency(deletingSale.amount)}). This can't be undone.`
            : ""
        }
        isConfirming={deleteSale.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSale(null)}
      />
    </div>
  );
}
