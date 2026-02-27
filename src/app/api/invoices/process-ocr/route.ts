import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const isPDF = file.type === "application/pdf";
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);

    if (!isPDF && !isImage) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload an image (JPEG, PNG, WebP, GIF) or PDF." },
        { status: 400 }
      );
    }

    // Read file as buffer for both storage upload and base64 conversion
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Upload to Supabase Storage using service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("invoices")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    const storagePath = uploadData.path;

    // Send to Claude for OCR extraction
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    // Build the content block based on file type
    const fileContent: Anthropic.Messages.ContentBlockParam = isPDF
      ? {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64,
          },
        }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: file.type as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: base64,
          },
        };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            fileContent,
            {
              type: "text",
              text: `Analyze this supplier invoice and extract the following information. Return ONLY valid JSON with no additional text or markdown formatting.

{
  "supplier_name": "The name of the supplier/vendor",
  "invoice_number": "The invoice number or reference",
  "date": "The invoice date in YYYY-MM-DD format",
  "total": 0.00,
  "confidence": 0.95,
  "line_items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unit": "unit of measurement (e.g., lbs, oz, each, case, bag)",
      "unit_cost": 0.00
    }
  ]
}

Rules:
- "confidence" should be a number between 0 and 1 representing how confident you are in the overall extraction accuracy.
- "total" should be the invoice total as a number.
- For each line item, extract the description, quantity, unit, and unit cost.
- If a field cannot be determined, use null for strings and 0 for numbers.
- Ensure the date is in YYYY-MM-DD format. If the year is unclear, assume the current year.
- Return ONLY the JSON object, no other text.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let extractedData;
    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedData = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse Claude response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse OCR results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...extractedData,
      storage_path: storagePath,
    });
  } catch (error) {
    console.error("OCR processing error:", error);
    return NextResponse.json(
      { error: "Failed to process invoice" },
      { status: 500 }
    );
  }
}
