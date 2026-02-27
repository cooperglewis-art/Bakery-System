import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { OrderStatusUpdate } from "@/components/orders/order-status-update";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import type { Order, Customer, OrderItem, Profile } from "@/types/database";

type OrderWithRelations = Order & {
  customer: Customer | null;
  order_items: OrderItem[];
  created_by_user: Pick<Profile, "full_name"> | null;
};

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  note: string | null;
  changed_by_user: { full_name: string } | null;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [orderRes, historyRes] = await Promise.all([
    supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        created_by_user:profiles(full_name)
      `)
      .eq("id", id)
      .single(),
    supabase
      .from("order_status_history")
      .select(`
        id,
        old_status,
        new_status,
        changed_at,
        note,
        changed_by_user:profiles(full_name)
      `)
      .eq("order_id", id)
      .order("changed_at", { ascending: false }),
  ]);

  if (orderRes.error || !orderRes.data) {
    notFound();
  }

  const order = orderRes.data as unknown as OrderWithRelations;
  const statusHistory = (historyRes.data || []) as unknown as StatusHistoryEntry[];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    in_progress: "bg-indigo-100 text-indigo-800 border-indigo-300",
    ready: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-gray-100 text-gray-800 border-gray-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
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
    call: "Phone Call",
    text: "Text Message",
    dm_instagram: "Instagram DM",
    dm_facebook: "Facebook DM",
    walk_in: "Walk-in",
    website: "Website",
    other: "Other",
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number}
              </h1>
              <Badge className={`${statusColors[order.status]} border`}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <p className="text-gray-500">
              Created {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/orders/${id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-amber-700 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>${order.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total?.toFixed(2)}</span>
                </div>
                {order.deposit_paid > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Deposit Paid</span>
                      <span>-${order.deposit_paid?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Balance Due</span>
                      <span>${(order.total - order.deposit_paid).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <OrderStatusTimeline history={statusHistory} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-3">
                  <p className="font-medium text-lg">{order.customer.name}</p>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="hover:text-amber-700"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  )}
                  {order.customer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${order.customer.email}`}
                        className="hover:text-amber-700"
                      >
                        {order.customer.email}
                      </a>
                    </div>
                  )}
                  {order.customer.notes && (
                    <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                      {order.customer.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Walk-in Customer</p>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {order.is_delivery ? "Delivery" : "Pickup"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(order.delivery_date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              {order.delivery_time_slot && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="capitalize">
                    {order.delivery_time_slot === "morning" && "Morning (8am-12pm)"}
                    {order.delivery_time_slot === "afternoon" && "Afternoon (12pm-4pm)"}
                    {order.delivery_time_slot === "evening" && "Evening (4pm-7pm)"}
                  </span>
                </div>
              )}
              {order.is_delivery && order.delivery_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="whitespace-pre-wrap">{order.delivery_address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Source */}
          <Card>
            <CardHeader>
              <CardTitle>Order Source</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-base">
                {sourceLabels[order.source] || order.source}
              </Badge>
              {order.created_by_user && (
                <p className="text-sm text-gray-500 mt-2">
                  Created by {order.created_by_user.full_name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
