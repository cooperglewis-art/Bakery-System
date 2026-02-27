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
import { InvoiceClickableRow } from "@/components/invoices/invoice-clickable-row";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle, ClipboardCheck, DollarSign, FileText, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInDays,
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
    sort?: string;
    dir?: string;
  }>;
}) {
  const { status: statusFilter, period, dateFrom, dateTo, sort, dir } = await searchParams;
  const supabase = await createClient();

  // Sorting
  const sortColumn = sort === "date" ? "invoice_date" : sort === "amount" ? "total_amount" : sort === "due_date" ? "due_date" : null;
  const sortAsc = dir === "asc";

  let query = supabase
    .from("invoices")
    .select("*, invoice_items(count)")
    .order(sortColumn || "created_at", { ascending: sortColumn ? sortAsc : false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Default to "this_month" when no period or custom dates specified
  const effectivePeriod = period || (dateFrom || dateTo ? undefined : "this_month");

  // Apply date filtering
  const dateRange = effectivePeriod ? getDateRange(effectivePeriod) : null;
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
  const activePeriod = period || (dateFrom || dateTo ? "custom" : "this_month");

  // Compute period totals
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.total_amount ?? 0),
    0
  );
  const periodLabel = { this_week: "This Week", this_month: "This Month", last_month: "Last Month", all_time: "All Time", custom: "Custom Range" }[activePeriod] || activePeriod;

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "processed", label: "Processed" },
    { value: "verified", label: "Verified" },
  ];

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && value !== "all") {
        // Keep "all_time" as explicit param; omit "this_month" since it's the default
        if (key === "period" && value === "this_month") continue;
        sp.set(key, value);
      }
    }
    const qs = sp.toString();
    return `/dashboard/invoices${qs ? `?${qs}` : ""}`;
  }

  function sortUrl(column: "date" | "amount" | "due_date") {
    // Toggle: no sort → desc → asc → no sort
    let newDir: string | undefined;
    if (sort === column) {
      newDir = dir === "desc" ? "asc" : undefined;
    } else {
      newDir = "desc";
    }
    return buildUrl({
      status: activeFilter,
      period: activePeriod,
      dateFrom,
      dateTo,
      sort: newDir ? column : undefined,
      dir: newDir,
    });
  }

  function SortIcon({ column }: { column: "date" | "amount" | "due_date" }) {
    if (sort !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return dir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
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
                period: option.value,
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

      {/* Period Summary */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="flex items-center gap-3 py-4">
          <DollarSign className="h-5 w-5 text-amber-700" />
          <span className="text-lg font-semibold text-amber-900">
            ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm text-amber-700">
            &mdash; {periodLabel}: {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

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
                  <TableHead className="p-0">
                    <Link href={sortUrl("date")} className="inline-flex items-center gap-1 px-3 py-2 text-inherit no-underline hover:text-gray-900">
                      Date <SortIcon column="date" />
                    </Link>
                  </TableHead>
                  <TableHead className="p-0">
                    <Link href={sortUrl("due_date")} className="inline-flex items-center gap-1 px-3 py-2 text-inherit no-underline hover:text-gray-900">
                      Due Date <SortIcon column="due_date" />
                    </Link>
                  </TableHead>
                  <TableHead className="p-0">
                    <Link href={sortUrl("amount")} className="inline-flex items-center gap-1 px-3 py-2 text-inherit no-underline hover:text-gray-900">
                      Total <SortIcon column="amount" />
                    </Link>
                  </TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const itemCount =
                    invoice.invoice_items?.[0]?.count ?? 0;

                  // Due date indicator
                  let dueDateDisplay: React.ReactNode = "-";
                  if (invoice.due_date) {
                    const dueDate = new Date(invoice.due_date + "T00:00:00");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysUntilDue = differenceInDays(dueDate, today);
                    const formatted = format(dueDate, "MMM d, yyyy");

                    if (daysUntilDue < 0) {
                      dueDateDisplay = <span className="text-red-600 font-medium">{formatted} <span className="text-xs">(overdue)</span></span>;
                    } else if (daysUntilDue <= 7) {
                      dueDateDisplay = <span className="text-amber-600 font-medium">{formatted}</span>;
                    } else {
                      dueDateDisplay = <span className="text-gray-600">{formatted}</span>;
                    }
                  }

                  return (
                    <InvoiceClickableRow key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                      <TableCell className="font-medium text-gray-900">
                        {invoice.supplier_name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {invoice.invoice_number || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(invoice.invoice_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {dueDateDisplay}
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
                    </InvoiceClickableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />
              {activePeriod !== "all_time" || activeFilter !== "all" ? (
                <p className="mt-4 text-gray-500">No invoices for this period</p>
              ) : (
                <>
                  <p className="mt-4 text-gray-500">No invoices found</p>
                  <Link href="/dashboard/invoices/new">
                    <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Invoice
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
