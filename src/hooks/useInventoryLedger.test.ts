import { describe, expect, it } from "vitest";
import { computeCurrentStock } from "./useInventoryLedger";
import type { InventoryLedgerEntry } from "../types/models";

// computeCurrentStock is the client-side derivation of "current stock per
// product" from the raw movements (the backend never stores this value
// either -- it derives the same way for GET /inventory/stock/{product_id}).
function entry(overrides: Partial<InventoryLedgerEntry>): InventoryLedgerEntry {
  return {
    id: 1,
    product_id: 1,
    direction: "in",
    quantity: 1,
    timestamp: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeCurrentStock", () => {
  it("sums stock-in entries for a product", () => {
    const result = computeCurrentStock([
      entry({ id: 1, product_id: 1, direction: "in", quantity: 10 }),
      entry({ id: 2, product_id: 1, direction: "in", quantity: 5 }),
    ]);
    expect(result[1]).toBe(15);
  });

  it("subtracts stock-out entries", () => {
    const result = computeCurrentStock([
      entry({ id: 1, product_id: 1, direction: "in", quantity: 10 }),
      entry({ id: 2, product_id: 1, direction: "out", quantity: 4 }),
    ]);
    expect(result[1]).toBe(6);
  });

  it("tracks multiple products independently", () => {
    const result = computeCurrentStock([
      entry({ id: 1, product_id: 1, direction: "in", quantity: 10 }),
      entry({ id: 2, product_id: 2, direction: "in", quantity: 3 }),
      entry({ id: 3, product_id: 2, direction: "out", quantity: 1 }),
    ]);
    expect(result[1]).toBe(10);
    expect(result[2]).toBe(2);
  });

  it("returns an empty object for no entries", () => {
    expect(computeCurrentStock([])).toEqual({});
  });
});
