"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderForm, type OrderFormData } from "@/components/orders/order-form";
import { TAX_RATE } from "@/lib/config";
import type { Customer, Product, Category } from "@/types/database";

interface NewOrderClientProps {
  customers: Customer[];
  products: (Product & { category: Category | null })[];
}

export function NewOrderClient({ customers, products }: NewOrderClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: OrderFormData) => {
    if (!data.deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }

    if (data.orderItems.every((item) => !item.productName)) {
      toast.error("Please add at least one item");
      return;
    }

    setIsLoading(true);

    try {
      const subtotal = data.orderItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;

      const orderData = {
        customer_id: data.customerId,
        source: data.source as
          | "call"
          | "text"
          | "dm_instagram"
          | "dm_facebook"
          | "walk_in"
          | "website"
          | "other",
        delivery_date: format(data.deliveryDate, "yyyy-MM-dd"),
        delivery_time_slot: data.deliveryTimeSlot || null,
        is_delivery: data.isDelivery,
        delivery_address: data.isDelivery ? data.deliveryAddress : null,
        subtotal,
        tax,
        total,
        deposit_paid: data.depositPaid,
        notes: data.notes || null,
        status: "pending" as const,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Failed to create order");

      const validItems = data.orderItems.filter((item) => item.productName);
      const orderItemsData = validItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      if (data.customerId) {
        await supabase.rpc("increment_customer_order_count", {
          customer_id: data.customerId,
        });
      }

      toast.success(`Order #${order.order_number} created!`);
      router.push(`/dashboard/orders/${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderForm
      customers={customers}
      products={products}
      onSubmit={handleSubmit}
      submitLabel="Create Order"
      isSubmitting={isLoading}
    />
  );
}
