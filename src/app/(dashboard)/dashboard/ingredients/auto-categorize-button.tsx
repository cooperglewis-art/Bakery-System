"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AutoCategorizeButton({
  uncategorizedCount,
}: {
  uncategorizedCount: number;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorize = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ingredients/categorize", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to categorize");

      const data = await response.json();
      toast.success(`Categorized ${data.updated} ingredient${data.updated !== 1 ? "s" : ""}`);
      router.refresh();
    } catch {
      toast.error("Failed to auto-categorize ingredients");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCategorize}
      disabled={isLoading}
      className="bg-amber-600 hover:bg-amber-700"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      Auto-categorize ({uncategorizedCount})
    </Button>
  );
}
