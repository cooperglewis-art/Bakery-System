import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { ReorderAlert } from "@/lib/forecasting/types";

interface IngredientsReorderTableProps {
  alerts: ReorderAlert[];
}

export function IngredientsReorderTable({ alerts }: IngredientsReorderTableProps) {
  // Sort by days remaining ascending (most urgent first)
  const sorted = [...alerts].sort((a, b) => a.daysRemaining - b.daysRemaining);

  const getRowClass = (daysRemaining: number) => {
    if (daysRemaining < 3) return "bg-red-50";
    if (daysRemaining < 7) return "bg-amber-50";
    return "";
  };

  const getStatusBadge = (daysRemaining: number) => {
    if (daysRemaining < 3) {
      return (
        <Badge className="bg-red-100 text-red-800">Critical</Badge>
      );
    }
    if (daysRemaining < 7) {
      return (
        <Badge className="bg-amber-100 text-amber-800">Low</Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800">OK</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Reorder Alerts
        </CardTitle>
        <CardDescription>
          Ingredients sorted by urgency based on forecasted 14-day usage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">14-Day Forecast</TableHead>
              <TableHead className="text-right">Days Remaining</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length > 0 ? (
              sorted.map((alert) => (
                <TableRow
                  key={alert.ingredientId}
                  className={getRowClass(alert.daysRemaining)}
                >
                  <TableCell className="font-medium">
                    {alert.ingredientName}
                  </TableCell>
                  <TableCell className="text-right">
                    {alert.currentStock.toFixed(1)} {alert.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {alert.forecastedUsage14d.toFixed(1)} {alert.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {alert.daysRemaining === Infinity
                      ? "--"
                      : `${alert.daysRemaining} days`}
                  </TableCell>
                  <TableCell>{getStatusBadge(alert.daysRemaining)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  No ingredient data available for reorder analysis
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
