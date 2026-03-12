import { createClient } from "@/lib/supabase/server";
import { formatOrderNumber } from "@/lib/order-number";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CalendarClock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PackageCheck,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import type { Order, OrderItem } from "@/types/database";

export const metadata = { title: "Dashboard" };

type OrderWithRelations = Order & {
  customer: { name: string; phone: string | null } | null;
  order_items: OrderItem[];
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0];
}

const statusOrder: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  in_progress: 2,
  ready: 3,
  completed: 4,
  cancelled: 5,
};

const statusColors: Record<string, string> = {
  pending: "bg-stone-100 text-stone-700 border-stone-200",
  confirmed: "bg-stone-100 text-stone-700 border-stone-200",
  in_progress: "bg-stone-800 text-stone-50 border-stone-700",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-stone-50 text-stone-400 border-stone-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  // Fetch user profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName = "Baker";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile?.full_name) {
      profileName = getFirstName(profile.full_name);
    }
  }

  // Fetch today's orders
  const { data: todaysOrdersData } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(name, phone),
      order_items(*)
    `)
    .eq("delivery_date", today)
    .order("delivery_time_slot", { ascending: true });

  const todaysOrders = (todaysOrdersData || []) as OrderWithRelations[];

  // Fetch tomorrow's orders (for attention section)
  const { data: tomorrowOrdersData } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(name, phone),
      order_items(*)
    `)
    .eq("delivery_date", tomorrow)
    .not("status", "in", "(completed,cancelled)")
    .order("delivery_time_slot", { ascending: true });

  const tomorrowOrders = (tomorrowOrdersData || []) as OrderWithRelations[];

  // Fetch overdue orders (delivery_date < today, not completed/cancelled/ready)
  const { data: overdueOrdersData } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(name, phone),
      order_items(*)
    `)
    .lt("delivery_date", today)
    .not("status", "in", "(completed,cancelled,ready)")
    .order("delivery_date", { ascending: true });

  const overdueOrders = (overdueOrdersData || []) as OrderWithRelations[];

  // Fetch current stats
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  const { count: inProgressCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress");

  const { count: readyCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "ready");

  // Fetch yesterday's stats for trend comparison
  const { count: yesterdayTotalCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("delivery_date", yesterday);

  // Sort today's orders by status priority
  const sortedTodaysOrders = [...todaysOrders].sort(
    (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
  );

  // Derive attention items
  const todayNotReady = todaysOrders.filter(
    (o) => !["completed", "cancelled", "ready"].includes(o.status)
  );

  const hasAttentionItems =
    overdueOrders.length > 0 ||
    todayNotReady.length > 0 ||
    tomorrowOrders.length > 0;

  // Trend calculations
  const todayTotal = todaysOrders.length;
  const yesterdayTotal = yesterdayTotalCount || 0;
  const trendDiff = todayTotal - yesterdayTotal;

  // Orders needing work today (not completed/cancelled)
  const ordersToPrep = todaysOrders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Personalized Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">
            {getGreeting()}, {profileName}
          </h1>
          <p className="text-stone-500 mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <p className="text-stone-400 text-sm mt-0.5">
            {ordersToPrep > 0
              ? `You have ${ordersToPrep} order${ordersToPrep !== 1 ? "s" : ""} to prepare today`
              : "No orders on the board today"}
          </p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button className="bg-stone-800 hover:bg-stone-900 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-stone-200/60 shadow-sm">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500">Pending</p>
                <p className="text-2xl font-semibold text-stone-900 mt-1">
                  {pendingCount || 0}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                <Clock className="h-4 w-4 text-stone-500" />
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/60 shadow-sm">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500">In Progress</p>
                <p className="text-2xl font-semibold text-stone-900 mt-1">
                  {inProgressCount || 0}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                <ClipboardList className="h-4 w-4 text-stone-500" />
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2">Currently being made</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/60 shadow-sm">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500">Ready</p>
                <p className="text-2xl font-semibold text-stone-900 mt-1">
                  {readyCount || 0}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2">Ready for pickup</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/60 shadow-sm">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500">Today</p>
                <p className="text-2xl font-semibold text-stone-900 mt-1">
                  {todayTotal}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                <Calendar className="h-4 w-4 text-stone-500" />
              </div>
            </div>
            {trendDiff !== 0 ? (
              <div className="flex items-center gap-1 mt-2">
                {trendDiff > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-stone-400" />
                )}
                <p
                  className={`text-xs ${trendDiff > 0 ? "text-emerald-600" : "text-stone-400"}`}
                >
                  {Math.abs(trendDiff)} {trendDiff > 0 ? "more" : "fewer"} than
                  yesterday
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 mt-2">Same as yesterday</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attention-Needed Section */}
      <div>
        {hasAttentionItems ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
              Needs Attention
            </h2>

            {/* Overdue Orders */}
            {overdueOrders.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Overdue ({overdueOrders.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {overdueOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg bg-white/70 border border-red-100 px-3 py-2.5 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-800">
                          {formatOrderNumber(order.order_number)}
                        </span>
                        <span className="text-sm text-stone-500">
                          {order.customer?.name || "Walk-in"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">
                          Due {format(new Date(order.delivery_date), "MMM d")}
                        </span>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Due Today, Not Ready */}
            {todayNotReady.length > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarClock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    Due Today, Not Ready ({todayNotReady.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {todayNotReady.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg bg-white/70 border border-orange-100 px-3 py-2.5 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-800">
                          {formatOrderNumber(order.order_number)}
                        </span>
                        <span className="text-sm text-stone-500">
                          {order.customer?.name || "Walk-in"}
                        </span>
                        {order.delivery_time_slot && (
                          <span className="text-xs text-stone-400">
                            {order.delivery_time_slot}
                          </span>
                        )}
                      </div>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </Link>
                  ))}
                  {todayNotReady.length > 5 && (
                    <p className="text-xs text-orange-500 pl-3">
                      + {todayNotReady.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tomorrow's Orders */}
            {tomorrowOrders.length > 0 && (
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-stone-500" />
                  <span className="text-sm font-medium text-stone-600">
                    Tomorrow ({tomorrowOrders.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {tomorrowOrders.slice(0, 4).map((order) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg bg-white/60 border border-stone-100 px-3 py-2.5 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-800">
                          {formatOrderNumber(order.order_number)}
                        </span>
                        <span className="text-sm text-stone-500">
                          {order.customer?.name || "Walk-in"}
                        </span>
                        {order.delivery_time_slot && (
                          <span className="text-xs text-stone-400">
                            {order.delivery_time_slot}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">
                          {order.order_items?.length || 0} item
                          {(order.order_items?.length || 0) !== 1 ? "s" : ""}
                        </span>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {tomorrowOrders.length > 4 && (
                    <p className="text-xs text-stone-400 pl-3">
                      + {tomorrowOrders.length - 4} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-6 text-center">
            <Sparkles className="h-6 w-6 mx-auto text-stone-300" />
            <p className="mt-2 text-sm font-medium text-stone-600">
              All caught up!
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Nothing needs your attention right now
            </p>
          </div>
        )}
      </div>

      {/* Today's Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
            Today&apos;s Orders
          </h2>
          {todaysOrders.length > 0 && (
            <Link
              href="/dashboard/orders"
              className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
            >
              View all orders
            </Link>
          )}
        </div>

        {sortedTodaysOrders.length > 0 ? (
          <div className="grid gap-3">
            {sortedTodaysOrders.map((order) => {
              const itemsSummary = order.order_items
                .slice(0, 3)
                .map((item) =>
                  item.quantity > 1
                    ? `${item.quantity}x ${item.product_name}`
                    : item.product_name
                )
                .join(", ");
              const extraItems = order.order_items.length - 3;

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block"
                >
                  <Card className="border-stone-200/60 shadow-sm hover:border-stone-300 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-semibold text-stone-900 text-sm">
                              {formatOrderNumber(order.order_number)}
                            </span>
                            <Badge className={statusColors[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                            {order.delivery_time_slot && (
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {order.delivery_time_slot}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mt-1.5">
                            {order.customer?.name || "Walk-in Customer"}
                          </p>
                          {order.order_items.length > 0 && (
                            <p className="text-xs text-stone-400 mt-1 truncate">
                              {itemsSummary}
                              {extraItems > 0 && ` +${extraItems} more`}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-stone-700">
                            ${order.total?.toFixed(2)}
                          </p>
                          {order.is_delivery && (
                            <span className="text-xs text-stone-400">
                              Delivery
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border-stone-200/60 shadow-sm">
            <CardContent className="py-12 text-center">
              <PackageCheck className="h-10 w-10 mx-auto text-stone-200" />
              <p className="mt-3 text-sm text-stone-500">
                No orders scheduled for today
              </p>
              <Link href="/dashboard/orders/new">
                <Button className="mt-4 bg-stone-800 hover:bg-stone-900 shadow-sm text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/dashboard/orders">
            <Card className="border-stone-200/60 shadow-sm hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
                  <ClipboardList className="h-4 w-4 text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  All Orders
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/customers">
            <Card className="border-stone-200/60 shadow-sm hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
                  <Users className="h-4 w-4 text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  Customers
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/invoices/new">
            <Card className="border-stone-200/60 shadow-sm hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
                  <DollarSign className="h-4 w-4 text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  Add Invoice
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="border-stone-200/60 shadow-sm hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
                  <BarChart3 className="h-4 w-4 text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  Analytics
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
