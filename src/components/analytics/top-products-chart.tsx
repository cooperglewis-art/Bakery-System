"use client";

import {
  BarChart,
  Bar,
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

interface TopProductsChartProps {
  data: { name: string; quantity: number; revenue: number }[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best sellers by quantity (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip
                formatter={((value: number, name: string) => [
                  name === "quantity" ? value : `$${value.toFixed(2)}`,
                  name === "quantity" ? "Qty Sold" : "Revenue",
                ]) as never}
              />
              <Bar dataKey="quantity" fill="#d97706" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No product data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
