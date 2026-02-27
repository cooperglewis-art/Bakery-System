"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  Loader2,
  ImageIcon,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface QueuedFile {
  id: string;
  file: File;
  status: "pending" | "processing" | "saving" | "done" | "error";
  preview: string | null;
  error?: string;
  invoiceId?: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const queued: QueuedFile[] = [];

    for (const file of Array.from(newFiles)) {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        toast.error(`Skipped "${file.name}" — unsupported file type`);
        continue;
      }

      const entry: QueuedFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "pending",
        preview: null,
      };

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, preview: e.target?.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      queued.push(entry);
    }

    setFiles((prev) => [...prev, ...queued]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const processAndSaveFile = async (queued: QueuedFile): Promise<void> => {
    // Update status to processing
    setFiles((prev) =>
      prev.map((f) => (f.id === queued.id ? { ...f, status: "processing" } : f))
    );

    try {
      // Step 1: OCR
      const formData = new FormData();
      formData.append("file", queued.file);

      const response = await fetch("/api/invoices/process-ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process invoice");
      }

      const data = await response.json();

      // Step 2: Save
      setFiles((prev) =>
        prev.map((f) => (f.id === queued.id ? { ...f, status: "saving" } : f))
      );

      let imageUrl: string | null = null;
      if (data.storage_path) {
        const { data: urlData } = supabase.storage
          .from("invoices")
          .getPublicUrl(data.storage_path);
        imageUrl = urlData.publicUrl;
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          supplier_name: data.supplier_name || "Unknown Supplier",
          invoice_number: data.invoice_number || null,
          invoice_date: data.date || new Date().toISOString().split("T")[0],
          total_amount: data.total || null,
          image_url: imageUrl,
          ocr_confidence: data.confidence || null,
          status: "processed" as const,
        } as never)
        .select()
        .single();

      if (invoiceError || !invoice) {
        throw new Error(invoiceError?.message || "Failed to save invoice");
      }

      const invoiceRecord = invoice as unknown as { id: string };

      // Save line items
      if (data.line_items && Array.isArray(data.line_items) && data.line_items.length > 0) {
        const itemsToInsert = data.line_items.map(
          (item: { description?: string; quantity?: number; unit?: string; unit_cost?: number }) => ({
            invoice_id: invoiceRecord.id,
            description: item.description || "",
            quantity: item.quantity || 0,
            unit: item.unit || null,
            unit_cost: item.unit_cost || null,
            total_cost: (item.quantity || 0) * (item.unit_cost || 0),
            is_matched: false,
          })
        );

        await supabase.from("invoice_items").insert(itemsToInsert as never);
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === queued.id
            ? { ...f, status: "done", invoiceId: invoiceRecord.id }
            : f
        )
      );
    } catch (error) {
      console.error(`Error processing ${queued.file.name}:`, error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === queued.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : f
        )
      );
    }
  };

  const handleSubmit = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) {
      toast.error("No files to process");
      return;
    }

    setIsSubmitting(true);

    // Process files sequentially to avoid rate limits
    for (const queued of pending) {
      await processAndSaveFile(queued);
    }

    setIsSubmitting(false);

    const results = files.filter((f) => f.status === "done" || f.status === "error");
    const successes = results.filter((f) => f.status === "done");
    const failures = results.filter((f) => f.status === "error");

    if (successes.length > 0 && failures.length === 0) {
      toast.success(
        `${successes.length} invoice${successes.length > 1 ? "s" : ""} processed and saved`
      );
      if (successes.length === 1 && successes[0].invoiceId) {
        router.push(`/dashboard/invoices/${successes[0].invoiceId}`);
      } else {
        router.push("/dashboard/invoices");
      }
    } else if (successes.length > 0) {
      toast.success(
        `${successes.length} saved, ${failures.length} failed`
      );
    } else {
      toast.error("All invoices failed to process");
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const processingFile = files.find(
    (f) => f.status === "processing" || f.status === "saving"
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Upload Invoices</h1>
          <p className="text-gray-500">
            Upload invoices to process with AI and save automatically
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Invoice Files
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              Drag and drop invoice images or PDFs here, or
            </p>
            <label className="mt-3 inline-block">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white text-sm font-medium cursor-pointer hover:bg-amber-700 transition-colors">
                <Upload className="h-4 w-4" />
                Choose Files
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-400">
              Supports JPEG, PNG, WebP, GIF, and PDF — select multiple files
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Queue */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((queued) => (
                <div
                  key={queued.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    queued.status === "done"
                      ? "bg-green-50 border-green-200"
                      : queued.status === "error"
                        ? "bg-red-50 border-red-200"
                        : queued.status === "processing" || queued.status === "saving"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Preview / Icon */}
                  {queued.file.type === "application/pdf" ? (
                    <FileText className="h-10 w-10 text-red-500 shrink-0" />
                  ) : queued.preview ? (
                    <img
                      src={queued.preview}
                      alt=""
                      className="h-10 w-10 rounded object-cover shrink-0"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-gray-400 shrink-0" />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {queued.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(queued.file.size / 1024).toFixed(1)} KB
                      {queued.status === "processing" && " — Processing with AI..."}
                      {queued.status === "saving" && " — Saving..."}
                      {queued.status === "done" && " — Saved"}
                      {queued.status === "error" && ` — ${queued.error}`}
                    </p>
                  </div>

                  {/* Status Icon */}
                  {queued.status === "processing" || queued.status === "saving" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600 shrink-0" />
                  ) : queued.status === "done" ? (
                    queued.invoiceId ? (
                      <Link href={`/dashboard/invoices/${queued.invoiceId}`}>
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      </Link>
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    )
                  ) : queued.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(queued.id)}
                      className="shrink-0"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {processingFile && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-amber-800 font-medium">
                {processingFile.status === "saving"
                  ? "Saving invoice..."
                  : "Analyzing invoice with AI..."}
              </p>
              <p className="text-amber-600 text-sm">
                {processingFile.file.name}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/dashboard/invoices">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || pendingCount === 0}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
