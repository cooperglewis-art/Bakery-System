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

interface TopCustomersTableProps {
  data: {
    name: string;
    totalSpent: number;
    orderCount: number;
  }[];
}

export function TopCustomersTable({ data }: TopCustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>Highest spenders (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((customer, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-right">{customer.orderCount}</TableCell>
                  <TableCell className="text-right">
                    ${customer.totalSpent.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No customer data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
