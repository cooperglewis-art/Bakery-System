"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Category, Product } from "@/types/database";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    product?.base_price?.toString() ?? ""
  );
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "none");
  const [prepTimeHours, setPrepTimeHours] = useState(
    product?.prep_time_hours?.toString() ?? "1"
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const prepTime = parseFloat(prepTimeHours);
    if (isNaN(prepTime) || prepTime < 0) {
      toast.error("Please enter a valid prep time");
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      base_price: price,
      category_id: categoryId === "none" ? null : categoryId,
      prep_time_hours: prepTime,
      is_active: isActive,
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(payload);

        if (error) throw error;
        toast.success("Product created successfully");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(isEditing ? "Failed to update product" : "Failed to create product", {
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chocolate Cake"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
              rows={3}
            />
          </div>

          {/* Price and Prep Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">
                Base Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prep_time_hours">Prep Time (hours)</Label>
              <Input
                id="prep_time_hours"
                type="number"
                step="0.5"
                min="0"
                value={prepTimeHours}
                onChange={(e) => setPrepTimeHours(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <Label htmlFor="is_active">Active product</Label>
            <span className="text-sm text-gray-500">
              (Inactive products won&apos;t appear in order forms)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700"
          disabled={saving}
        >
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
