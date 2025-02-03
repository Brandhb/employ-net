"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAdminAnalytics } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { Prisma } from "@prisma/client";

type RevenueStats = {
  totalRevenue: number;
  totalPayouts: number;
  profitMargin: number;
  avgTransaction: number;
  change: {
    revenue: number;
    payouts: number;
    margin: number;
    transaction: number;
  };
};

type RevenueData = {
  name: string;
  revenue: number;
  payouts: number;
};

type RevenueSource = {
  name: string;
  value: number;
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function RevenueAnalytics() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [sourcesData, setSourcesData] = useState<RevenueSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAdminAnalytics();
        
        // Calculate revenue stats from payouts
        const payoutStats = analytics.payouts.reduce((acc, curr) => {
          const amount = curr._sum?.amount || 0;
          return {
            totalRevenue: acc.totalRevenue + amount,
            totalPayouts: curr.status === 'completed' ? acc.totalPayouts + amount : acc.totalPayouts,
          };
        }, {
          totalRevenue: 0,
          totalPayouts: 0,
        });

        // Calculate profit margin
        const profitMargin = ((payoutStats.totalRevenue - payoutStats.totalPayouts) / payoutStats.totalRevenue) * 100;

        // Calculate average transaction
        const totalTransactions = analytics.payouts.reduce((acc, curr) => acc + (Number(curr._count) || 0), 0);
        const avgTransaction = totalTransactions > 0 ? payoutStats.totalRevenue / totalTransactions : 0;

        // Mock changes (can be implemented with historical data)
        const changes = {
          revenue: 23.4,
          payouts: 18.7,
          margin: 4.2,
          transaction: 2.1,
        };

        setStats({
          ...payoutStats,
          profitMargin,
          avgTransaction,
          change: changes,
        });

        // Transform revenue data for charts
        const monthlyData = analytics.payouts.map(payout => ({
          name: new Date(payout.createdAt || "").toLocaleDateString('en-US', { month: 'short' }),
          revenue: payout._sum?.amount || 0,
          payouts: payout.status === 'completed' ? payout._sum?.amount || 0 : 0,
        }));

        setRevenueData(monthlyData);

        // Calculate revenue sources
        const sources = [
          { name: "Video Ads", value: 45 },
          { name: "Surveys", value: 30 },
          { name: "Sponsorships", value: 15 },
          { name: "Other", value: 10 },
        ];

        setSourcesData(sources);
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

  const revenueStats = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: `${stats.change.revenue >= 0 ? '+' : ''}${stats.change.revenue}%`,
    },
    {
      title: "Total Payouts",
      value: `$${stats.totalPayouts.toLocaleString()}`,
      change: `${stats.change.payouts >= 0 ? '+' : ''}${stats.change.payouts}%`,
    },
    {
      title: "Profit Margin",
      value: `${stats.profitMargin.toFixed(1)}%`,
      change: `${stats.change.margin >= 0 ? '+' : ''}${stats.change.margin}%`,
    },
    {
      title: "Avg. Transaction",
      value: `$${stats.avgTransaction.toFixed(2)}`,
      change: `${stats.change.transaction >= 0 ? '+' : ''}${stats.change.transaction}%`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {revenueStats.map((stat, index) => (
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

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="payouts"
                    stackId="1"
                    stroke="hsl(var(--destructive))"
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}