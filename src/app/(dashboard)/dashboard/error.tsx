"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="rounded-full bg-amber-100 p-3">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="text-gray-500">
          We ran into an unexpected error. Please try again or contact support if
          the problem persists.
        </p>
        <Button
          onClick={reset}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
