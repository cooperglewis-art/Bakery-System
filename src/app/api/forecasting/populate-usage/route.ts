import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, parseISO, format, differenceInDays } from "date-fns";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const populateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`populate-usage:${user.id}`, 5, 60000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = populateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 });
    }
    const { startDate, endDate } = result.data;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalDays = differenceInDays(end, start) + 1;

    if (totalDays < 1 || totalDays > 365) {
      return NextResponse.json(
        { error: "Date range must be between 1 and 365 days" },
        { status: 400 }
      );
    }

    let populated = 0;

    for (let i = 0; i < totalDays; i++) {
      const targetDate = format(addDays(start, i), "yyyy-MM-dd");

      const { error } = await supabase.rpc("populate_ingredient_usage", {
        target_date: targetDate,
      });

      if (error) {
        console.error(`Error populating usage for ${targetDate}:`, error);
        continue;
      }

      populated++;
    }

    return NextResponse.json({ populated });
  } catch (error) {
    console.error("Error in populate-usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
