"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
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
import type { ForecastPoint } from "@/lib/forecasting/types";

interface DemandForecastChartProps {
  forecasts: Record<string, { ingredientName: string; data: ForecastPoint[] }>;
}

export function DemandForecastChart({ forecasts }: DemandForecastChartProps) {
  const ingredientIds = Object.keys(forecasts);
  const [selectedIngredient, setSelectedIngredient] = useState<string>(
    ingredientIds[0] || ""
  );

  const currentForecast = selectedIngredient
    ? forecasts[selectedIngredient]
    : null;

  const chartData = currentForecast?.data.map((point) => ({
    date: point.date,
    actual: point.actual ?? null,
    predicted: point.predicted ?? null,
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
            <CardTitle>Demand Forecast</CardTitle>
            <CardDescription>
              Historical usage and 14-day predicted demand
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
                  {forecasts[id].ingredientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
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
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={((value: number | undefined, name: string) => [
                  value != null ? value.toFixed(2) : "--",
                  name === "actual" ? "Actual Usage" : "Predicted",
                ]) as never}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#d97706"
                fill="#fef3c7"
                fillOpacity={0.8}
                strokeWidth={2}
                name="actual"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#6366f1"
                fill="#e0e7ff"
                fillOpacity={0.5}
                strokeWidth={2}
                strokeDasharray="6 3"
                name="predicted"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            {ingredientIds.length === 0
              ? "No usage data available for forecasting"
              : "Select an ingredient to view the forecast"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
