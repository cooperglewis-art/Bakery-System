"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-stone-900 mb-1">Something went wrong</h3>
      <p className="text-sm text-stone-500 mb-6 text-center max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="bg-stone-800 hover:bg-stone-900 text-white"
      >
        Try again
      </Button>
    </div>
  );
}
