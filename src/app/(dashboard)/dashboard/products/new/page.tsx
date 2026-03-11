import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Category } from "@/types/database";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");
  const categories = (categoriesData as Category[]) ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
          <p className="text-gray-500">Add a new product to your bakery menu</p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
