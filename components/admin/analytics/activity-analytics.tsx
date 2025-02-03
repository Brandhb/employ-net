"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAdminAnalytics } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { Prisma } from "@prisma/client";

type ActivityGroupByOutput = Prisma.ActivityGroupByOutputType & {
  _count: number;
  _sum: {
    points: number | null;
  };
  metadata: {
    duration?: number;
  } | null;
};

type ActivityStats = {
  totalCompletions: number;
  avgCompletionTime: number;
  completionRate: number;
  pointsAwarded: number;
  change: {
    completions: number;
    time: number;
    rate: number;
    points: number;
  };
};

type ActivityData = {
  name: string;
  completions: number;
  avgTime: number;
};

export function ActivityAnalytics() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [data, setData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAdminAnalytics();
        
        // Calculate activity stats
        const activityStats = (analytics.activities as ActivityGroupByOutput[]).reduce((acc, curr) => {
          const completions = curr._count;
          const points = curr._sum?.points || 0;
          const duration = (curr.metadata as any)?.duration || 0;
          
          return {
            totalCompletions: acc.totalCompletions + completions,
            avgCompletionTime: acc.avgCompletionTime + duration,
            completionRate: curr.status === 'completed' ? acc.completionRate + 1 : acc.completionRate,
            pointsAwarded: acc.pointsAwarded + points,
          };
        }, {
          totalCompletions: 0,
          avgCompletionTime: 0,
          completionRate: 0,
          pointsAwarded: 0,
        });

        const totalActivities = analytics.activities.length;

        // Calculate changes (mock for now, can be implemented with historical data)
        const changes = {
          completions: 15.3,
          time: -2.1,
          rate: 3.4,
          points: 8.7,
        };

        setStats({
          ...activityStats,
          avgCompletionTime: totalActivities > 0 ? activityStats.avgCompletionTime / totalActivities : 0,
          completionRate: totalActivities > 0 ? (activityStats.completionRate / totalActivities) * 100 : 0,
          change: changes,
        });

        // Transform activity data for chart
        const chartData: ActivityData[] = (analytics.activities as ActivityGroupByOutput[]).map(activity => ({
          name: activity.title || 'Untitled',
          completions: activity._count,
          avgTime: (activity.metadata as any)?.duration || 0,
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

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  const activityStats = [
    {
      title: "Total Completions",
      value: stats.totalCompletions.toLocaleString(),
      change: `${stats.change.completions >= 0 ? '+' : ''}${stats.change.completions}%`,
    },
    {
      title: "Avg. Completion Time",
      value: `${Math.round(stats.avgCompletionTime)} min`,
      change: `${stats.change.time >= 0 ? '+' : ''}${stats.change.time}%`,
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate.toFixed(1)}%`,
      change: `${stats.change.rate >= 0 ? '+' : ''}${stats.change.rate}%`,
    },
    {
      title: "Points Awarded",
      value: `${(stats.pointsAwarded / 1000).toFixed(1)}K`,
      change: `${stats.change.points >= 0 ? '+' : ''}${stats.change.points}%`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activityStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                parseFloat(stat.change) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="completions" fill="hsl(var(--primary))" name="Completions" />
                <Bar yAxisId="right" dataKey="avgTime" fill="hsl(var(--destructive))" name="Avg. Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}