import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { FileText, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Invoice } from "@/types/database";

type InvoiceWithCount = Invoice & {
  invoice_items: { count: number }[];
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select("*, invoice_items(count)")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: invoicesData, error } = await query;
  const invoices = (invoicesData || []) as unknown as InvoiceWithCount[];

  const activeFilter = statusFilter || "all";

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processed", label: "Processed" },
    { value: "verified", label: "Verified" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">
            Manage supplier invoices and track costs
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            Upload Invoice
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {filterOptions.map((option) => (
          <Link
            key={option.value}
            href={
              option.value === "all"
                ? "/dashboard/invoices"
                : `/dashboard/invoices?status=${option.value}`
            }
          >
            <Button
              variant={activeFilter === option.value ? "default" : "outline"}
              size="sm"
              className={
                activeFilter === option.value
                  ? "bg-amber-600 hover:bg-amber-700"
                  : ""
              }
            >
              {option.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const itemCount =
                    invoice.invoice_items?.[0]?.count ?? 0;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-medium text-amber-700 hover:text-amber-800 hover:underline"
                        >
                          {invoice.supplier_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {invoice.invoice_number || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(invoice.invoice_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.total_amount != null
                          ? `$${invoice.total_amount.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">No invoices found</p>
              <Link href="/dashboard/invoices/new">
                <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Invoice
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
