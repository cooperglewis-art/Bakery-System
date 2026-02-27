import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, parseISO, format, differenceInDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
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
