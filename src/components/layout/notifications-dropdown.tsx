"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatOrderNumber } from "@/lib/order-number";
import { format } from "date-fns";
import {
  Bell,
  AlertTriangle,
  CalendarClock,
  Wheat,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "overdue" | "due_today" | "low_stock";
  message: string;
  timestamp: string;
  href?: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");
    const items: Notification[] = [];

    // Fetch overdue orders (delivery_date < today, not completed/cancelled/ready)
    const { data: overdueOrders } = await supabase
      .from("orders")
      .select("id, order_number, delivery_date, status, customer_id, customers(name)")
      .lt("delivery_date", today)
      .not("status", "in", "(completed,cancelled,ready)")
      .order("delivery_date", { ascending: true })
      .limit(10);

    if (overdueOrders) {
      for (const order of overdueOrders) {
        const customerName =
          ((order.customers as unknown) as { name: string } | null)?.name || "Walk-in";
        items.push({
          id: `overdue-${order.id}`,
          type: "overdue",
          message: `${formatOrderNumber(order.order_number)} for ${customerName} is overdue (due ${format(new Date(order.delivery_date), "MMM d")})`,
          timestamp: order.delivery_date,
          href: `/dashboard/orders/${order.id}`,
        });
      }
    }

    // Fetch orders due today that aren't ready
    const { data: dueTodayOrders } = await supabase
      .from("orders")
      .select("id, order_number, delivery_date, delivery_time_slot, status, customer_id, customers(name)")
      .eq("delivery_date", today)
      .not("status", "in", "(completed,cancelled,ready)")
      .order("delivery_time_slot", { ascending: true })
      .limit(10);

    if (dueTodayOrders) {
      for (const order of dueTodayOrders) {
        const customerName =
          ((order.customers as unknown) as { name: string } | null)?.name || "Walk-in";
        const timeSlot = order.delivery_time_slot
          ? ` (${order.delivery_time_slot})`
          : "";
        items.push({
          id: `due-today-${order.id}`,
          type: "due_today",
          message: `${formatOrderNumber(order.order_number)} for ${customerName} is due today${timeSlot}`,
          timestamp: today,
          href: `/dashboard/orders/${order.id}`,
        });
      }
    }

    // Fetch low stock ingredients
    const { data: lowStockIngredients } = await supabase
      .from("ingredients")
      .select("id, name, current_stock, min_stock_level, unit")
      .not("min_stock_level", "is", null)
      .limit(50);

    if (lowStockIngredients) {
      for (const ingredient of lowStockIngredients) {
        if (
          ingredient.min_stock_level !== null &&
          ingredient.current_stock < ingredient.min_stock_level
        ) {
          items.push({
            id: `low-stock-${ingredient.id}`,
            type: "low_stock",
            message: `${ingredient.name} is low: ${ingredient.current_stock} ${ingredient.unit} remaining (min: ${ingredient.min_stock_level})`,
            timestamp: format(new Date(), "yyyy-MM-dd"),
            href: "/dashboard/ingredients",
          });
        }
      }
    }

    setNotifications(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const hasNotifications = notifications.length > 0;

  const iconForType = (type: Notification["type"]) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      case "due_today":
        return <CalendarClock className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
      case "low_stock":
        return <Wheat className="h-3.5 w-3.5 text-amber-600 shrink-0" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-stone-500 hover:text-stone-700 transition-colors duration-200"
        >
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-800">
            Notifications
          </h3>
          {hasNotifications && (
            <p className="text-xs text-stone-400 mt-0.5">
              {notifications.length} alert{notifications.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <ScrollArea className={notifications.length > 5 ? "h-72" : ""}>
          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stone-400">Loading...</p>
            </div>
          ) : hasNotifications ? (
            <div className="py-1">
              {notifications.map((notification) => (
                <a
                  key={notification.id}
                  href={notification.href}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors duration-150"
                >
                  <div className="mt-0.5">{iconForType(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {format(new Date(notification.timestamp), "MMM d, yyyy")}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-stone-300" />
              <p className="text-sm text-stone-500 mt-2">No notifications</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Everything looks good
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
