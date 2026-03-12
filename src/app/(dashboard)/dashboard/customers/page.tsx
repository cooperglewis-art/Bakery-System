import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Phone, Mail, FileText, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Customer } from "@/types/database";
import CustomerRowActions from "./customer-row-actions";
import { PaginationNav } from "@/components/ui/pagination-nav";

export const metadata = { title: "Customers" };

const PAGE_SIZE = 25;

interface SearchParams {
  search?: string;
  page?: string;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("name");

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`
    );
  }

  const { data, count } = await query.range(from, to);
  const customers = data as Customer[] | null;
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customer database</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="bg-stone-800 hover:bg-stone-900">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search by name, phone, or email..."
                defaultValue={params.search}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers && customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-stone-50">
                    <TableCell>
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="font-medium text-stone-700 hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.order_count} orders</Badge>
                    </TableCell>
                    <TableCell>
                      {customer.notes ? (
                        <span className="text-sm text-gray-500 truncate max-w-[200px] block">
                          {customer.notes}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(customer.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <CustomerRowActions
                        customerId={customer.id}
                        customerName={customer.name}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="rounded-full bg-stone-100 p-4 mb-4">
                        <Users className="h-8 w-8 text-stone-400" />
                      </div>
                      <h3 className="text-lg font-medium text-stone-900 mb-1">No customers yet</h3>
                      <p className="text-sm text-stone-500 mb-6 text-center max-w-sm">Add your first customer to start tracking orders</p>
                      <Link href="/dashboard/customers/new">
                        <Button className="bg-stone-800 hover:bg-stone-900 text-white">Add Customer</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers && customers.length > 0 ? (
          customers.map((customer) => (
            <Link key={customer.id} href={`/dashboard/customers/${customer.id}`}>
              <Card className="hover:border-stone-300 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-stone-700">{customer.name}</p>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{customer.order_count}</Badge>
                  </div>
                  {customer.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                      <FileText className="h-3 w-3 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-500 line-clamp-2">
                        {customer.notes}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-stone-100 p-4 mb-4">
              <Users className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-1">No customers yet</h3>
            <p className="text-sm text-stone-500 mb-6 text-center max-w-sm">Add your first customer to start tracking orders</p>
            <Link href="/dashboard/customers/new">
              <Button className="bg-stone-800 hover:bg-stone-900 text-white">Add Customer</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      <PaginationNav
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        itemLabel="customers"
        basePath="/dashboard/customers"
        searchParams={{ search: params.search }}
      />
    </div>
  );
}
