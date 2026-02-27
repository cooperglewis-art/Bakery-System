"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";

interface InvoiceClickableRowProps {
  href: string;
  children: React.ReactNode;
}

export function InvoiceClickableRow({ href, children }: InvoiceClickableRowProps) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) return;
        router.push(href);
      }}
    >
      {children}
    </TableRow>
  );
}
