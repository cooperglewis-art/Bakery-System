import { createClient } from "@/lib/supabase/server";
import { PosTerminal } from "@/components/pos/pos-terminal";

export default async function PosPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("name"),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-amber-900 mb-4">Point of Sale</h1>
      <PosTerminal
        products={products ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
