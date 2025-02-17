"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, FileText, CheckCircle, RefreshCw, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

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
  const [activeActivities, setActiveActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ Only for refresh button

  const fetchActivities = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true); // Show button loading only on refresh
      else setIsLoading(true); // Show full page loader only on first load

      const response = await fetch("/api/activities/user");
      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();
      console.log("📩 Fetched activities:", data);

      if (!data.success || !Array.isArray(data.activeActivities) || !Array.isArray(data.completedActivities)) {
        console.error("❌ Invalid API response format:", data);
        throw new Error("Invalid response format");
      }

      setActiveActivities(data.activeActivities);
      setCompletedActivities(data.completedActivities.slice(0, 5)); // Show last 5 completed
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActiveActivities([]);
      setCompletedActivities([]);
    } finally {
      if (isRefresh) setIsRefreshing(false); // Stop button loading after refresh
      else setIsLoading(false); // Stop full page loading
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  const handleActivityClick = (activity: Activity) => {
    if (activity.status === "completed") return;

    if (activity.type === "video") {
      router.push(`/dashboard/activities/video/${activity.id}`);
    } else if (activity.type === "survey") {
      router.push(`/dashboard/activities/survey/${activity.id}`);
    }
  };

  if (isLoading) {
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

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Activities</h2>

      {/* Active Activities Section */}
      {activeActivities.length > 0 ? (
        <div className="grid gap-4">
          {activeActivities.map((activity) => (
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
        // Display message when no active activities are available
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h3 className="text-xl font-semibold">No More Activities 🎉</h3>
          <p className="text-muted-foreground">You have completed all tasks. Check back later for new activities.</p>
          <Button onClick={() => fetchActivities(true)} className="mt-2" disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
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
            {completedActivities.map((activity) => (
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
