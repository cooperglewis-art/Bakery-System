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
import { InvoiceDeleteButton } from "@/components/invoices/invoice-delete-button";
import { CheckCircle, ClipboardCheck, FileText, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { InvoiceDateFilter } from "./invoice-date-filter";
import type { Invoice } from "@/types/database";

type InvoiceWithCount = Invoice & {
  invoice_items: { count: number }[];
};

function getDateRange(period: string): { from: string; to: string } | null {
  const now = new Date();
  switch (period) {
    case "this_week":
      return {
        from: format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd"),
        to: format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd"),
      };
    case "this_month":
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return {
        from: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        to: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    }
    default:
      return null;
  }
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const { status: statusFilter, period, dateFrom, dateTo } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select("*, invoice_items(count)")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Apply date filtering
  const dateRange = period ? getDateRange(period) : null;
  const effectiveFrom = dateRange?.from || dateFrom;
  const effectiveTo = dateRange?.to || dateTo;

  if (effectiveFrom) {
    query = query.gte("invoice_date", effectiveFrom);
  }
  if (effectiveTo) {
    query = query.lte("invoice_date", effectiveTo);
  }

  const { data: invoicesData } = await query;
  const invoices = (invoicesData || []) as unknown as InvoiceWithCount[];

  const activeFilter = statusFilter || "all";
  const activePeriod = period || (dateFrom || dateTo ? "custom" : "all_time");

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "processed", label: "Processed" },
    { value: "verified", label: "Verified" },
  ];

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && value !== "all" && value !== "all_time") {
        sp.set(key, value);
      }
    }
    const qs = sp.toString();
    return `/dashboard/invoices${qs ? `?${qs}` : ""}`;
  }

  const periodOptions = [
    { value: "all_time", label: "All Time" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
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

      {/* Filters */}
      <div className="space-y-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-1">Status:</span>
          {statusOptions.map((option) => (
            <Link
              key={option.value}
              href={buildUrl({
                status: option.value,
                period: activePeriod !== "all_time" && activePeriod !== "custom" ? period : undefined,
                dateFrom: activePeriod === "custom" ? dateFrom : undefined,
                dateTo: activePeriod === "custom" ? dateTo : undefined,
              })}
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

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-1">Period:</span>
          {periodOptions.map((option) => (
            <Link
              key={option.value}
              href={buildUrl({
                status: activeFilter,
                period: option.value !== "all_time" ? option.value : undefined,
              })}
            >
              <Button
                variant={activePeriod === option.value ? "default" : "outline"}
                size="sm"
                className={
                  activePeriod === option.value
                    ? "bg-amber-600 hover:bg-amber-700"
                    : ""
                }
              >
                {option.label}
              </Button>
            </Link>
          ))}
          <InvoiceDateFilter
            activeStatus={activeFilter}
            activePeriod={activePeriod}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </div>
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
                  <TableHead>Actions</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {invoice.status === "processed" && (
                            <Link href={`/dashboard/invoices/${invoice.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Verify invoice"
                              >
                                <ClipboardCheck className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {invoice.status === "verified" && (
                            <span className="flex items-center justify-center w-8 h-8" title="Verified">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </span>
                          )}
                          <InvoiceDeleteButton
                            invoiceId={invoice.id}
                            supplierName={invoice.supplier_name}
                          />
                        </div>
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
