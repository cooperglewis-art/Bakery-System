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

interface BusiestDaysChartProps {
  data: { day: string; revenue: number; orders: number }[];
}

export function BusiestDaysChart({ data }: BusiestDaysChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Busiest Days</CardTitle>
        <CardDescription>Average revenue by day of the week</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={((value: number, name: string) => [
                  name === "revenue" ? `$${value.toFixed(2)}` : value.toFixed(1),
                  name === "revenue" ? "Avg Revenue" : "Avg Orders",
                ]) as never}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
