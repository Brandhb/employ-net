"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ActivityCard } from "@/components/activity-card"; // ✅ Using the ActivityCard component
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
  description: string;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeActivities, setActiveActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>(
    []
  );
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch Initial Activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/activities/user");
        if (!res.ok) throw new Error("Failed to fetch activities");
        const data = await res.json();

        setActiveActivities(data.activeActivities || []);
        setCompletedActivities(data.completedActivities || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setTimeout(() => setIsLoading(false), 500); // Small delay for smooth transition
      }
    };

    fetchActivities();
  }, []);

  // ✅ Subscribe to Supabase Realtime Updates
  useEffect(() => {
    listenForTableChanges("activities").then((channel) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        (payload) => {
          toast({
            title: "Activity Update",
            description: `An activity was ${
              payload.eventType === "INSERT"
                ? "added"
                : payload.eventType === "UPDATE"
                ? "updated"
                : "deleted"
            }.`,
          });

          const updatedActivity = payload.new as Activity;
          const deletedActivity = payload.old as Activity;

          if (payload.eventType === "INSERT") {
            setActiveActivities((prev) =>
              updatedActivity.status === "active"
                ? [...prev, updatedActivity]
                : prev
            );
            setCompletedActivities((prev) =>
              updatedActivity.status === "completed"
                ? [...prev, updatedActivity]
                : prev
            );
          } else if (payload.eventType === "UPDATE") {
            setActiveActivities((prev) =>
              prev.map((activity) =>
                activity.id === updatedActivity.id ? updatedActivity : activity
              )
            );
            setCompletedActivities((prev) =>
              prev.map((activity) =>
                activity.id === updatedActivity.id ? updatedActivity : activity
              )
            );
          } else if (payload.eventType === "DELETE") {
            setActiveActivities((prev) =>
              prev.filter((activity) => activity.id !== deletedActivity.id)
            );
            setCompletedActivities((prev) =>
              prev.filter((activity) => activity.id !== deletedActivity.id)
            );
          }
        }
      );
    });

    return () => {
      console.log("🛑 Unsubscribing from activities table...");
    };
  }, []);

  // ✅ Handle Activity Click
  const handleActivityClick = (activity: Activity) => {
    if (activity.status === "completed") return;
    router.push(`/dashboard/activities/${activity.type}/${activity.id}`);
  };

  // ✅ Error Handling
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <CheckCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold">Error Loading Activities</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Activities</h2>

      {/* ✅ Skeleton Loading State */}
      {isLoading ? (
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <Skeleton className="h-6 w-40 rounded-md" />{" "}
                  {/* Title Placeholder */}
                  <Skeleton className="h-4 w-24 mt-2 rounded-md" />{" "}
                  {/* Subtitle Placeholder */}
                </div>
                <Skeleton className="h-5 w-5 rounded-md" />{" "}
                {/* Icon Placeholder */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full rounded-md" />{" "}
                {/* Progress Placeholder */}
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-4 w-24 rounded-md" />{" "}
                  {/* % Completed Placeholder */}
                  <Skeleton className="h-8 w-20 rounded-md" />{" "}
                  {/* Button Placeholder */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* ✅ Active Activities */}
          {activeActivities.length > 0 ? (
            <div className="grid gap-4 ">
              
              {activeActivities.map((activity) => (
                <ActivityCard
                  userId={userId!}
                  key={activity.id}
                  activity={activity}
                  onClick={handleActivityClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No active activities available.
            </p>
          )}

          {/* ✅ Completed Activities */}
          {completedActivities.length > 0 && (
            <div className="mt-6">
              <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" /> Recent
                Activities
              </h3>
              <div className="grid gap-4 mt-4">
                {completedActivities.map((activity) => (
                  <ActivityCard
                    userId={userId!}
                    key={activity.id}
                    activity={activity}
                    onClick={handleActivityClick}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
