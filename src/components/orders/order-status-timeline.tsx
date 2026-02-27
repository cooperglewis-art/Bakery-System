"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  note: string | null;
  changed_by_user: { full_name: string } | null;
}

interface OrderStatusTimelineProps {
  history: StatusHistoryEntry[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderStatusTimeline({ history }: OrderStatusTimelineProps) {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Status History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="relative flex gap-4 pl-8">
                {/* Dot */}
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-amber-500" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.old_status && (
                      <>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[entry.old_status] || ""}`}
                        >
                          {statusLabels[entry.old_status] || entry.old_status}
                        </Badge>
                        <span className="text-gray-400 text-xs">&rarr;</span>
                      </>
                    )}
                    <Badge
                      className={`text-xs ${statusColors[entry.new_status] || ""}`}
                    >
                      {statusLabels[entry.new_status] || entry.new_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(
                      new Date(entry.changed_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                    {entry.changed_by_user &&
                      ` by ${entry.changed_by_user.full_name}`}
                  </p>
                  {entry.note && (
                    <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
