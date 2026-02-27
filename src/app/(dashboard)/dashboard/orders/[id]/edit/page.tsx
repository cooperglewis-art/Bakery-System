import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditOrderClient } from "@/components/orders/edit-order-client";
import type { Order, Customer, OrderItem, Product, Category } from "@/types/database";

type OrderWithItems = Order & {
  customer: Customer | null;
  order_items: OrderItem[];
};

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [orderRes, customersRes, productsRes] = await Promise.all([
    supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        order_items(*)
      `)
      .eq("id", id)
      .single(),
    supabase.from("customers").select("*").order("name"),
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (orderRes.error || !orderRes.data) {
    notFound();
  }

  const order = orderRes.data as unknown as OrderWithItems;
  const customers = (customersRes.data || []) as Customer[];
  const products = (productsRes.data || []) as (Product & {
    category: Category | null;
  })[];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/orders/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Order #{order.order_number}
          </h1>
          <p className="text-gray-500">Update order details</p>
        </div>
      </div>

      <EditOrderClient
        order={order}
        customers={customers}
        products={products}
      />
    </div>
  );
}
