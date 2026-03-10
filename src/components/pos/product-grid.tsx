"use client";

import { cn } from "@/lib/utils";
import type { Product, Category } from "@/types/database";

interface ProductGridProps {
  products: (Product & { category: Category | null })[];
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onProductTap: (product: Product & { category: Category | null }) => void;
}

export function ProductGrid({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  onProductTap,
}: ProductGridProps) {
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-amber-200">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selectedCategory === null
              ? "bg-amber-600 text-white"
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === cat.id
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto flex-1">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductTap(product)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-center min-h-[100px]"
          >
            <span className="font-medium text-amber-900 text-sm leading-tight">
              {product.name}
            </span>
            <span className="text-amber-600 font-semibold mt-1">
              ${product.base_price.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
