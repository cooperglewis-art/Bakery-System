import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Category, Product } from "@/types/database";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-product-button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [productResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  if (productResult.error || !productResult.data) {
    notFound();
  }

  const product = productResult.data as Product;
  const categories = (categoriesResult.data as Category[]) ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-500">{product.name}</p>
          </div>
        </div>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
