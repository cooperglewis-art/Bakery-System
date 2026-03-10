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

interface DeliverySplitChartProps {
  delivery: number;
  pickup: number;
}

export function DeliverySplitChart({ delivery, pickup }: DeliverySplitChartProps) {
  const data = [
    { name: "Delivery", value: delivery },
    { name: "Pickup", value: pickup },
  ];

  const total = delivery + pickup;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery vs Pickup</CardTitle>
        <CardDescription>Order fulfillment breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                <Cell fill="#d97706" />
                <Cell fill="#6366f1" />
              </Pie>
              <Tooltip
                formatter={((value: number) => [
                  `${value} (${((value / total) * 100).toFixed(0)}%)`,
                  "Orders",
                ]) as never}
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
