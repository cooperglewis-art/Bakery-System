import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { descriptions } = (await request.json()) as {
      descriptions: string[];
    };

    if (!descriptions || !Array.isArray(descriptions)) {
      return NextResponse.json(
        { error: "descriptions array is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all ingredients
    const { data: ingredients, error } = await supabase
      .from("ingredients")
      .select("id, name, unit")
      .order("name");

    if (error) {
      console.error("Failed to fetch ingredients:", error);
      return NextResponse.json(
        { error: "Failed to fetch ingredients" },
        { status: 500 }
      );
    }

    // Perform fuzzy matching for each description
    const matches = descriptions.map((description) => {
      const descLower = description.toLowerCase().trim();
      let bestMatch: {
        ingredient_id: string;
        ingredient_name: string;
        confidence: number;
      } | null = null;

      for (const ingredient of ingredients || []) {
        const ingredientLower = ingredient.name.toLowerCase();

        // Exact match
        if (descLower === ingredientLower) {
          bestMatch = {
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            confidence: 1.0,
          };
          break;
        }

        // Check if ingredient name is contained in description or vice versa
        if (
          descLower.includes(ingredientLower) ||
          ingredientLower.includes(descLower)
        ) {
          const confidence =
            Math.min(descLower.length, ingredientLower.length) /
            Math.max(descLower.length, ingredientLower.length);

          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              ingredient_id: ingredient.id,
              ingredient_name: ingredient.name,
              confidence: Math.round(confidence * 100) / 100,
            };
          }
        }

        // Check individual words overlap
        const descWords = descLower.split(/\s+/);
        const ingredientWords = ingredientLower.split(/\s+/);
        const matchingWords = descWords.filter((w) =>
          ingredientWords.some((iw: string) => iw.includes(w) || w.includes(iw))
        );

        if (matchingWords.length > 0) {
          const wordConfidence =
            matchingWords.length /
            Math.max(descWords.length, ingredientWords.length);

          if (
            wordConfidence > 0.3 &&
            (!bestMatch || wordConfidence > bestMatch.confidence)
          ) {
            bestMatch = {
              ingredient_id: ingredient.id,
              ingredient_name: ingredient.name,
              confidence: Math.round(wordConfidence * 100) / 100,
            };
          }
        }
      }

      return {
        description,
        ingredient_id: bestMatch?.ingredient_id || null,
        ingredient_name: bestMatch?.ingredient_name || null,
        confidence: bestMatch?.confidence || 0,
      };
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Ingredient matching error:", error);
    return NextResponse.json(
      { error: "Failed to match ingredients" },
      { status: 500 }
    );
  }
}
