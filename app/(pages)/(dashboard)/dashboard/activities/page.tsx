"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ActivityCard } from "@/components/activity-card";
import { VerificationDialogs } from "@/components/verification-dialogs";
import { RefreshCw, Clock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startVerificationTask } from "@/app/actions/admin/start-verification-task";
import { confirmVerificationTask } from "@/app/actions/admin/confirm-verification-task";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

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
  const [confirmTask, setConfirmTask] = useState<Activity | null>(null);
  const [activeActivities, setActiveActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch Initial Data from API
  useEffect(() => {
    if (!userId) return;

    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/activities/user");
        if (!res.ok) throw new Error("Failed to fetch activities");
        const data = await res.json();

        setActiveActivities(data.activeActivities || []);
        setCompletedActivities(data.completedActivities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    };

    fetchActivities();
  }, [userId]);

  // ✅ Subscribe to Supabase Realtime Separately
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-activities")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        (payload) => {
          console.log("🔄 Realtime Update:", payload);
          toast({
            title: "New Activity",
            description: "New activity has beeen added by Employ-Net"
          })
          // Ensure payload.new is typed correctly
          const updatedActivity = payload.new as Activity;

          setActiveActivities((prev: Activity[]) =>
            prev.map((activity) =>
              activity.id === updatedActivity.id ? updatedActivity : activity
            )
          );

          setCompletedActivities((prev: Activity[]) =>
            prev.map((activity) =>
              activity.id === updatedActivity.id ? updatedActivity : activity
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

  // ✅ Handle Task Start
  const handleStartVerification = async () => {
    if (selectedTask) {
      await startVerificationTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  // ✅ Handle Task Confirmation
  const handleConfirmVerification = async () => {
    if (confirmTask) {
      await confirmVerificationTask(confirmTask.id);
      setConfirmTask(null);
    }
  };

  // ✅ Handle Activity Click
  const handleActivityClick = (activity: Activity) => {
    if (activity.status === "completed") return;

    if (activity.type === "verification") {
      if (activity.status === "ready") {
        setConfirmTask(activity);
      } else {
        setSelectedTask(activity);
      }
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
                key={activity.id}
                activity={activity}
                onClick={handleActivityClick}
              />
            ))}
          </div>
        </div>
      )}

      <VerificationDialogs
        selectedTask={selectedTask}
        confirmTask={confirmTask}
        onStartVerification={handleStartVerification}
        onConfirmVerification={handleConfirmVerification}
        setSelectedTask={setSelectedTask}
        setConfirmTask={setConfirmTask}
      />
    </div>
  );
}
