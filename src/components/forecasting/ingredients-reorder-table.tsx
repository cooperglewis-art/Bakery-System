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
import { AlertTriangle, Wheat } from "lucide-react";
import type { ReorderAlert } from "@/lib/forecasting/types";

interface IngredientsReorderTableProps {
  alerts: ReorderAlert[];
}

export function IngredientsReorderTable({ alerts }: IngredientsReorderTableProps) {
  // Sort by days remaining ascending (most urgent first)
  const sorted = [...alerts].sort((a, b) => a.daysRemaining - b.daysRemaining);

  const getRowClass = (daysRemaining: number) => {
    if (daysRemaining < 3) return "bg-red-50";
    if (daysRemaining < 7) return "bg-stone-50";
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
        <Badge className="bg-stone-100 text-stone-800">Low</Badge>
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
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="rounded-full bg-stone-100 p-4 mb-4">
                      <Wheat className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-900 mb-1">No reorder data yet</h3>
                    <p className="text-sm text-stone-500 text-center max-w-sm">Reorder alerts will appear once you add ingredients with usage history</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
