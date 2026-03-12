"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderSourcesChartProps {
  data: { source: string; count: number }[];
}

const SOURCE_LABELS: Record<string, string> = {
  call: "Phone Call",
  text: "Text",
  dm_instagram: "Instagram DM",
  dm_facebook: "Facebook DM",
  website: "Website",
  other: "Other",
};

const COLORS = [
  "#57534e", // stone-600
  "#6366f1", // indigo-500
  "#10b981", // emerald-500
  "#f43f5e", // rose-500
  "#8b5cf6", // violet-500
  "#0ea5e9", // sky-500
  "#64748b", // slate-500
];

export function OrderSourcesChart({ data }: OrderSourcesChartProps) {
  const chartData = data.map((d) => ({
    name: SOURCE_LABELS[d.source] || d.source,
    value: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Sources</CardTitle>
        <CardDescription>Where your orders come from</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={((value: number) => [value, "Orders"]) as never}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No order data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
