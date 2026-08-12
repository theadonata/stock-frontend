// Thin per-resource functions on top of apiRequest. Kept separate from the
// React Query hooks (see src/hooks) so the raw API shape and the
// caching/query-key layer can evolve independently.
import { apiRequest } from "./client";
import type {
  CogsComponents,
  Expense,
  InventoryLedgerEntry,
  LoginRequest,
  LoginResponse,
  PnLReport,
  Product,
  Sale,
} from "../types/models";

export const AuthApi = {
  login: (payload: LoginRequest) =>
    apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    }),
};

export const ProductsApi = {
  list: () => apiRequest<Product[]>("/products"),
  create: (payload: Omit<Product, "id">) =>
    apiRequest<Product>("/products", { method: "POST", body: payload }),
  update: (id: number, payload: Partial<Omit<Product, "id">>) =>
    apiRequest<Product>(`/products/${id}`, { method: "PATCH", body: payload }),
  remove: (id: number) => apiRequest<void>(`/products/${id}`, { method: "DELETE" }),
};

export const InventoryLedgerApi = {
  // Real backend path is /inventory/movements, not /inventory-ledger.
  list: (params?: { product_id?: number }) => {
    const qs = params?.product_id ? `?product_id=${params.product_id}` : "";
    return apiRequest<InventoryLedgerEntry[]>(`/inventory/movements${qs}`);
  },
  create: (payload: Omit<InventoryLedgerEntry, "id" | "timestamp"> & { timestamp?: string }) =>
    apiRequest<InventoryLedgerEntry>("/inventory/movements", {
      method: "POST",
      body: payload,
    }),
};

export const SalesApi = {
  list: () => apiRequest<Sale[]>("/sales"),
  create: (payload: Omit<Sale, "id">) =>
    apiRequest<Sale>("/sales", { method: "POST", body: payload }),
  update: (id: number, payload: Partial<Omit<Sale, "id">>) =>
    apiRequest<Sale>(`/sales/${id}`, { method: "PATCH", body: payload }),
  remove: (id: number) => apiRequest<void>(`/sales/${id}`, { method: "DELETE" }),
};

export const ExpensesApi = {
  list: () => apiRequest<Expense[]>("/expenses"),
  create: (payload: Omit<Expense, "id">) =>
    apiRequest<Expense>("/expenses", { method: "POST", body: payload }),
  update: (id: number, payload: Partial<Omit<Expense, "id">>) =>
    apiRequest<Expense>(`/expenses/${id}`, { method: "PATCH", body: payload }),
  remove: (id: number) => apiRequest<void>(`/expenses/${id}`, { method: "DELETE" }),
};

export const CogsComponentsApi = {
  list: () => apiRequest<CogsComponents[]>("/cogs-components"),
  create: (payload: Omit<CogsComponents, "id">) =>
    apiRequest<CogsComponents>("/cogs-components", {
      method: "POST",
      body: payload,
    }),
};

export const ReportsApi = {
  // Real backend takes a single "YYYY-MM" period string, not a date range.
  pnl: (period: string) => apiRequest<PnLReport>(`/reports/pnl?period=${period}`),
};
