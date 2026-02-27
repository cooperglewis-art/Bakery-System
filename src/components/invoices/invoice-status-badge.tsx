import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Processed",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  processed: {
    label: "Processed",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  verified: {
    label: "Verified",
    className: "bg-green-100 text-green-800 border-green-300",
  },
};

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.processed;

  return (
    <Badge className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
}
