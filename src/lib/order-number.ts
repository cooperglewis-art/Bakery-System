/**
 * Format an order number with prefix for display.
 * Examples: "SD-1001", "SD-1002"
 *
 * The format is: PREFIX-NNNN (zero-padded to 4 digits minimum)
 */
export function formatOrderNumber(orderNumber: number, prefix?: string): string {
  const p = prefix || "SD";
  const padded = String(orderNumber).padStart(4, "0");
  return `${p}-${padded}`;
}
