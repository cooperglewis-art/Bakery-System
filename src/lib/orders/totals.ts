export interface TotalsItem {
  quantity: number;
  unitPrice: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateOrderTotals(
  items: TotalsItem[],
  taxRate: number
): OrderTotals {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  );
  const tax = roundCurrency(subtotal * taxRate);
  const total = roundCurrency(subtotal + tax);

  return { subtotal, tax, total };
}
