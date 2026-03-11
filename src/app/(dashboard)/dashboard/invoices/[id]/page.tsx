import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { InvoiceVerifyClient } from "@/components/invoices/invoice-verify-client";
import type { Invoice, InvoiceItem, Ingredient } from "@/types/database";

type InvoiceItemWithIngredient = InvoiceItem & {
  ingredient: Pick<Ingredient, "id" | "name" | "unit"> | null;
};

type InvoiceWithItems = Invoice & {
  invoice_items: InvoiceItemWithIngredient[];
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items(
        *,
        ingredient:ingredients(id, name, unit)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const invoice = data as unknown as InvoiceWithItems;

  // Fetch all ingredients for the matching dropdown
  const { data: ingredientsData } = await supabase
    .from("ingredients")
    .select("id, name, unit, category")
    .order("name");

  const ingredients = (ingredientsData || []) as Pick<
    Ingredient,
    "id" | "name" | "unit" | "category"
  >[];

  // Generate a signed URL for the invoice file if it exists
  let signedImageUrl: string | null = null;
  let fileType: "image" | "pdf" = "image";
  if (invoice.image_url) {
    // image_url stores either a bare storage path (e.g. "1234-invoice.pdf")
    // or a full public URL. Extract the storage path either way.
    let storagePath: string;
    if (invoice.image_url.startsWith("http")) {
      const urlParts = invoice.image_url.split("/invoices/");
      storagePath = urlParts.length > 1 ? urlParts[urlParts.length - 1] : invoice.image_url;
    } else {
      storagePath = invoice.image_url;
    }

    if (storagePath.toLowerCase().endsWith(".pdf")) {
      fileType = "pdf";
    }

    console.log("[Invoice Debug] image_url:", invoice.image_url);
    console.log("[Invoice Debug] storagePath:", storagePath);

    // Use service role client for storage access (files were uploaded with service role)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from("invoices")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    console.log("[Invoice Debug] signedUrl:", signedData?.signedUrl ? "OK" : "null");
    console.log("[Invoice Debug] signedError:", signedError);

    signedImageUrl = signedData?.signedUrl || null;
  } else {
    console.log("[Invoice Debug] No image_url on invoice", invoice.id);
  }

  return (
    <InvoiceVerifyClient
      invoice={invoice}
      items={invoice.invoice_items}
      ingredients={ingredients}
      signedImageUrl={signedImageUrl}
      fileType={fileType}
    />
  );
}
