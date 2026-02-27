import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewOrderClient } from "@/components/orders/new-order-client";
import type { Customer, Product, Category } from "@/types/database";

export default async function NewOrderPage() {
  const supabase = await createClient();

  const [customersRes, productsRes] = await Promise.all([
    supabase.from("customers").select("*").order("name"),
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("name"),
  ]);

  const customers = (customersRes.data || []) as Customer[];
  const products = (productsRes.data || []) as (Product & {
    category: Category | null;
  })[];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-500">Create a new customer order</p>
        </div>
      </div>

      <NewOrderClient customers={customers} products={products} />
    </div>
  );
}
