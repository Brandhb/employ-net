"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAdminAnalytics } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";

interface UserGroupByResult {
  verificationStatus: string;
  _count: number;
  createdAt: Date;
}

type UserStats = {
  activeUsers: number;
  newSignups: number;
  verificationRate: number;
  churnRate: number;
  change: {
    active: number;
    signups: number;
    verification: number;
    churn: number;
  };
};

type UserData = {
  name: string;
  users: number;
};

export function UserAnalytics() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [data, setData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAdminAnalytics();
        
        // Cast the users array to our expected type
        const userGroups = analytics.users as unknown as UserGroupByResult[];
        
        // Calculate user stats
        const userStats = userGroups.reduce((acc, curr) => {
          return {
            activeUsers: curr.verificationStatus === 'verified' ? acc.activeUsers + curr._count : acc.activeUsers,
            newSignups: acc.newSignups + curr._count,
            verificationRate: curr.verificationStatus === 'verified' ? acc.verificationRate + curr._count : acc.verificationRate,
          };
        }, {
          activeUsers: 0,
          newSignups: 0,
          verificationRate: 0,
        });

        const totalUsers = userGroups.reduce((acc, curr) => acc + curr._count, 0);
        
        // Calculate rates
        const verificationRate = totalUsers > 0 ? (userStats.verificationRate / totalUsers) * 100 : 0;
        const churnRate = 2.1; // Mock value, implement with actual churn tracking

        // Mock changes (can be implemented with historical data)
        const changes = {
          active: 12.3,
          signups: 5.6,
          verification: 2.4,
          churn: -0.5,
        };

        setStats({
          ...userStats,
          verificationRate,
          churnRate,
          change: changes,
        });

        // Transform user data for chart
        const chartData: UserData[] = userGroups.map(stat => ({
          name: new Date(stat.createdAt).toLocaleDateString('en-US', { month: 'short' }),
          users: stat._count,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
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

  const userStats = [
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: `${stats.change.active >= 0 ? '+' : ''}${stats.change.active}%`,
      trend: stats.change.active >= 0 ? "up" : "down",
    },
    {
      title: "New Signups",
      value: stats.newSignups.toLocaleString(),
      change: `${stats.change.signups >= 0 ? '+' : ''}${stats.change.signups}%`,
      trend: stats.change.signups >= 0 ? "up" : "down",
    },
    {
      title: "Verification Rate",
      value: `${stats.verificationRate.toFixed(1)}%`,
      change: `${stats.change.verification >= 0 ? '+' : ''}${stats.change.verification}%`,
      trend: stats.change.verification >= 0 ? "up" : "down",
    },
    {
      title: "Churn Rate",
      value: `${stats.churnRate.toFixed(1)}%`,
      change: `${stats.change.churn >= 0 ? '+' : ''}${stats.change.churn}%`,
      trend: stats.change.churn >= 0 ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}