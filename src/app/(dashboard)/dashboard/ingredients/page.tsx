import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wheat, Package, DollarSign, AlertTriangle } from "lucide-react";
import { INGREDIENT_CATEGORIES } from "@/lib/ingredient-categories";
import { AutoCategorizeButton } from "./auto-categorize-button";
import type { Ingredient } from "@/types/database";

export default async function IngredientsPage() {
  const supabase = await createClient();

  const { data: ingredientsData } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");

  const ingredients = (ingredientsData || []) as Ingredient[];

  const grouped: Record<string, Ingredient[]> = {};
  for (const category of INGREDIENT_CATEGORIES) {
    grouped[category] = [];
  }
  for (const ingredient of ingredients) {
    const cat = ingredient.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ingredient);
  }

  const uncategorizedCount = ingredients.filter(
    (i) => !i.category || i.category === "Other"
  ).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
          <p className="text-gray-500">
            {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} across{" "}
            {Object.values(grouped).filter((g) => g.length > 0).length} categories
          </p>
        </div>
        {uncategorizedCount > 0 && (
          <AutoCategorizeButton uncategorizedCount={uncategorizedCount} />
        )}
      </div>

      {/* Category Sections */}
      {INGREDIENT_CATEGORIES.map((category) => {
        const items = grouped[category];
        if (!items || items.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-amber-600" />
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
                    className="flex items-start gap-3 rounded-lg border p-3 bg-white"
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
                              ingredient.current_stock < ingredient.min_stock_level
                                ? "text-red-600 font-medium"
                                : ""
                            }`}
                          >
                            {ingredient.min_stock_level != null &&
                              ingredient.current_stock < ingredient.min_stock_level && (
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
              Ingredients are created when you process invoices
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
