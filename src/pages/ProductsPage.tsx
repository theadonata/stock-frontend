import { useState, type FormEvent } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/useProducts";
import { ApiError } from "../api/client";
import { useToast } from "../components/ToastProvider";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { NumberField } from "../components/NumberField";
import { PageHeader } from "../components/PageHeader";
import { ResponsiveTable, type Column } from "../components/ResponsiveTable";
import { formatCurrency } from "../lib/format";
import type { Product } from "../types/models";

// Catalog list + an "Add product" action that opens the form in a popup,
// plus per-row Edit/Delete -- Edit reopens the same popup pre-filled and
// switches the submit to an update; Delete always goes through a
// confirmation prompt first since it can't be undone. This screen exists
// because the Sales and Stock pages both need a product to already exist
// before staff can log anything against it.
export function ProductsPage() {
  const productsQuery = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { showToast } = useToast();

  // null = "add" mode (no record yet); a Product = "edit" mode, form
  // pre-filled from that record and submit calls update instead of create.
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setName("");
    setUnit("");
    setPurchasePrice("");
    setErrors({});
  }

  function openAddModal() {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setUnit(product.unit);
    setPurchasePrice(String(product.purchase_price_per_unit));
    setErrors({});
    setIsModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!unit.trim()) next.unit = "Unit is required (e.g. pcs, roll).";
    const priceNum = Number(purchasePrice);
    if (!purchasePrice || priceNum <= 0) next.purchasePrice = "Enter a purchase price greater than 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      unit: unit.trim(),
      purchase_price_per_unit: Number(purchasePrice),
    };
    const onSuccess = () => {
      showToast(editingProduct ? "Product updated." : "Product added.", "success");
      resetForm();
      setIsModalOpen(false);
      setEditingProduct(null);
    };
    const onError = (err: unknown) => {
      const message = err instanceof ApiError ? err.message : "Could not save the product.";
      showToast(message, "error");
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, payload }, { onSuccess, onError });
    } else {
      createProduct.mutate(payload, { onSuccess, onError });
    }
  }

  function handleConfirmDelete() {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => {
        showToast("Product deleted.", "success");
        setDeletingProduct(null);
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : "Could not delete the product.";
        showToast(message, "error");
        setDeletingProduct(null);
      },
    });
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;

  const columns: Column<Product>[] = [
    { key: "name", header: "Name", cell: (p) => p.name },
    { key: "unit", header: "Unit", cell: (p) => p.unit },
    {
      key: "price",
      header: "Purchase price / unit",
      cell: (p) => formatCurrency(p.purchase_price_per_unit),
      align: "right",
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => openEditModal(p)}
            className="font-display text-xs font-semibold uppercase tracking-wide text-brass hover:text-brass-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeletingProduct(p)}
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
        <PageHeader title="Products" subtitle="The catalog Sales and Stock draw from" />
        <Button onClick={openAddModal} className="shrink-0">
          + Add product
        </Button>
      </div>

      {productsQuery.isLoading ? (
        <p className="text-sm text-stone">Loading...</p>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={productsQuery.data ?? []}
          rowKey={(p) => String(p.id)}
          emptyMessage="No products yet. Add one to get started."
        />
      )}

      <Modal
        title={editingProduct ? "Edit product" : "Add a product"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField
            label="Name"
            name="name"
            type="text"
            placeholder="e.g. [Black] Croco Nocturne Bag"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <FormField
            label="Unit"
            name="unit"
            type="text"
            placeholder="e.g. pcs, roll"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            error={errors.unit}
          />
          <NumberField
            label="Purchase price / unit (IDR)"
            name="purchasePrice"
            value={purchasePrice}
            onChange={setPurchasePrice}
            error={errors.purchasePrice}
          />

          <Button type="submit" fullWidth disabled={isSaving}>
            {isSaving ? "Saving..." : editingProduct ? "Save changes" : "Add product"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deletingProduct !== null}
        title="Delete product?"
        message={
          deletingProduct
            ? `This permanently deletes "${deletingProduct.name}". This can't be undone.`
            : ""
        }
        isConfirming={deleteProduct.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
