import { createClient } from "@/lib/supabase/server";
import { format, subDays, addDays } from "date-fns";
import { calculateDemandForecast } from "@/lib/forecasting/demand";
import { calculateCostTrend, calculateMonthlySpend } from "@/lib/forecasting/cost";
import type { ForecastPoint, CostTrendPoint, ReorderAlert } from "@/lib/forecasting/types";
import type { Ingredient } from "@/types/database";
import { ForecastingSummaryCards } from "@/components/forecasting/forecasting-summary-cards";
import { DemandForecastChart } from "@/components/forecasting/demand-forecast-chart";
import { CostTrendChart } from "@/components/forecasting/cost-trend-chart";
import { IngredientsReorderTable } from "@/components/forecasting/ingredients-reorder-table";

export default async function ForecastingPage() {
  const supabase = await createClient();
  const today = new Date();
  const ninetyDaysAgo = format(subDays(today, 90), "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const thirtyDaysFromNow = format(addDays(today, 30), "yyyy-MM-dd");

  // Parallel queries
  const [usageResult, invoiceItemsResult, ingredientsResult, upcomingOrdersResult] =
    await Promise.all([
      // Usage data (90 days)
      supabase
        .from("ingredient_usage_daily")
        .select("*")
        .gte("usage_date", ninetyDaysAgo)
        .lte("usage_date", todayStr)
        .order("usage_date", { ascending: true }),

      // Verified invoice items (90 days) -- join with invoices to get date and status
      supabase
        .from("invoice_items")
        .select(`
          *,
          invoice:invoices!inner(invoice_date, status, supplier_name)
        `)
        .gte("invoices.invoice_date", ninetyDaysAgo)
        .eq("invoices.status", "verified"),

      // All ingredients
      supabase.from("ingredients").select("*"),

      // Upcoming orders (30 days) with order items and product_ingredients
      supabase
        .from("orders")
        .select(`
          id,
          delivery_date,
          status,
          order_items(
            quantity,
            product_id,
            product_name
          )
        `)
        .gte("delivery_date", todayStr)
        .lte("delivery_date", thirtyDaysFromNow)
        .in("status", ["pending", "confirmed", "in_progress"]),
    ]);

  const usageData = usageResult.data || [];
  const invoiceItems = invoiceItemsResult.data || [];
  const ingredients = (ingredientsResult.data || []) as Ingredient[];
  const upcomingOrders = upcomingOrdersResult.data || [];

  // Fetch product_ingredients for mapping upcoming orders to ingredient quantities
  const { data: productIngredients } = await supabase
    .from("product_ingredients")
    .select("*");
  const piData = productIngredients || [];

  // Build ingredient lookup
  const ingredientMap = new Map<string, Ingredient>();
  for (const ing of ingredients) {
    ingredientMap.set(ing.id, ing);
  }

  // Build product_ingredient lookup: product_id -> { ingredient_id, quantity }[]
  const piByProduct = new Map<string, { ingredient_id: string; quantity: number }[]>();
  for (const pi of piData) {
    const existing = piByProduct.get(pi.product_id) || [];
    existing.push({ ingredient_id: pi.ingredient_id, quantity: pi.quantity });
    piByProduct.set(pi.product_id, existing);
  }

  // Compute upcoming ingredient demand from upcoming orders
  // Map: ingredient_id -> { delivery_date -> total_quantity }
  const upcomingIngredientDemand = new Map<
    string,
    { delivery_date: string; quantity: number }[]
  >();

  for (const order of upcomingOrders) {
    const orderItems = (order.order_items || []) as {
      quantity: number;
      product_id: string | null;
      product_name: string;
    }[];
    for (const item of orderItems) {
      if (!item.product_id) continue;
      const recipeIngredients = piByProduct.get(item.product_id) || [];
      for (const ri of recipeIngredients) {
        const totalQty = ri.quantity * item.quantity;
        const existing = upcomingIngredientDemand.get(ri.ingredient_id) || [];
        existing.push({
          delivery_date: order.delivery_date,
          quantity: totalQty,
        });
        upcomingIngredientDemand.set(ri.ingredient_id, existing);
      }
    }
  }

  // Group usage data by ingredient_id
  const usageByIngredient = new Map<
    string,
    { usage_date: string; quantity_used: number }[]
  >();
  for (const row of usageData) {
    const existing = usageByIngredient.get(row.ingredient_id) || [];
    existing.push({
      usage_date: row.usage_date,
      quantity_used: row.quantity_used,
    });
    usageByIngredient.set(row.ingredient_id, existing);
  }

  // Compute demand forecasts per ingredient
  const demandForecasts: Record<
    string,
    { ingredientName: string; data: ForecastPoint[] }
  > = {};

  for (const [ingredientId, usage] of usageByIngredient.entries()) {
    const ingredient = ingredientMap.get(ingredientId);
    if (!ingredient) continue;

    const upcoming = upcomingIngredientDemand.get(ingredientId) || [];
    const forecast = calculateDemandForecast(usage, upcoming);

    if (forecast.length > 0) {
      demandForecasts[ingredientId] = {
        ingredientName: ingredient.name,
        data: forecast,
      };
    }
  }

  // Group invoice items by ingredient for cost trends
  const invoiceByIngredient = new Map<
    string,
    { invoice_date: string; unit_cost: number }[]
  >();
  const allInvoiceItemsForSpend: {
    invoice_date: string;
    total_cost: number;
    supplier_name?: string;
  }[] = [];

  for (const item of invoiceItems) {
    const invoice = item.invoice as unknown as {
      invoice_date: string;
      status: string;
      supplier_name: string;
    };

    if (item.total_cost != null) {
      allInvoiceItemsForSpend.push({
        invoice_date: invoice.invoice_date,
        total_cost: item.total_cost,
        supplier_name: invoice.supplier_name,
      });
    }

    if (item.ingredient_id && item.unit_cost != null) {
      const existing = invoiceByIngredient.get(item.ingredient_id) || [];
      existing.push({
        invoice_date: invoice.invoice_date,
        unit_cost: item.unit_cost,
      });
      invoiceByIngredient.set(item.ingredient_id, existing);
    }
  }

  // Compute cost trends per ingredient
  const costTrends: Record<
    string,
    { ingredientName: string; data: CostTrendPoint[] }
  > = {};

  for (const [ingredientId, items] of invoiceByIngredient.entries()) {
    const ingredient = ingredientMap.get(ingredientId);
    if (!ingredient) continue;

    const trend = calculateCostTrend(items);
    if (trend.length > 0) {
      costTrends[ingredientId] = {
        ingredientName: ingredient.name,
        data: trend,
      };
    }
  }

  // Calculate monthly spend
  const monthlySpend = calculateMonthlySpend(allInvoiceItemsForSpend);
  const currentMonth = format(today, "yyyy-MM");
  const lastMonth = format(subDays(today, 30), "yyyy-MM");
  const currentMonthSpend =
    monthlySpend.find((m) => m.month === currentMonth)?.total || 0;
  const lastMonthSpend =
    monthlySpend.find((m) => m.month === lastMonth)?.total || 0;

  // Calculate top 3 usage ingredients (by total usage over 90 days)
  const ingredientUsageTotals: { name: string; usage: number; unit: string }[] = [];
  for (const [ingredientId, usage] of usageByIngredient.entries()) {
    const ingredient = ingredientMap.get(ingredientId);
    if (!ingredient) continue;
    const total = usage.reduce((sum, u) => sum + u.quantity_used, 0);
    ingredientUsageTotals.push({
      name: ingredient.name,
      usage: total,
      unit: ingredient.unit,
    });
  }
  ingredientUsageTotals.sort((a, b) => b.usage - a.usage);
  const topIngredients = ingredientUsageTotals.slice(0, 3);

  // Calculate reorder alerts
  const reorderAlerts: ReorderAlert[] = [];
  for (const ingredient of ingredients) {
    const usage = usageByIngredient.get(ingredient.id) || [];
    const upcoming = upcomingIngredientDemand.get(ingredient.id) || [];
    const forecast = calculateDemandForecast(usage, upcoming);

    // Sum predicted usage over the 14-day forecast window
    const forecastedUsage14d = forecast.reduce(
      (sum, p) => sum + (p.predicted || 0),
      0
    );

    // Estimate days remaining based on average daily forecasted usage
    const avgDailyUsage = forecastedUsage14d > 0 ? forecastedUsage14d / 14 : 0;
    const daysRemaining =
      avgDailyUsage > 0
        ? Math.floor(ingredient.current_stock / avgDailyUsage)
        : ingredient.current_stock > 0
          ? Infinity
          : 0;

    reorderAlerts.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      unit: ingredient.unit,
      currentStock: ingredient.current_stock,
      forecastedUsage14d: Math.round(forecastedUsage14d * 100) / 100,
      daysRemaining,
      minStockLevel: ingredient.min_stock_level,
    });
  }

  // Count low stock items (< 7 days remaining, excluding Infinity)
  const lowStockCount = reorderAlerts.filter(
    (a) => a.daysRemaining < 7 && a.daysRemaining !== Infinity
  ).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forecasting</h1>
        <p className="text-gray-500">
          Demand forecasts, cost trends, and reorder alerts
        </p>
      </div>

      {/* Summary Cards */}
      <ForecastingSummaryCards
        currentMonthSpend={currentMonthSpend}
        lastMonthSpend={lastMonthSpend}
        topIngredients={topIngredients}
        lowStockCount={lowStockCount}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DemandForecastChart forecasts={demandForecasts} />
        <CostTrendChart trends={costTrends} />
      </div>

      {/* Reorder Table */}
      <IngredientsReorderTable alerts={reorderAlerts} />
    </div>
  );
}
