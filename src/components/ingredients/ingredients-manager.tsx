"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wheat,
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { INGREDIENT_CATEGORIES } from "@/lib/ingredient-categories";
import type { Ingredient } from "@/types/database";

interface IngredientFormData {
  name: string;
  unit: string;
  unit_cost: string;
  supplier: string;
  category: string;
  min_stock_level: string;
  current_stock: string;
}

const emptyForm: IngredientFormData = {
  name: "",
  unit: "",
  unit_cost: "",
  supplier: "",
  category: "Other",
  min_stock_level: "",
  current_stock: "0",
};

function ingredientToForm(ingredient: Ingredient): IngredientFormData {
  return {
    name: ingredient.name,
    unit: ingredient.unit,
    unit_cost: ingredient.unit_cost != null ? String(ingredient.unit_cost) : "",
    supplier: ingredient.supplier || "",
    category: ingredient.category || "Other",
    min_stock_level:
      ingredient.min_stock_level != null
        ? String(ingredient.min_stock_level)
        : "",
    current_stock: String(ingredient.current_stock ?? 0),
  };
}

export function IngredientsManager({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState<IngredientFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const grouped: Record<string, Ingredient[]> = {};
  for (const category of INGREDIENT_CATEGORIES) {
    grouped[category] = [];
  }
  for (const ingredient of ingredients) {
    const cat = ingredient.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ingredient);
  }

  const updateField = (field: keyof IngredientFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.unit.trim()) {
      toast.error("Name and unit are required");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("ingredients").insert({
        name: form.name.trim(),
        unit: form.unit.trim(),
        unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : null,
        supplier: form.supplier.trim() || null,
        category: form.category,
        min_stock_level: form.min_stock_level
          ? parseFloat(form.min_stock_level)
          : null,
        current_stock: form.current_stock ? parseFloat(form.current_stock) : 0,
      });
      if (error) throw error;
      toast.success(`Added "${form.name.trim()}"`);
      setAddOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err) {
      toast.error(
        `Failed to add ingredient: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !form.name.trim() || !form.unit.trim()) {
      toast.error("Name and unit are required");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("ingredients")
        .update({
          name: form.name.trim(),
          unit: form.unit.trim(),
          unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : null,
          supplier: form.supplier.trim() || null,
          category: form.category,
          min_stock_level: form.min_stock_level
            ? parseFloat(form.min_stock_level)
            : null,
          current_stock: form.current_stock
            ? parseFloat(form.current_stock)
            : 0,
        })
        .eq("id", editingId);
      if (error) throw error;
      toast.success(`Updated "${form.name.trim()}"`);
      setEditOpen(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      toast.error(
        `Failed to update ingredient: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("ingredients")
        .delete()
        .eq("id", editingId);
      if (error) throw error;
      toast.success("Ingredient deleted");
      setDeleteConfirmOpen(false);
      setEditOpen(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      toast.error(
        `Failed to delete ingredient: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setForm(ingredientToForm(ingredient));
    setEditOpen(true);
  };

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g. All-Purpose Flour"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="unit">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Input
            id="unit"
            value={form.unit}
            onChange={(e) => updateField("unit", e.target.value)}
            placeholder="e.g. kg, lbs, each"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unit_cost">Unit Cost ($)</Label>
          <Input
            id="unit_cost"
            type="number"
            step="0.01"
            min="0"
            value={form.unit_cost}
            onChange={(e) => updateField("unit_cost", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={form.category}
          onValueChange={(val) => updateField("category", val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {INGREDIENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={form.supplier}
          onChange={(e) => updateField("supplier", e.target.value)}
          placeholder="e.g. ACME Foods"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current_stock">Current Stock</Label>
          <Input
            id="current_stock"
            type="number"
            step="0.01"
            min="0"
            value={form.current_stock}
            onChange={(e) => updateField("current_stock", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="min_stock_level">Min Stock Level</Label>
          <Input
            id="min_stock_level"
            type="number"
            step="0.01"
            min="0"
            value={form.min_stock_level}
            onChange={(e) => updateField("min_stock_level", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Add Ingredient Button */}
      <Button
        onClick={() => {
          setForm(emptyForm);
          setAddOpen(true);
        }}
        className="bg-stone-800 hover:bg-stone-900"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Ingredient
      </Button>

      {/* Category Sections */}
      {INGREDIENT_CATEGORIES.map((category) => {
        const items = grouped[category];
        if (!items || items.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-stone-600" />
                {category}
              </CardTitle>
              <CardDescription>
                {items.length} ingredient{items.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => openEdit(ingredient)}
                    className="flex items-start gap-3 rounded-lg border p-3 bg-white cursor-pointer hover:border-stone-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {ingredient.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {ingredient.unit}
                        </span>
                        {ingredient.unit_cost != null && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {ingredient.unit_cost.toFixed(2)}/{ingredient.unit}
                          </span>
                        )}
                        {ingredient.current_stock != null && (
                          <span
                            className={`flex items-center gap-1 ${
                              ingredient.min_stock_level != null &&
                              ingredient.current_stock <
                                ingredient.min_stock_level
                                ? "text-red-600 font-medium"
                                : ""
                            }`}
                          >
                            {ingredient.min_stock_level != null &&
                              ingredient.current_stock <
                                ingredient.min_stock_level && (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                            Stock: {ingredient.current_stock}
                          </span>
                        )}
                      </div>
                      {ingredient.supplier && (
                        <p className="mt-1 text-xs text-gray-400 truncate">
                          {ingredient.supplier}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {ingredients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wheat className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">No ingredients found</p>
            <p className="text-sm text-gray-400">
              Click &quot;Add Ingredient&quot; to get started
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
            <DialogDescription>
              Add a new ingredient to your inventory.
            </DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving}
              className="bg-stone-800 hover:bg-stone-900"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update ingredient details or delete it.
            </DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter className="flex !justify-between">
            <Button
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={saving}
                className="bg-stone-800 hover:bg-stone-900"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ingredient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{form.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
