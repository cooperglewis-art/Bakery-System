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

interface RevenueChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>Revenue over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
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
                labelFormatter={(label) => {
                  const d = new Date(label + "T00:00:00");
                  return d.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                }}
                formatter={((value: number, name: string) => [
                  name === "revenue" ? `$${value.toFixed(2)}` : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]) as never}
              />
              <Bar
                dataKey="revenue"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            No revenue data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
