"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAnalytics } from "@/components/admin/analytics/user-analytics";
import { ActivityAnalytics } from "@/components/admin/analytics/activity-analytics";
import { RevenueAnalytics } from "@/components/admin/analytics/revenue-analytics";
import { Users, Activity, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Compared to last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Completion</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24.3%</div>
            <p className="text-xs text-muted-foreground">
              Compared to last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="activities">Activity Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserAnalytics />
        </TabsContent>
        <TabsContent value="activities" className="space-y-4">
          <ActivityAnalytics />
        </TabsContent>
        <TabsContent value="revenue" className="space-y-4">
          <RevenueAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}