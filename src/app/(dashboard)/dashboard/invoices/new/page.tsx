"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InvoiceLineItemsEditor,
  type LineItem,
} from "@/components/invoices/invoice-line-items-editor";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Sparkles,
  Save,
  ImageIcon,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // OCR state
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);

  // Form state
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Save state
  const [isSaving, setIsSaving] = useState(false);

  const isPDF = file?.type === "application/pdf";

  const handleFile = useCallback((selectedFile: File) => {
    const isImage = selectedFile.type.startsWith("image/");
    const isPdf = selectedFile.type === "application/pdf";

    if (!isImage && !isPdf) {
      toast.error("Please select an image or PDF file");
      return;
    }

    setFile(selectedFile);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, use a placeholder preview
      setPreview("pdf");
    }

    // Reset OCR state when new file is selected
    setOcrComplete(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setOcrComplete(false);
  };

  const processWithAI = async () => {
    if (!file) {
      toast.error("Please select an invoice image first");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/invoices/process-ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process invoice");
      }

      const data = await response.json();

      // Populate form with extracted data
      setSupplierName(data.supplier_name || "");
      setInvoiceNumber(data.invoice_number || "");
      setInvoiceDate(data.date || "");
      setTotalAmount(data.total?.toString() || "");
      setStoragePath(data.storage_path || null);

      if (data.line_items && Array.isArray(data.line_items)) {
        setLineItems(
          data.line_items.map(
            (item: { description?: string; quantity?: number; unit?: string; unit_cost?: number }) => ({
              description: item.description || "",
              quantity: item.quantity || 0,
              unit: item.unit || "",
              unit_cost: item.unit_cost || 0,
            })
          )
        );
      }

      setOcrComplete(true);
      toast.success("Invoice processed successfully", {
        description: `Confidence: ${Math.round((data.confidence || 0) * 100)}%`,
      });
    } catch (error) {
      console.error("OCR error:", error);
      toast.error("Failed to process invoice", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveInvoice = async () => {
    if (!supplierName.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    if (!invoiceDate) {
      toast.error("Invoice date is required");
      return;
    }

    setIsSaving(true);

    try {
      // Build the image URL from storage path
      let imageUrl: string | null = null;
      if (storagePath) {
        const { data: urlData } = supabase.storage
          .from("invoices")
          .getPublicUrl(storagePath);
        imageUrl = urlData.publicUrl;
      }

      // Insert invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          supplier_name: supplierName.trim(),
          invoice_number: invoiceNumber.trim() || null,
          invoice_date: invoiceDate,
          total_amount: totalAmount ? parseFloat(totalAmount) : null,
          image_url: imageUrl,
          status: lineItems.length > 0 ? "processed" : "pending",
        } as never)
        .select()
        .single();

      if (invoiceError || !invoice) {
        throw new Error(invoiceError?.message || "Failed to create invoice");
      }

      const invoiceRecord = invoice as unknown as { id: string };

      // Insert line items
      if (lineItems.length > 0) {
        const itemsToInsert = lineItems.map((item) => ({
          invoice_id: invoiceRecord.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || null,
          unit_cost: item.unit_cost || null,
          total_cost: item.quantity * item.unit_cost,
          is_matched: false,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert as never);

        if (itemsError) {
          console.error("Failed to insert line items:", itemsError);
          toast.error("Invoice created but some line items failed to save");
        }
      }

      toast.success("Invoice saved successfully");
      router.push(`/dashboard/invoices/${invoiceRecord.id}`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save invoice", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Invoice</h1>
          <p className="text-gray-500">
            Upload and process a supplier invoice with AI
          </p>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Invoice File
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-300 hover:border-amber-400"
              }`}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600">
                Drag and drop an invoice image or PDF here, or
              </p>
              <label className="mt-3 inline-block">
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white text-sm font-medium cursor-pointer hover:bg-amber-700 transition-colors">
                  <Upload className="h-4 w-4" />
                  Choose File
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-400">
                Supports JPEG, PNG, WebP, GIF, and PDF
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                {isPDF ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-gray-50">
                    <FileText className="h-10 w-10 text-red-500" />
                    <div>
                      <p className="font-medium">{file?.name}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={preview!}
                    alt="Invoice preview"
                    className="max-h-64 rounded-lg border object-contain"
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon-xs"
                  className="absolute -top-2 -right-2"
                  onClick={clearFile}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                {file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)
              </p>
              <Button
                onClick={processWithAI}
                disabled={isProcessing}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Process with AI
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Overlay for OCR */}
      {isProcessing && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-amber-800 font-medium">
                Analyzing invoice with AI...
              </p>
              <p className="text-amber-600 text-sm">
                This may take a few seconds
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier Name *</Label>
              <Input
                id="supplier"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Sysco Foods"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date *</Label>
              <Input
                id="date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total Amount</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceLineItemsEditor items={lineItems} onChange={setLineItems} />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Link href="/dashboard/invoices">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={saveInvoice}
          disabled={isSaving || !supplierName.trim() || !invoiceDate}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Invoice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
