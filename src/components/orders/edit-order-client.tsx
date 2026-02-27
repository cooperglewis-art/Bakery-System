"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { OrderForm, type OrderFormData } from "@/components/orders/order-form";
import type { Order, Customer, OrderItem, Product, Category } from "@/types/database";

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
      const subtotal = data.orderItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const tax = subtotal * 0.075;
      const total = subtotal + tax;

      const { error: orderError } = await supabase
        .from("orders")
        .update({
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
        })
        .eq("id", order.id);

      if (orderError) throw orderError;

      // Delete existing items and re-insert
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", order.id);

      if (deleteError) throw deleteError;

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

      toast.success(`Order #${order.order_number} updated!`);
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
