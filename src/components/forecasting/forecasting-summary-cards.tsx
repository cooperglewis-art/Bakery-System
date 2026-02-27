import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, Package } from "lucide-react";

interface ForecastingSummaryCardsProps {
  currentMonthSpend: number;
  lastMonthSpend: number;
  topIngredients: { name: string; usage: number; unit: string }[];
  lowStockCount: number;
}

export function ForecastingSummaryCards({
  currentMonthSpend,
  lastMonthSpend,
  topIngredients,
  lowStockCount,
}: ForecastingSummaryCardsProps) {
  const spendDiff = lastMonthSpend > 0
    ? ((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100
    : 0;
  const spendDiffLabel = spendDiff >= 0 ? `+${spendDiff.toFixed(1)}%` : `${spendDiff.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Monthly Spend Comparison */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${currentMonthSpend.toFixed(0)}</p>
              <p className="text-sm text-gray-500">
                This month{" "}
                <span
                  className={
                    spendDiff > 0
                      ? "text-red-500"
                      : spendDiff < 0
                        ? "text-green-500"
                        : "text-gray-500"
                  }
                >
                  ({spendDiffLabel})
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Month */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${lastMonthSpend.toFixed(0)}</p>
              <p className="text-sm text-gray-500">Last month spend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Usage Ingredients */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 shrink-0">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Top Usage</p>
              {topIngredients.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {topIngredients.map((ing) => (
                    <li key={ing.name} className="text-xs text-gray-600 truncate">
                      {ing.name}: {ing.usage.toFixed(1)} {ing.unit}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 mt-1">No usage data</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert Count */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                lowStockCount > 0 ? "bg-red-100" : "bg-gray-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  lowStockCount > 0 ? "text-red-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStockCount}</p>
              <p className="text-sm text-gray-500">Low stock alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
