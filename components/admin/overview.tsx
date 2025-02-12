"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getAdminAnalytics } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { Prisma } from "@prisma/client";
import { ActivityGroupByOutput } from "@/app/lib/types/analytics"; // ✅ Now imported from a safe place


interface ChartDataPoint {
  name: string;
  activities: number;
  points: number;
}

export function AdminOverview() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAdminAnalytics();
        
        // Transform analytics data for the chart
        const chartData: ChartDataPoint[] = (analytics.activities as ActivityGroupByOutput[]).map((activity) => ({
          name: `${activity.type} (${activity.status})`,
          activities: activity._count,
          points: activity._sum.points || 0
        }));
        
        setData(chartData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

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
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
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
        <Tooltip />
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