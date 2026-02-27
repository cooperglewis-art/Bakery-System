"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface InvoiceDateFilterProps {
  activeStatus: string;
  activePeriod: string;
  dateFrom?: string;
  dateTo?: string;
}

export function InvoiceDateFilter({
  activeStatus,
  activePeriod,
  dateFrom,
  dateTo,
}: InvoiceDateFilterProps) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom || "");
  const [to, setTo] = useState(dateTo || "");

  const handleApply = () => {
    const params = new URLSearchParams();
    if (activeStatus && activeStatus !== "all") {
      params.set("status", activeStatus);
    }
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    const qs = params.toString();
    router.push(`/dashboard/invoices${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-300">|</span>
      <Calendar className="h-4 w-4 text-gray-400" />
      <Input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="h-8 w-36 text-xs"
        placeholder="From"
      />
      <span className="text-gray-400 text-xs">to</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="h-8 w-36 text-xs"
        placeholder="To"
      />
      <Button
        size="sm"
        variant={activePeriod === "custom" ? "default" : "outline"}
        className={activePeriod === "custom" ? "bg-amber-600 hover:bg-amber-700" : ""}
        onClick={handleApply}
        disabled={!from && !to}
      >
        Filter
      </Button>
    </div>
  );
}
