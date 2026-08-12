import { useMemo, useState, type FormEvent } from "react";
import { useProducts } from "../hooks/useProducts";
import { useInventoryLedger, useCreateLedgerEntry, computeCurrentStock } from "../hooks/useInventoryLedger";
import { ApiError } from "../api/client";
import { useToast } from "../components/ToastProvider";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { NumberField } from "../components/NumberField";
import { PageHeader } from "../components/PageHeader";
import { ResponsiveTable, type Column } from "../components/ResponsiveTable";
import type { LedgerDirection, Product } from "../types/models";

// Current-stock table + a "Log movement" action that opens the stock in/out
// form in a popup. Staff on the warehouse floor still get both together
// (check what's on hand, then log the movement) -- the table is just the
// primary view now, with the form appearing on demand instead of always
// sitting above it.
export function StockPage() {
  const productsQuery = useProducts();
  const ledgerQuery = useInventoryLedger();
  const createEntry = useCreateLedgerEntry();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState<string>("");
  const [direction, setDirection] = useState<LedgerDirection>("in");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const products = productsQuery.data ?? [];
  const stockByProduct = useMemo(
    () => computeCurrentStock(ledgerQuery.data ?? []),
    [ledgerQuery.data],
  );

  function resetForm() {
    setProductId("");
    setDirection("in");
    setQuantity("");
    setNote("");
    setErrors({});
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!productId) next.productId = "Select a product.";
    const qtyNum = Number(quantity);
    if (!quantity || qtyNum <= 0) next.quantity = "Enter a quantity greater than 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    createEntry.mutate(
      {
        product_id: Number(productId),
        direction,
        quantity: Number(quantity),
        note: note || undefined,
        // No timestamp field collected on this form -- omit it and let the
        // backend default to "now" server-side.
      },
      {
        onSuccess: () => {
          showToast(`Stock ${direction === "in" ? "in" : "out"} logged.`, "success");
          resetForm();
          setIsModalOpen(false);
        },
        onError: (err) => {
          // Covers the backend's business-rule validation from the spec (e.g.
          // rejecting a stock-out that would push stock below zero) -- the
          // ApiError message from the {"detail": "..."} response is shown
          // directly since it's already a human-readable explanation.
          const message = err instanceof ApiError ? err.message : "Could not log the stock movement.";
          showToast(message, "error");
        },
      },
    );
  }

  const stockColumns: Column<Product>[] = [
    { key: "name", header: "Product", cell: (p) => p.name },
    { key: "unit", header: "Unit", cell: (p) => p.unit },
    {
      key: "stock",
      header: "Current stock",
      cell: (p) => stockByProduct[p.id] ?? 0,
      align: "right",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader title="Stock" subtitle="Check what's on hand, then log a movement" />
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          + Log movement
        </Button>
      </div>

      {productsQuery.isLoading || ledgerQuery.isLoading ? (
        <p className="text-sm text-stone">Loading...</p>
      ) : (
        <ResponsiveTable
          columns={stockColumns}
          rows={products}
          rowKey={(p) => String(p.id)}
          emptyMessage="No products yet."
        />
      )}

      <Modal title="Log stock in / out" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="product" className="text-sm font-medium text-ink">
              Product
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              aria-invalid={errors.productId ? true : undefined}
              className={`min-h-[44px] rounded-lg border bg-white px-3 py-2 text-base text-ink ${
                errors.productId ? "border-rust" : "border-stone-light"
              }`}
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p role="alert" className="text-xs font-medium text-rust">
                {errors.productId}
              </p>
            )}
          </div>

          {/* Two large buttons rather than a dropdown -- direction is the
              single most important choice on this form and should be a
              one-tap decision, not a select menu. Color-coded moss/rust to
              match the same in/out meaning used everywhere else (positive
              vs. negative figures). */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Direction</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Stock movement direction">
              <button
                type="button"
                role="radio"
                aria-checked={direction === "in"}
                onClick={() => setDirection("in")}
                className={`min-h-[44px] flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  direction === "in"
                    ? "border-moss bg-moss/10 text-moss-dark"
                    : "border-stone-light text-stone-dark"
                }`}
              >
                Stock in
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={direction === "out"}
                onClick={() => setDirection("out")}
                className={`min-h-[44px] flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  direction === "out"
                    ? "border-rust bg-rust/10 text-rust-dark"
                    : "border-stone-light text-stone-dark"
                }`}
              >
                Stock out
              </button>
            </div>
          </div>

          <NumberField
            label="Quantity"
            name="quantity"
            value={quantity}
            onChange={setQuantity}
            error={errors.quantity}
          />
          <FormField
            label="Note (optional)"
            name="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Button type="submit" fullWidth disabled={createEntry.isPending}>
            {createEntry.isPending ? "Saving..." : "Log movement"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
