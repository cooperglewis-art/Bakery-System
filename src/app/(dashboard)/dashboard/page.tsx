import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Order, OrderItem } from "@/types/database";

type TodaysOrder = Order & {
  customer: { name: string; phone: string | null } | null;
  order_items: OrderItem[];
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get today's date
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch today's orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(name, phone),
      order_items(*)
    `)
    .eq("delivery_date", today)
    .order("delivery_time_slot", { ascending: true });

  const todaysOrders = (ordersData || []) as TodaysOrder[];

  // Fetch order stats
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

  // Status color mapping
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount || 0}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount || 0}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readyCount || 0}</p>
                <p className="text-sm text-gray-500">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaysOrders?.length || 0}</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Today&apos;s Orders
          </CardTitle>
          <CardDescription>
            Orders scheduled for pickup/delivery today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaysOrders && todaysOrders.length > 0 ? (
            <div className="space-y-4">
              {todaysOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          #{order.order_number}
                        </span>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                        {order.delivery_time_slot && (
                          <span className="text-sm text-gray-500">
                            {order.delivery_time_slot}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.customer?.name || "Walk-in Customer"}
                        {order.customer?.phone && ` • ${order.customer.phone}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.order_items?.length || 0} item(s) •{" "}
                        ${order.total?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {order.source.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">No orders scheduled for today</p>
              <Link href="/dashboard/orders/new">
                <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/orders">
          <Card className="hover:border-amber-300 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <ClipboardList className="h-8 w-8 mx-auto text-amber-600" />
              <p className="mt-2 font-medium">All Orders</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customers">
          <Card className="hover:border-amber-300 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-amber-600" />
              <p className="mt-2 font-medium">Customers</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/invoices/new">
          <Card className="hover:border-amber-300 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-amber-600" />
              <p className="mt-2 font-medium">Add Invoice</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/forecasting">
          <Card className="hover:border-amber-300 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-amber-600" />
              <p className="mt-2 font-medium">Forecasting</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
