"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { DollarSign, Eye, MousePointer, Percent, Clock } from "lucide-react";

export function AdMetrics() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-24" />
        </Card>
      ))}
    </div>;
  }

  if (error || !data) {
    return null;
  }

  const metrics = [
    {
      title: "Revenue",
      value: `$${data.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: "Impressions",
      value: data.adImpressions.toLocaleString(),
      icon: Eye,
    },
    {
      title: "Clicks",
      value: data.adClicks.toLocaleString(),
      icon: MousePointer,
    },
    {
      title: "Completion Rate",
      value: `${data.completionRate.toFixed(1)}%`,
      icon: Percent,
    },
    {
      title: "Avg. Engagement",
      value: `${Math.round(data.averageEngagement)}s`,
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}