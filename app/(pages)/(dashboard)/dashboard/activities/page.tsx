"use client";

import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, FileText, CheckCircle, RefreshCw, Clock, Loader2, AlertTriangle } from "lucide-react";

// ✅ Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit exceeded");
    throw new Error("Failed to fetch activities");
  }
  return res.json();
};

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Use SWR for client-side caching & auto revalidation every 5 min
  const { data, error, isValidating, mutate } = useSWR(
    userId ? "/api/activities/user" : null,
    fetcher,
    { refreshInterval: 300000 } // Auto-refresh every 5 minutes
  );

  // ✅ Handle Refresh Click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate(); // ✅ Re-fetch data manually
    setIsRefreshing(false);
  };

  // ✅ Handle Activity Click
  const handleActivityClick = (activity: Activity) => {
    if (activity.status === "completed") return;
    const path = `/dashboard/activities/${activity.type}/${activity.id}`;
    router.push(path);
  };

  // ✅ Improved Error Handling
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        {error.message === "Rate limit exceeded" ? (
          <>
            <h3 className="text-xl font-semibold">Too Many Requests</h3>
            <p className="text-muted-foreground">
              You’ve hit the request limit. Please wait a moment before trying again.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold">Error Loading Activities</h3>
            <p className="text-muted-foreground">Something went wrong. Please try again later.</p>
          </>
        )}
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Retry
        </Button>
      </div>
    );
  }

  // ✅ Loading Placeholder
  if (!data) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-48" />
          </Card>
        ))}
      </div>
    );
  }

  const { activeActivities, completedActivities } = data;

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Activities</h2>

      {/* Active Activities Section */}
      {activeActivities.length > 0 ? (
        <div className="grid gap-4">
          {activeActivities.map((activity: Activity) => (
            <Card key={activity.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {activity.type} • {activity.points} points
                  </p>
                </div>
                {activity.type === "video" ? (
                  <Play className="h-5 w-5 text-muted-foreground" />
                ) : activity.type === "survey" ? (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">0% Complete</span>
                    <Button onClick={() => handleActivityClick(activity)}>Start</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h3 className="text-xl font-semibold">No More Activities 🎉</h3>
          <p className="text-muted-foreground">You have completed all tasks. Check back later for new activities.</p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      )}

      {/* Recent Activities Section */}
      {completedActivities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" /> Recent Activities
          </h3>
          <div className="grid gap-4 mt-4">
            {completedActivities.map((activity: Activity) => (
              <Card key={activity.id} className="opacity-80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {activity.type} • {activity.points} points
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Completed on:{" "}
                    {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : "Unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
