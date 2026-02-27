import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { OrdersPagination } from "@/components/orders/orders-pagination";
import type { Order } from "@/types/database";

type OrderWithRelations = Order & {
  customer: { name: string; phone: string | null } | null;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number }[];
};

interface SearchParams {
  status?: string;
  search?: string;
  date?: string;
  page?: string;
}

const PAGE_SIZE = 25;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const currentPage = Math.max(1, parseInt(params.page || "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // If searching, find matching customer IDs first
  let customerIds: string[] | null = null;
  if (params.search) {
    const { data: matchingCustomers } = await supabase
      .from("customers")
      .select("id")
      .or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`);

    customerIds = matchingCustomers?.map((c) => c.id) || [];
  }

  // Build query
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(name, phone),
      order_items(id, product_name, quantity, unit_price)
    `,
      { count: "exact" }
    )
    .order("delivery_date", { ascending: true })
    .order("created_at", { ascending: false });

  // Apply filters
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.date) {
    query = query.eq("delivery_date", params.date);
  }

  // Apply search: match on order_number OR customer IDs
  if (params.search) {
    const searchTerm = params.search;
    const orderNumFilter = `order_number.eq.${parseInt(searchTerm) || 0}`;

    if (customerIds && customerIds.length > 0) {
      query = query.or(
        `${orderNumFilter},customer_id.in.(${customerIds.join(",")})`
      );
    } else {
      // Only search by order number if no customers match
      query = query.or(orderNumFilter);
    }
  }

  const { data, count } = await query.range(offset, offset + PAGE_SIZE - 1);
  const orders = (data || []) as OrderWithRelations[];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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

  const sourceLabels: Record<string, string> = {
    call: "Call",
    text: "Text",
    dm_instagram: "Instagram",
    dm_facebook: "Facebook",
    walk_in: "Walk-in",
    website: "Website",
    other: "Other",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">
            {totalCount} total order{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="search"
                  placeholder="Search by customer name, phone, or order #..."
                  defaultValue={params.search}
                  className="pl-10"
                />
              </div>
            </div>
            <Select name="status" defaultValue={params.status || "all"}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              name="date"
              defaultValue={params.date}
              className="w-full md:w-40"
            />
            <Button type="submit" variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Orders Table (Desktop) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-amber-50">
                    <TableCell>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-medium text-amber-700 hover:underline"
                      >
                        #{order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.customer?.name || "Walk-in"}
                        </p>
                        {order.customer?.phone && (
                          <p className="text-sm text-gray-500">{order.customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {order.order_items?.length || 0} item(s)
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {order.order_items
                          ?.map((item: { product_name: string }) => item.product_name)
                          .join(", ")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{format(new Date(order.delivery_date), "MMM d, yyyy")}</p>
                      {order.delivery_time_slot && (
                        <p className="text-sm text-gray-500">{order.delivery_time_slot}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {sourceLabels[order.source] || order.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Orders Cards (Mobile) */}
      <div className="md:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <Card className="hover:border-amber-300 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-amber-700">
                          #{order.order_number}
                        </span>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="font-medium mt-1">
                        {order.customer?.name || "Walk-in"}
                      </p>
                      {order.customer?.phone && (
                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${order.total?.toFixed(2)}</p>
                      <Badge variant="outline" className="capitalize mt-1">
                        {sourceLabels[order.source]}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {format(new Date(order.delivery_date), "MMM d, yyyy")}
                        {order.delivery_time_slot && ` • ${order.delivery_time_slot}`}
                      </span>
                      <span className="text-gray-500">
                        {order.order_items?.length || 0} item(s)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No orders found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      <OrdersPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
