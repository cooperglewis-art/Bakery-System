import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SupplierSpendingTableProps {
  data: {
    supplier: string;
    totalSpent: number;
    invoiceCount: number;
  }[];
}

export function SupplierSpendingTable({ data }: SupplierSpendingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Spending</CardTitle>
        <CardDescription>Invoice totals by supplier (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((supplier, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{supplier.supplier}</TableCell>
                  <TableCell className="text-right">{supplier.invoiceCount}</TableCell>
                  <TableCell className="text-right">
                    ${supplier.totalSpent.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No invoice data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
