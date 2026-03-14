import { describe, expect, it } from "vitest";
import { calculateOrderTotals } from "../../src/lib/orders/totals";

describe("calculateOrderTotals", () => {
  it("calculates subtotal, tax, and total with currency rounding", () => {
    const result = calculateOrderTotals(
      [
        { quantity: 1, unitPrice: 19.995 },
        { quantity: 2, unitPrice: 4.335 },
      ],
      0.0825
    );

    expect(result.subtotal).toBe(28.67);
    expect(result.tax).toBe(2.37);
    expect(result.total).toBe(31.04);
  });

  it("handles empty orders", () => {
    const result = calculateOrderTotals([], 0.075);
    expect(result).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });
});
