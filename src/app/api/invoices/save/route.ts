import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const saveInvoiceSchema = z.object({
  supplier_name: z.string().min(1).max(200),
  invoice_number: z.string().max(100).optional().nullable(),
  invoice_date: z.string().optional().nullable(),
  total_amount: z.number().min(0).optional().nullable(),
  image_url: z.string().optional().nullable(),
  ocr_confidence: z.number().optional().nullable(),
  due_date: z.string().optional().nullable(),
  line_items: z.array(z.object({
    description: z.string().max(500),
    quantity: z.number().optional().nullable(),
    unit: z.string().max(50).optional().nullable(),
    unit_cost: z.number().optional().nullable(),
    total_cost: z.number().optional().nullable(),
  })).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`save-invoice:${user.id}`, 20, 60000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const rawBody = await request.json();
    const result = saveInvoiceSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 });
    }
    const body = result.data;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        supplier_name: body.supplier_name || "Unknown Supplier",
        invoice_number: body.invoice_number || null,
        invoice_date: body.invoice_date,
        total_amount: body.total_amount != null ? body.total_amount : null,
        image_url: body.image_url || null,
        ocr_confidence: body.ocr_confidence != null ? body.ocr_confidence : null,
        due_date: body.due_date || null,
        status: "processed",
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice insert error:", invoiceError);
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 500 }
      );
    }

    // Save line items
    if (body.line_items && body.line_items.length > 0) {
      const itemsToInsert = body.line_items.map(
        (item: { description?: string | null; quantity?: number | null; unit?: string | null; unit_cost?: number | null; total_cost?: number | null }) => ({
          invoice_id: invoice.id,
          description: item.description || "",
          quantity: item.quantity || 0,
          unit: item.unit || null,
          unit_cost: item.unit_cost || null,
          total_cost: (item.quantity || 0) * (item.unit_cost || 0),
          is_matched: false,
        })
      );

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Line items insert error:", itemsError);
      }
    }

    return NextResponse.json({ id: invoice.id });
  } catch (error) {
    console.error("Save invoice error:", error);
    return NextResponse.json(
      { error: "Failed to save invoice" },
      { status: 500 }
    );
  }
}
