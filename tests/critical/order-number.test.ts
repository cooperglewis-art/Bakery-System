import { describe, expect, it } from "vitest";
import { formatOrderNumber } from "../../src/lib/order-number";

describe("formatOrderNumber", () => {
  it("uses configured prefix", () => {
    expect(formatOrderNumber(42, "BK")).toBe("BK-0042");
  });

  it("falls back to default prefix", () => {
    expect(formatOrderNumber(1001)).toBe("SD-1001");
  });
});
