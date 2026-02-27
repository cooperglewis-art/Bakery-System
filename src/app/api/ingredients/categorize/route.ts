import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categorizeIngredient } from "@/lib/ingredient-categories";

export async function POST() {
  const supabase = await createClient();

  const { data: ingredients, error: fetchError } = await supabase
    .from("ingredients")
    .select("id, name, category")
    .or("category.is.null,category.eq.Other");

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  let updatedCount = 0;

  for (const ingredient of ingredients || []) {
    const category = categorizeIngredient(ingredient.name);
    if (category !== "Other" && category !== ingredient.category) {
      const { error } = await supabase
        .from("ingredients")
        .update({ category } as never)
        .eq("id", ingredient.id);

      if (!error) updatedCount++;
    }
  }

  return NextResponse.json({ updated: updatedCount });
}
