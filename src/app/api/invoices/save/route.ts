import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

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
        (item: { description?: string; quantity?: number; unit?: string; unit_cost?: number }) => ({
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
