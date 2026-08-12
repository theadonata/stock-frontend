// Shared data-model types mirroring the stock-backend REST contract.
// These now mirror the REAL backend contract, confirmed live against
// stock-backend/app/api/v1/*.py and stock-backend/app/schemas/*.py
// (Docker + real Postgres, curl-tested), not the original design-spec guess.

export interface Product {
  id: number;
  name: string;
  unit: string; // e.g. "pcs", "roll"
  purchase_price_per_unit: number;
  // No created_at on the backend Product schema.
}

// One row per stock movement. Current stock is derived by summing movement
// rows for a product, never stored directly -- matches the backend's own
// GET /inventory/stock/{product_id} derivation approach.
export type LedgerDirection = "in" | "out";

export interface InventoryLedgerEntry {
  id: number;
  product_id: number;
  direction: LedgerDirection;
  quantity: number; // always positive; direction indicates in/out
  note?: string;
  timestamp: string; // ISO datetime; optional on create, server defaults to now
}

// Sale is a revenue entry keyed by free-text source, not a quantity x price
// line -- there is no `quantity` field on the backend Sale schema.
export interface Sale {
  id: number;
  source: string; // required, min 1 char, e.g. "Penjualan Produk A"
  product_id?: number; // optional link to a product
  date: string; // ISO date "YYYY-MM-DD"
  amount: number; // > 0
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string; // ISO date "YYYY-MM-DD"
  // No `note` field on the backend Expense schema.
}

// Per-period COGS (HPP) inputs, matching the backend's single-month period.
export interface CogsComponents {
  id: number;
  period: string; // "YYYY-MM", a single month
  persediaan_awal: number; // beginning inventory value
  pembelian_bahan_baku: number; // raw material purchases
  ongkos_kirim: number; // freight/shipping cost
  biaya_tenaga_kerja: number; // labor cost
  biaya_overhead: number; // overhead cost
  biaya_kemasan: number; // packaging cost
  persediaan_akhir: number; // ending inventory value
}

// Computed on demand by the backend from sales, cogs_components, and expenses
// for the requested period -- never stored.
export interface PnLReport {
  period: string; // "YYYY-MM"
  total_sales: number;
  cogs: number;
  gross_profit: number;
  total_expenses: number;
  net_profit: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
