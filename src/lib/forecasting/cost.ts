import { format, parseISO } from "date-fns";
import type { CostTrendPoint } from "./types";

/**
 * Calculates cost trend with 7-point rolling average.
 *
 * Groups invoice items by date, computes per-date average unit cost,
 * then applies a 7-point moving average for smoothing.
 */
export function calculateCostTrend(
  invoiceItems: { invoice_date: string; unit_cost: number }[]
): CostTrendPoint[] {
  if (invoiceItems.length === 0) {
    return [];
  }

  // Group by date and average the unit costs per date
  const dateMap = new Map<string, { total: number; count: number }>();

  for (const item of invoiceItems) {
    const dateKey = item.invoice_date;
    const existing = dateMap.get(dateKey);
    if (existing) {
      existing.total += item.unit_cost;
      existing.count += 1;
    } else {
      dateMap.set(dateKey, { total: item.unit_cost, count: 1 });
    }
  }

  // Sort by date ascending
  const sortedDates = Array.from(dateMap.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, { total, count }]) => ({
      date,
      unitCost: Math.round((total / count) * 100) / 100,
    }));

  // Calculate 7-point rolling average
  const results: CostTrendPoint[] = sortedDates.map((point, index) => {
    // Take up to 7 points ending at current index
    const windowStart = Math.max(0, index - 6);
    const window = sortedDates.slice(windowStart, index + 1);
    const rollingAvg =
      window.reduce((sum, p) => sum + p.unitCost, 0) / window.length;

    return {
      date: point.date,
      unitCost: point.unitCost,
      rollingAverage: Math.round(rollingAvg * 100) / 100,
    };
  });

  return results;
}

/**
 * Aggregates total cost by month from invoice items.
 */
export function calculateMonthlySpend(
  invoiceItems: { invoice_date: string; total_cost: number; supplier_name?: string }[]
): { month: string; total: number }[] {
  if (invoiceItems.length === 0) {
    return [];
  }

  const monthMap = new Map<string, number>();

  for (const item of invoiceItems) {
    const monthKey = format(parseISO(item.invoice_date), "yyyy-MM");
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + item.total_cost);
  }

  // Sort by month ascending
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month,
      total: Math.round(total * 100) / 100,
    }));
}
