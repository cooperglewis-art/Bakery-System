import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { OrderSourcesChart } from "@/components/analytics/order-sources-chart";
import { TopProductsChart } from "@/components/analytics/top-products-chart";
import { BusiestDaysChart } from "@/components/analytics/busiest-days-chart";
import { DeliverySplitChart } from "@/components/analytics/delivery-split-chart";
import { TopCustomersTable } from "@/components/analytics/top-customers-table";
import { SupplierSpendingTable } from "@/components/analytics/supplier-spending-table";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const today = new Date();
  const thirtyDaysAgo = format(subDays(today, 30), "yyyy-MM-dd");
  const sixtyDaysAgo = format(subDays(today, 60), "yyyy-MM-dd");
  const thisMonthStart = format(startOfMonth(today), "yyyy-MM-dd");
  const thisMonthEnd = format(endOfMonth(today), "yyyy-MM-dd");
  const lastMonthStart = format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd");
  const lastMonthEnd = format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd");

  // Fetch all data in parallel
  const [
    { data: thisMonthOrders },
    { data: lastMonthOrders },
    { data: last30DaysOrders },
    { data: last60DaysOrders },
    { data: orderItems30 },
    { data: invoices30 },
  ] = await Promise.all([
    // This month's completed orders
    supabase
      .from("orders")
      .select("id, total, status, source, is_delivery, delivery_date, customer_id")
      .gte("delivery_date", thisMonthStart)
      .lte("delivery_date", thisMonthEnd)
      .neq("status", "cancelled"),

    // Last month's completed orders
    supabase
      .from("orders")
      .select("id, total, status")
      .gte("delivery_date", lastMonthStart)
      .lte("delivery_date", lastMonthEnd)
      .neq("status", "cancelled"),

    // Last 30 days orders (all statuses for analytics)
    supabase
      .from("orders")
      .select("id, total, status, source, is_delivery, delivery_date, customer_id")
      .gte("delivery_date", thirtyDaysAgo)
      .order("delivery_date", { ascending: true }),

    // Last 60 days orders (for cancelled rate comparison)
    supabase
      .from("orders")
      .select("id, status, delivery_date")
      .gte("delivery_date", sixtyDaysAgo)
      .lt("delivery_date", thirtyDaysAgo),

    // Order items for last 30 days
    supabase
      .from("order_items")
      .select("product_name, quantity, unit_price, order_id"),

    // Invoices for last 30 days
    supabase
      .from("invoices")
      .select("supplier_name, total_amount, invoice_date")
      .gte("invoice_date", thirtyDaysAgo),
  ]);

  // Also fetch customer names for top customers
  const customerIds = [
    ...new Set(
      (last30DaysOrders || [])
        .filter((o) => o.customer_id && o.status !== "cancelled")
        .map((o) => o.customer_id as string)
    ),
  ];

  const { data: customers } = customerIds.length > 0
    ? await supabase
        .from("customers")
        .select("id, name")
        .in("id", customerIds)
    : { data: [] as { id: string; name: string }[] };

  const customerMap = new Map(
    (customers || []).map((c) => [c.id, c.name])
  );

  // Filter to non-cancelled for revenue metrics
  const activeOrders30 = (last30DaysOrders || []).filter(
    (o) => o.status !== "cancelled"
  );

  // Get order IDs for last 30 days to filter order_items
  const orderIds30 = new Set(activeOrders30.map((o) => o.id));
  const filteredItems = (orderItems30 || []).filter((item) =>
    orderIds30.has(item.order_id)
  );

  // === SUMMARY CARDS ===
  const thisMonthRevenue = (thisMonthOrders || []).reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );
  const lastMonthRevenue = (lastMonthOrders || []).reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );
  const revenueChange =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const thisMonthOrderCount = (thisMonthOrders || []).length;
  const lastMonthOrderCount = (lastMonthOrders || []).length;
  const orderCountChange =
    lastMonthOrderCount > 0
      ? ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100
      : 0;

  const avgOrderValue =
    activeOrders30.length > 0
      ? activeOrders30.reduce((sum, o) => sum + (o.total || 0), 0) /
        activeOrders30.length
      : 0;

  const allOrders30 = last30DaysOrders || [];
  const cancelledCount30 = allOrders30.filter(
    (o) => o.status === "cancelled"
  ).length;
  const cancellationRate =
    allOrders30.length > 0 ? (cancelledCount30 / allOrders30.length) * 100 : 0;

  const allOrders60Prior = last60DaysOrders || [];
  const cancelledPrior = allOrders60Prior.filter(
    (o) => o.status === "cancelled"
  ).length;
  const cancellationRatePrior =
    allOrders60Prior.length > 0
      ? (cancelledPrior / allOrders60Prior.length) * 100
      : 0;
  const cancellationChange = cancellationRate - cancellationRatePrior;

  // === REVENUE CHART DATA (last 30 days, daily) ===
  const revenueByDate = new Map<string, { revenue: number; orders: number }>();
  for (let i = 30; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    revenueByDate.set(date, { revenue: 0, orders: 0 });
  }
  for (const order of activeOrders30) {
    const existing = revenueByDate.get(order.delivery_date);
    if (existing) {
      existing.revenue += order.total || 0;
      existing.orders += 1;
    }
  }
  const revenueChartData = Array.from(revenueByDate.entries()).map(
    ([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    })
  );

  // === ORDER SOURCES ===
  const sourceCounts = new Map<string, number>();
  for (const order of activeOrders30) {
    sourceCounts.set(order.source, (sourceCounts.get(order.source) || 0) + 1);
  }
  const orderSourcesData = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // === TOP PRODUCTS ===
  const productStats = new Map<
    string,
    { quantity: number; revenue: number }
  >();
  for (const item of filteredItems) {
    const existing = productStats.get(item.product_name) || {
      quantity: 0,
      revenue: 0,
    };
    existing.quantity += item.quantity;
    existing.revenue += item.quantity * item.unit_price;
    productStats.set(item.product_name, existing);
  }
  const topProductsData = Array.from(productStats.entries())
    .map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      revenue: Math.round(stats.revenue * 100) / 100,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  // === BUSIEST DAYS OF WEEK ===
  const dayStats = new Map<number, { revenue: number; orders: number; weeks: Set<string> }>();
  for (let d = 0; d < 7; d++) {
    dayStats.set(d, { revenue: 0, orders: 0, weeks: new Set() });
  }
  for (const order of activeOrders30) {
    const date = new Date(order.delivery_date + "T00:00:00");
    const dayOfWeek = date.getDay();
    const stat = dayStats.get(dayOfWeek)!;
    stat.revenue += order.total || 0;
    stat.orders += 1;
    // Track unique weeks to calculate averages
    const weekKey = format(date, "yyyy-'W'II");
    stat.weeks.add(weekKey);
  }
  const busiestDaysData = Array.from(dayStats.entries()).map(
    ([day, stat]) => {
      const weekCount = Math.max(stat.weeks.size, 1);
      return {
        day: DAY_NAMES[day],
        revenue: Math.round((stat.revenue / weekCount) * 100) / 100,
        orders: Math.round((stat.orders / weekCount) * 10) / 10,
      };
    }
  );

  // === DELIVERY VS PICKUP ===
  const deliveryCount = activeOrders30.filter((o) => o.is_delivery).length;
  const pickupCount = activeOrders30.filter((o) => !o.is_delivery).length;

  // === TOP CUSTOMERS ===
  const customerSpend = new Map<
    string,
    { totalSpent: number; orderCount: number }
  >();
  for (const order of activeOrders30) {
    if (!order.customer_id) continue;
    const existing = customerSpend.get(order.customer_id) || {
      totalSpent: 0,
      orderCount: 0,
    };
    existing.totalSpent += order.total || 0;
    existing.orderCount += 1;
    customerSpend.set(order.customer_id, existing);
  }
  const topCustomersData = Array.from(customerSpend.entries())
    .map(([id, stats]) => ({
      name: customerMap.get(id) || "Unknown",
      totalSpent: Math.round(stats.totalSpent * 100) / 100,
      orderCount: stats.orderCount,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // === SUPPLIER SPENDING ===
  const supplierSpend = new Map<
    string,
    { totalSpent: number; invoiceCount: number }
  >();
  for (const inv of invoices30 || []) {
    const existing = supplierSpend.get(inv.supplier_name) || {
      totalSpent: 0,
      invoiceCount: 0,
    };
    existing.totalSpent += inv.total_amount || 0;
    existing.invoiceCount += 1;
    supplierSpend.set(inv.supplier_name, existing);
  }
  const supplierSpendingData = Array.from(supplierSpend.entries())
    .map(([supplier, stats]) => ({
      supplier,
      totalSpent: Math.round(stats.totalSpent * 100) / 100,
      invoiceCount: stats.invoiceCount,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">
          Business performance and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Revenue (This Month)"
          value={`$${thisMonthRevenue.toFixed(2)}`}
          change={revenueChange}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
        />
        <SummaryCard
          label="Orders (This Month)"
          value={thisMonthOrderCount.toString()}
          change={orderCountChange}
          icon={<ShoppingBag className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100"
        />
        <SummaryCard
          label="Avg Order Value"
          value={`$${avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-100"
        />
        <SummaryCard
          label="Cancellation Rate"
          value={`${cancellationRate.toFixed(1)}%`}
          change={-cancellationChange}
          invertChange
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          iconBg="bg-red-100"
        />
      </div>

      {/* Revenue Chart - Full Width */}
      <RevenueChart data={revenueChartData} />

      {/* Charts Row: Top Products + Order Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart data={topProductsData} />
        <OrderSourcesChart data={orderSourcesData} />
      </div>

      {/* Charts Row: Busiest Days + Delivery Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusiestDaysChart data={busiestDaysData} />
        <DeliverySplitChart delivery={deliveryCount} pickup={pickupCount} />
      </div>

      {/* Tables Row: Top Customers + Supplier Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCustomersTable data={topCustomersData} />
        <SupplierSpendingTable data={supplierSpendingData} />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  change,
  invertChange,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  change?: number;
  invertChange?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  // For cancellation rate, a decrease is good (so we invert the color logic)
  const goodChange = invertChange ? isNegative : isPositive;
  const badChange = invertChange ? isPositive : isNegative;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold truncate">{value}</p>
            <p className="text-sm text-gray-500 truncate">{label}</p>
          </div>
        </div>
        {change !== undefined && change !== 0 && (
          <div
            className={`mt-3 flex items-center gap-1 text-sm ${
              goodChange
                ? "text-green-600"
                : badChange
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{Math.abs(change).toFixed(1)}% vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
