import { describe, expect, it } from "vitest";
import { computeNetProfit, formatCurrency } from "./format";

// Covers the client-side derived display values called out in the spec's
// testing strategy: net profit and currency formatting are both computed
// on the client from server-provided numbers, so they're worth unit testing
// directly instead of only exercising them through a full page render.
describe("computeNetProfit", () => {
  it("subtracts total expenses from gross profit", () => {
    expect(computeNetProfit(1_000_000, 400_000)).toBe(600_000);
  });

  it("can be negative when expenses exceed gross profit", () => {
    expect(computeNetProfit(100_000, 250_000)).toBe(-150_000);
  });

  it("returns zero when profit exactly covers expenses", () => {
    expect(computeNetProfit(500_000, 500_000)).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("formats a positive amount as Indonesian Rupiah with no decimals", () => {
    const result = formatCurrency(1_500_000);
    // Intl output includes non-breaking spaces / locale-specific separators,
    // so assert on the digits/currency symbol being present rather than an
    // exact byte-for-byte string.
    expect(result).toContain("Rp");
    expect(result.replace(/\D/g, "")).toBe("1500000");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});
