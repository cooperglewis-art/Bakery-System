import { format, addDays, parseISO, differenceInDays } from "date-fns";
import type { ForecastPoint } from "./types";

/**
 * Calculates demand forecast using Weighted Moving Average with day-of-week adjustment.
 *
 * Takes historical usage data (up to last 30 days) and upcoming committed orders,
 * then projects demand 14 days into the future.
 */
export function calculateDemandForecast(
  usageData: { usage_date: string; quantity_used: number }[],
  upcomingOrders: { delivery_date: string; quantity: number }[]
): ForecastPoint[] {
  if (usageData.length === 0) {
    return [];
  }

  // Sort usage data by date ascending
  const sorted = [...usageData].sort(
    (a, b) => new Date(a.usage_date).getTime() - new Date(b.usage_date).getTime()
  );

  // Use only last 30 days
  const last30 = sorted.slice(-30);

  // Build day-of-week factors (0 = Sunday, 6 = Saturday)
  const dowTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
  const dowCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const entry of last30) {
    const dow = parseISO(entry.usage_date).getDay();
    dowTotals[dow] += entry.quantity_used;
    dowCounts[dow] += 1;
  }

  const overallAvg =
    last30.reduce((sum, e) => sum + e.quantity_used, 0) / last30.length;

  // Day-of-week adjustment factors (ratio of dow avg to overall avg)
  const dowFactors: number[] = dowTotals.map((total, i) => {
    if (dowCounts[i] === 0 || overallAvg === 0) return 1;
    return total / dowCounts[i] / overallAvg;
  });

  // Weighted Moving Average: more recent days get higher weight
  // Weights: linearly increasing from 1 to N for N data points
  const weights = last30.map((_, i) => i + 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const wma =
    last30.reduce((sum, entry, i) => sum + entry.quantity_used * weights[i], 0) /
    totalWeight;

  // Build upcoming orders map by date
  const ordersByDate = new Map<string, number>();
  for (const order of upcomingOrders) {
    const dateKey = order.delivery_date;
    ordersByDate.set(dateKey, (ordersByDate.get(dateKey) || 0) + order.quantity);
  }

  // Build result: historical points (actual) + 14 days of predicted
  const results: ForecastPoint[] = [];

  // Add historical actuals
  for (const entry of last30) {
    results.push({
      date: entry.usage_date,
      actual: entry.quantity_used,
    });
  }

  // Determine start date for predictions (day after last historical date)
  const lastDate =
    last30.length > 0
      ? parseISO(last30[last30.length - 1].usage_date)
      : new Date();

  // Project 14 days forward
  for (let i = 1; i <= 14; i++) {
    const targetDate = addDays(lastDate, i);
    const dateStr = format(targetDate, "yyyy-MM-dd");
    const dow = targetDate.getDay();

    // Base prediction: WMA adjusted by day-of-week factor
    let predicted = Math.max(0, wma * dowFactors[dow]);

    // Overlay committed orders on top of the baseline
    const committedQty = ordersByDate.get(dateStr) || 0;
    if (committedQty > predicted) {
      predicted = committedQty;
    }

    results.push({
      date: dateStr,
      predicted: Math.round(predicted * 100) / 100,
    });
  }

  return results;
}
