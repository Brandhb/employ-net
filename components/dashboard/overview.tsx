"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getActivityStats } from "@/app/actions/activities";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ActivityData {
  date: string;
  activities: number;
  points: number;
}

export function Overview() {
  const { userId } = useAuth();
  const [data, setData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const stats = await getActivityStats(userId);
        const formattedData: ActivityData[] = stats.map((stat) => ({
          date: new Date(stat.createdAt).toISOString().split("T")[0],
          activities: stat._count,
          points: stat.points || 0,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching activity stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-32 w-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--destructive))"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--destructive))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card>
                  <CardContent className="p-2">
                    <p className="text-sm font-medium">
                      {payload[0].payload.date}
                    </p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Activities: {payload[0].value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Points: {payload[1]?.value || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="activities"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorActivities)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="points"
          stroke="hsl(var(--destructive))"
          fillOpacity={1}
          fill="url(#colorPoints)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
