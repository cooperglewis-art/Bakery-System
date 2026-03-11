import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Customer } from "@/types/database";
import CustomerDetailClient from "./customer-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <CustomerDetailClient customer={data as Customer} />;
}
