"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  FileText,
  Package,
  Trash2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Invoice, InvoiceItem, Ingredient } from "@/types/database";

type InvoiceItemWithIngredient = InvoiceItem & {
  ingredient: Pick<Ingredient, "id" | "name" | "unit"> | null;
};

interface IngredientOption {
  id: string;
  name: string;
  unit: string;
}

interface ItemMatch {
  ingredient_id: string | null;
  ingredient_name: string | null;
  confidence: number;
}

interface InvoiceVerifyClientProps {
  invoice: Invoice;
  items: InvoiceItemWithIngredient[];
  ingredients: IngredientOption[];
  signedImageUrl: string | null;
  fileType?: "image" | "pdf";
}

export function InvoiceVerifyClient({
  invoice,
  items,
  ingredients,
  signedImageUrl,
  fileType = "image",
}: InvoiceVerifyClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const isVerified = invoice.status === "verified";

  const [editableItems, setEditableItems] = useState(
    items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || "",
      unit_cost: item.unit_cost || 0,
      total_cost: item.total_cost || 0,
      ingredient_id: item.ingredient_id || item.ingredient?.id || null,
    }))
  );

  const [suggestedMatches, setSuggestedMatches] = useState<
    Record<string, ItemMatch>
  >({});
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const loadMatches = useCallback(async () => {
    const unmatchedDescriptions = items
      .filter((item) => !item.ingredient_id && !item.ingredient)
      .map((item) => item.description);

    if (unmatchedDescriptions.length === 0) return;

    setIsLoadingMatches(true);

    try {
      const response = await fetch("/api/invoices/match-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptions: unmatchedDescriptions }),
      });

      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();

      const matchMap: Record<string, ItemMatch> = {};
      for (const match of data.matches) {
        if (match.ingredient_id && match.confidence > 0.3) {
          matchMap[match.description] = {
            ingredient_id: match.ingredient_id,
            ingredient_name: match.ingredient_name,
            confidence: match.confidence,
          };
        }
      }

      setSuggestedMatches(matchMap);

      setEditableItems((prev) =>
        prev.map((item) => {
          if (!item.ingredient_id && matchMap[item.description]) {
            return {
              ...item,
              ingredient_id: matchMap[item.description].ingredient_id,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Match error:", error);
    } finally {
      setIsLoadingMatches(false);
    }
  }, [items]);

  useEffect(() => {
    if (!isVerified) {
      loadMatches();
    }
  }, [isVerified, loadMatches]);

  const updateItemIngredient = (itemId: string, ingredientId: string | null) => {
    setEditableItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, ingredient_id: ingredientId }
          : item
      )
    );
  };

  const verifyInvoice = async () => {
    setIsVerifying(true);

    try {
      for (const item of editableItems) {
        if (item.ingredient_id) {
          const { error: itemError } = await supabase
            .from("invoice_items")
            .update({
              ingredient_id: item.ingredient_id,
              is_matched: true,
            } as never)
            .eq("id", item.id);

          if (itemError) {
            console.error("Failed to update item:", itemError);
          }

          if (item.unit_cost > 0) {
            const { error: ingredientError } = await supabase
              .from("ingredients")
              .update({
                unit_cost: item.unit_cost,
              } as never)
              .eq("id", item.ingredient_id);

            if (ingredientError) {
              console.error("Failed to update ingredient cost:", ingredientError);
            }
          }
        }
      }

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({ status: "verified" } as never)
        .eq("id", invoice.id);

      if (invoiceError) {
        throw new Error(invoiceError.message);
      }

      toast.success("Invoice verified");
      router.refresh();
    } catch (error) {
      console.error("Verify error:", error);
      toast.error("Failed to verify invoice");
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = isVerified ? "processed" : "verified";
    setIsTogglingStatus(true);

    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus } as never)
        .eq("id", invoice.id);

      if (error) throw error;

      toast.success(`Invoice marked as ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const deleteInvoice = async () => {
    if (!confirm(`Delete this invoice from ${invoice.supplier_name}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id);

      if (error) throw error;

      toast.success("Invoice deleted");
      router.push("/dashboard/invoices");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.supplier_name}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-gray-500">
              {invoice.invoice_number
                ? `Invoice #${invoice.invoice_number} - `
                : ""}
              {format(new Date(invoice.invoice_date), "MMMM d, yyyy")}
              {invoice.total_amount != null &&
                ` - $${invoice.total_amount.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <Button
              variant="outline"
              onClick={toggleStatus}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Mark as Processed
            </Button>
          ) : (
            <Button
              onClick={verifyInvoice}
              disabled={isVerifying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Verify Invoice
            </Button>
          )}

          <Button
            variant="outline"
            onClick={deleteInvoice}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Invoice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Original Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signedImageUrl ? (
              <div className="rounded-lg border overflow-hidden bg-gray-50">
                {fileType === "pdf" ? (
                  <iframe
                    src={signedImageUrl}
                    title={`Invoice from ${invoice.supplier_name}`}
                    className="w-full h-[600px]"
                  />
                ) : (
                  <img
                    src={signedImageUrl}
                    alt={`Invoice from ${invoice.supplier_name}`}
                    className="w-full h-auto object-contain max-h-[600px]"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 border rounded-lg bg-gray-50">
                <FileText className="h-16 w-16" />
                <p className="mt-4 text-gray-500">No image available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Line Items
              {isLoadingMatches && (
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Matched Ingredient</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit || "-"}</TableCell>
                      <TableCell>
                        {item.unit_cost != null
                          ? `$${item.unit_cost.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.total_cost != null
                          ? `$${item.total_cost.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.ingredient ? (
                          <span className="text-green-700 text-sm font-medium">
                            {item.ingredient.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not matched
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="min-w-[180px]">
                      Match Ingredient
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableItems.map((item) => {
                    const suggested = suggestedMatches[item.description];

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.unit_cost > 0
                            ? `$${item.unit_cost.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.unit_cost > 0
                            ? `$${(item.quantity * item.unit_cost).toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Select
                              value={item.ingredient_id || "none"}
                              onValueChange={(value) =>
                                updateItemIngredient(
                                  item.id,
                                  value === "none" ? null : value
                                )
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  -- No match --
                                </SelectItem>
                                {ingredients.map((ing) => (
                                  <SelectItem key={ing.id} value={ing.id}>
                                    {ing.name} ({ing.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {suggested && !item.ingredient_id && (
                              <p className="text-xs text-amber-600">
                                Suggested: {suggested.ingredient_name} (
                                {Math.round(suggested.confidence * 100)}%)
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {editableItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-8"
                      >
                        No line items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
