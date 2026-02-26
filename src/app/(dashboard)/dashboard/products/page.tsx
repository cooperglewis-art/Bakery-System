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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, Tag } from "lucide-react";
import Link from "next/link";
import type { Category, Product } from "@/types/database";

type ProductWithCategory = Product & { category: Category | null };

interface SearchParams {
  search?: string;
  category?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");
  const categories = categoriesData as Category[] | null;

  // Fetch products
  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("name");

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  if (params.category && params.category !== "all") {
    query = query.eq("category_id", params.category);
  }

  const { data: productsData } = await query;
  const products = productsData as ProductWithCategory[] | null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your bakery menu</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/products/categories">
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Categories
            </Button>
          </Link>
          <Link href="/dashboard/products/new">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search products..."
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

      {/* Category Tabs */}
      <Tabs defaultValue={params.category || "all"} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="all" asChild>
              <Link href="/dashboard/products">All</Link>
            </TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.id} asChild>
                <Link href={`/dashboard/products?category=${category.id}`}>
                  {category.name}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={params.category || "all"} className="mt-6">
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Prep Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-amber-50">
                        <TableCell>
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="font-medium text-amber-700 hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[300px]">
                              {product.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="outline">{product.category.name}</Badge>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${product.base_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {product.prep_time_hours}h
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Link key={product.id} href={`/dashboard/products/${product.id}`}>
                  <Card className="hover:border-amber-300 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-amber-700">{product.name}</p>
                            <Badge
                              className={
                                product.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {product.category && (
                            <Badge variant="outline" className="mt-1">
                              {product.category.name}
                            </Badge>
                          )}
                          {product.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${product.base_price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{product.prep_time_hours}h prep</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No products found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-8 w-8 mx-auto text-amber-600" />
            <p className="text-2xl font-bold mt-2">{products?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Tag className="h-8 w-8 mx-auto text-amber-600" />
            <p className="text-2xl font-bold mt-2">{categories?.length || 0}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">
              {products?.filter((p) => p.is_active).length || 0}
            </p>
            <p className="text-sm text-gray-500">Active Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">
              ${products && products.length > 0
                ? (products.reduce((sum, p) => sum + p.base_price, 0) / products.length).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-sm text-gray-500">Avg. Price</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
