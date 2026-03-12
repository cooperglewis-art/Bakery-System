import { createClient } from "@/lib/supabase/server";
import { AutoCategorizeButton } from "./auto-categorize-button";
import { IngredientsManager } from "@/components/ingredients/ingredients-manager";
import { PaginationNav } from "@/components/ui/pagination-nav";
import type { Ingredient } from "@/types/database";

export const metadata = { title: "Ingredients" };

const PAGE_SIZE = 50;

interface SearchParams {
  page?: string;
}

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: ingredientsData, count } = await supabase
    .from("ingredients")
    .select("*", { count: "exact" })
    .order("category")
    .order("name")
    .range(from, to);

  const ingredients = (ingredientsData || []) as Ingredient[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
            {totalCount} ingredient{totalCount !== 1 ? "s" : ""}{" "}
            across{" "}
            {
              new Set(
                ingredients
                  .map((i) => i.category || "Other")
                  .filter(Boolean)
              ).size
            }{" "}
            categories
            {totalPages > 1 && (
              <span>
                {" "}&middot; Page {page} of {totalPages}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {uncategorizedCount > 0 && (
            <AutoCategorizeButton uncategorizedCount={uncategorizedCount} />
          )}
        </div>
      </div>

      <IngredientsManager ingredients={ingredients} />

      {/* Pagination */}
      <PaginationNav
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        itemLabel="ingredients"
        basePath="/dashboard/ingredients"
      />
    </div>
  );
}
