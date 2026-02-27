import { createClient } from "@/lib/supabase/server";
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
    .select("id, name, unit")
    .order("name");

  const ingredients = (ingredientsData || []) as Pick<
    Ingredient,
    "id" | "name" | "unit"
  >[];

  // Generate a signed URL for the invoice image if it exists
  let signedImageUrl: string | null = null;
  if (invoice.image_url) {
    // Extract the storage path from the public URL
    const urlParts = invoice.image_url.split("/invoices/");
    const storagePath = urlParts.length > 1 ? urlParts[urlParts.length - 1] : null;

    if (storagePath) {
      const { data: signedData } = await supabase.storage
        .from("invoices")
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      signedImageUrl = signedData?.signedUrl || invoice.image_url;
    } else {
      signedImageUrl = invoice.image_url;
    }
  }

  return (
    <InvoiceVerifyClient
      invoice={invoice}
      items={invoice.invoice_items}
      ingredients={ingredients}
      signedImageUrl={signedImageUrl}
    />
  );
}
