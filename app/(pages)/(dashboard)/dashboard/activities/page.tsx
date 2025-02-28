"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ActivityCard } from "@/components/activity-card";
import { RefreshCw, Clock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { VerificationConfirmationDialog } from "@/components/ui/verification-request-modal";
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
  testUrl?: string;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeActivities, setActiveActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch Initial Data from API
  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/activities/user");
        if (!res.ok) throw new Error("Failed to fetch activities");
        const data = await res.json();

        setActiveActivities(data.activeActivities || []);
        setCompletedActivities(data.completedActivities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    fetchActivities(); // ✅ Initial fetch

    // ✅ Listen for Realtime Changes
    listenForTableChanges("activities").then((channel) => {
      console.log("✅ Subscribed to activities table:", channel);

      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        (payload) => {
          console.log("🔄 Realtime Update:", payload);

          // ✅ Show a toast notification based on the event type
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

          // ✅ Type assertion: Explicitly cast payload data
          const updatedActivity = payload.new as Activity;
          const deletedActivity = payload.old as Activity;

          // ✅ Handle different eventTypes
          if (payload.eventType === "INSERT") {
            setActiveActivities((prev) =>
              updatedActivity.status === "active" ? [...prev, updatedActivity] : prev
            );
            setCompletedActivities((prev) =>
              updatedActivity.status === "completed" ? [...prev, updatedActivity] : prev
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
  // ✅ Handle Refresh Click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/activities/user");
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();

      setActiveActivities(data.activeActivities || []);
      setCompletedActivities(data.completedActivities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!selectedTask) return;
    try {
      const response = await fetch("/api/users/verification-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: selectedTask.id }),
      });

      if (!response.ok) throw new Error("Failed to request verification");
      toast({
        title: "Request Sent",
        description: "Admin will review and send you the verification link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send verification request",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  // ✅ Handle Activity Click
  const handleActivityClick = (activity: Activity) => {
    if (activity.type === "verification") {
      setSelectedTask(activity);
      setIsDialogOpen(true);
    } else {
      router.push(`/dashboard/activities/${activity.type}/${activity.id}`);
    }
  };

  // ✅ Error Handling
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold">Error Loading Activities</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Activities</h2>

      {activeActivities.length > 0 && (
        <div className="grid gap-4">
          {activeActivities.map((activity) => (
            <ActivityCard
              userId={userId!}
              key={activity.id}
              activity={activity}
              onClick={handleActivityClick}
            />
          ))}
        </div>
      )}

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

      {/*<VerificationDialogs
        selectedTask={selectedTask}
        confirmTask={confirmTask}
        onStartVerification={handleStartVerification}
        onConfirmVerification={handleConfirmVerification}
        setSelectedTask={setSelectedTask}
        setConfirmTask={setConfirmTask}
      />*/}
      {/* Verification Task Confirmation Dialog */}
      <VerificationConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleRequestVerification}
      />
    </div>
  );
}
