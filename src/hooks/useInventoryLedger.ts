import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InventoryLedgerApi } from "../api/resources";
import type { InventoryLedgerEntry } from "../types/models";

const LEDGER_KEY = ["inventory-ledger"] as const;

export function useInventoryLedger() {
  return useQuery({ queryKey: LEDGER_KEY, queryFn: () => InventoryLedgerApi.list() });
}

// Stock in/out is modeled as a single ledger-entry create -- direction ("in"
// or "out") is a field on the payload rather than two separate endpoints,
// matching the spec's single append-only inventory_ledger table.
export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Omit<InventoryLedgerEntry, "id" | "timestamp"> & { timestamp?: string },
    ) => InventoryLedgerApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEDGER_KEY }),
  });
}

// Current stock per product is derived client-side by summing movement rows
// -- the backend has no stored "current stock" field either (it derives this
// same way for GET /inventory/stock/{product_id}).
export function computeCurrentStock(
  entries: InventoryLedgerEntry[],
): Record<number, number> {
  const stock: Record<number, number> = {};
  for (const entry of entries) {
    const delta = entry.direction === "in" ? entry.quantity : -entry.quantity;
    stock[entry.product_id] = (stock[entry.product_id] ?? 0) + delta;
  }
  return stock;
}
