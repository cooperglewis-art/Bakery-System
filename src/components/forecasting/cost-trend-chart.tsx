"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CostTrendPoint } from "@/lib/forecasting/types";

interface CostTrendChartProps {
  trends: Record<string, { ingredientName: string; data: CostTrendPoint[] }>;
}

export function CostTrendChart({ trends }: CostTrendChartProps) {
  const ingredientIds = Object.keys(trends);
  const [selectedIngredient, setSelectedIngredient] = useState<string>(
    ingredientIds[0] || ""
  );

  const currentTrend = selectedIngredient ? trends[selectedIngredient] : null;

  const chartData = currentTrend?.data.map((point) => ({
    date: point.date,
    unitCost: point.unitCost,
    rollingAverage: point.rollingAverage ?? null,
  })) || [];

  // Format date for x-axis labels
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Cost Trend</CardTitle>
            <CardDescription>
              Unit cost over time with 7-point rolling average
            </CardDescription>
          </div>
          <Select
            value={selectedIngredient}
            onValueChange={setSelectedIngredient}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select ingredient" />
            </SelectTrigger>
            <SelectContent>
              {ingredientIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {trends[id].ingredientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={((value: number | undefined, name: string) => [
                  value != null ? `$${value.toFixed(2)}` : "--",
                  name === "unitCost" ? "Unit Cost" : "Rolling Avg",
                ]) as never}
              />
              <Line
                type="monotone"
                dataKey="unitCost"
                stroke="#d97706"
                strokeWidth={0}
                dot={{ r: 3, fill: "#d97706" }}
                activeDot={{ r: 5 }}
                name="unitCost"
              />
              <Line
                type="monotone"
                dataKey="rollingAverage"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="rollingAverage"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            {ingredientIds.length === 0
              ? "No invoice data available for cost analysis"
              : "Select an ingredient to view cost trends"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
