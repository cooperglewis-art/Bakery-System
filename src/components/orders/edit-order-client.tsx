"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { OrderForm, type OrderFormData } from "@/components/orders/order-form";
import type { Order, Customer, OrderItem, Product, Category } from "@/types/database";
import { TAX_RATE } from "@/lib/config";
import { formatOrderNumber } from "@/lib/order-number";

type OrderWithItems = Order & {
  customer: Customer | null;
  order_items: OrderItem[];
};

interface EditOrderClientProps {
  order: OrderWithItems;
  customers: Customer[];
  products: (Product & { category: Category | null })[];
}

export function EditOrderClient({
  order,
  customers,
  products,
}: EditOrderClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const initialData: OrderFormData = {
    customerId: order.customer_id,
    source: order.source,
    deliveryDate: parseISO(order.delivery_date),
    deliveryTimeSlot: order.delivery_time_slot || "",
    isDelivery: order.is_delivery,
    deliveryAddress: order.delivery_address || "",
    depositPaid: order.deposit_paid,
    notes: order.notes || "",
    orderItems: order.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      notes: item.notes || "",
    })),
  };

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
      const validItems = data.orderItems.filter((item) => item.productName);
      const orderItemsData = validItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        notes: item.notes || null,
      }));

      // Recalculate from items to ensure integrity
      const subtotal = orderItemsData.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = subtotal + tax;

      // Save original order values for potential rollback
      const originalOrder = {
        customer_id: order.customer_id,
        source: order.source,
        delivery_date: order.delivery_date,
        delivery_time_slot: order.delivery_time_slot,
        is_delivery: order.is_delivery,
        delivery_address: order.delivery_address,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        deposit_paid: order.deposit_paid,
        notes: order.notes,
      };

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          customer_id: data.customerId,
          source: data.source as
            | "call"
            | "text"
            | "dm_instagram"
            | "dm_facebook"
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
        })
        .eq("id", order.id);

      if (orderError) throw orderError;

      // Save existing items for potential rollback
      const { data: existingItems } = await supabase
        .from("order_items")
        .select()
        .eq("order_id", order.id);

      // Delete existing items and re-insert
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", order.id);

      if (deleteError) {
        // Rollback order update
        await supabase
          .from("orders")
          .update(originalOrder)
          .eq("id", order.id);
        throw deleteError;
      }

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) {
        // Rollback: restore original order and items
        await supabase
          .from("orders")
          .update(originalOrder)
          .eq("id", order.id);
        if (existingItems && existingItems.length > 0) {
          await supabase.from("order_items").insert(existingItems);
        }
        throw itemsError;
      }

      toast.success(`Order ${formatOrderNumber(order.order_number)} updated!`);
      router.push(`/dashboard/orders/${order.id}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderForm
      initialData={initialData}
      customers={customers}
      products={products}
      onSubmit={handleSubmit}
      submitLabel="Update Order"
      isSubmitting={isLoading}
    />
  );
}
