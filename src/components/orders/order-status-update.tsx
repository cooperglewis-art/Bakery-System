"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Package,
  XCircle,
  Loader2,
} from "lucide-react";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
}

const statusConfig = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    icon: CheckCircle,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: ChefHat,
    color: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
  },
  {
    value: "ready",
    label: "Ready",
    icon: Package,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
  },
];

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    setUpdatingStatus(newStatus);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Record status change in history (non-blocking)
      const { data: { user } } = await supabase.auth.getUser();
      supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          old_status: currentStatus,
          new_status: newStatus,
          changed_by: user?.id || null,
        })
        .then(({ error: historyError }) => {
          if (historyError) {
            console.error("Failed to record status history:", historyError);
          }
        });

      toast.success(`Order status updated to ${newStatus.replace("_", " ")}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  const getNextStatuses = () => {
    const statusOrder = ["pending", "confirmed", "in_progress", "ready", "completed"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === "cancelled") {
      return ["pending"];
    }

    if (currentStatus === "completed") {
      return [];
    }

    const nextStatuses: string[] = [];
    if (currentIndex >= 0 && currentIndex < statusOrder.length - 1) {
      nextStatuses.push(statusOrder[currentIndex + 1]);
    }
    if (currentStatus !== "cancelled") {
      nextStatuses.push("cancelled");
    }

    return nextStatuses;
  };

  const nextStatuses = getNextStatuses();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Update Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Status */}
        <div className="p-3 rounded-lg bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Current Status</p>
          <p className="font-semibold capitalize">
            {currentStatus.replace("_", " ")}
          </p>
        </div>

        {/* Quick Status Buttons */}
        {nextStatuses.length > 0 ? (
          <div className="space-y-2">
            {nextStatuses.map((status) => {
              const config = statusConfig.find((s) => s.value === status);
              if (!config) return null;

              const Icon = config.icon;
              const isLoading = isUpdating && updatingStatus === status;

              return (
                <Button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating}
                  className={`w-full ${config.color} ${config.hoverColor} text-white`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4 mr-2" />
                  )}
                  Mark as {config.label}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">
            This order is {currentStatus.replace("_", " ")}. No further updates needed.
          </p>
        )}

        {/* All Status Options (collapsed by default) */}
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Show all status options
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {statusConfig.map((config) => {
              const Icon = config.icon;
              const isActive = currentStatus === config.value;
              const isLoading = isUpdating && updatingStatus === config.value;

              return (
                <Button
                  key={config.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusUpdate(config.value)}
                  disabled={isUpdating || isActive}
                  className={isActive ? config.color : ""}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Icon className="h-3 w-3 mr-1" />
                  )}
                  {config.label}
                </Button>
              );
            })}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
