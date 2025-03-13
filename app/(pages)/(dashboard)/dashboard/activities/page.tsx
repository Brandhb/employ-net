"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";
import { toast } from "@/hooks/use-toast";
import { VerificationConfirmationDialog } from "@/components/ui/verification-request-modal";
import { getInternalUserIdUtil } from "@/lib/utils";
import { ActivityStats } from "@/components/dashboard/activities/ActivityStats";
import { ActivitySearchFilter } from "@/components/dashboard/activities/ActivitySearchFilter";
import { ActivityTabs } from "@/components/dashboard/activities/ActivityTabs";

interface VerificationRequest {
  id: string;
  userId: string;
  status: "waiting" | "ready" | "completed";
  verificationUrl?: string | null;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
  description: string;
  verificationRequests?: VerificationRequest[]; // ✅ Ensure proper typing
  instructions?: { step: number; text: string }[]; // ✅ Structured steps
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeActivities, setActiveActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>(
    []
  );
  const [selectedTask, setSelectedTask] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch Initial Activities from API
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    //debugger;
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
      setTimeout(() => setIsLoading(false), 500); // Smooth transition
    }
  };

  // ✅ Refresh Handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivities();
    setIsRefreshing(false);
  };

  // ✅ Subscribe to Supabase Realtime Updates for Activities
  {
    /* Disabled for now
  useEffect(() => {
    async function subscribeToRealtimeUpdates() {
      if (unsubscribeRef.current) {
        unsubscribeRef.current(); // ✅ Remove previous listener
      }

      unsubscribeRef.current = await listenForTableChanges("activities", "userId", getInternalUserIdUtil()!, (payload) => {
        console.log("🔄 Activity update received:", payload);

        toast({
          title: "Activity Update",
          description: `An activity was ${
            payload.event === "INSERT" ? "added" : payload.event === "UPDATE" ? "updated" : "deleted"
          }.`,
        });

        const updatedActivity = payload.new as Activity;
        const deletedActivity = payload.old as Activity;

        if (payload.event === "INSERT" && updatedActivity) {
          setActiveActivities((prev) => [...prev, updatedActivity]);
        } else if (payload.event === "UPDATE" && updatedActivity) {
          setActiveActivities((prev) =>
            prev.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity))
          );
        } else if (payload.event === "DELETE" && deletedActivity) {
          setActiveActivities((prev) => prev.filter((activity) => activity.id !== deletedActivity.id));
        }
      });

      console.log("✅ Subscribed to activities updates.");
    }

    subscribeToRealtimeUpdates();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        console.log("🛑 Unsubscribed from activities updates.");
      }
    };
  }, []);
*/
  }

  // ✅ Handle Activity Click
  const handleActivityClick = (activity: Activity) => {
    if (activity.type === "verification") {
      setSelectedTask(activity);
      setIsDialogOpen(true);
    } else {
      router.push(`/dashboard/activities/${activity.type}/${activity.id}`);
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

  // ✅ Filter activities based on search query and active filter
  const filteredActiveActivities = activeActivities.filter(
    (activity) =>
      (!activeFilter || activity.type === activeFilter) &&
      (!searchQuery ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCompletedActivities = completedActivities.filter(
    (activity) =>
      (!activeFilter || activity.type === activeFilter) &&
      (!searchQuery ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 space-y-6 container mx-auto px-4 sm:px-6 max-w-7xl">
      <ActivityStats
        activeActivities={activeActivities}
        completedActivities={completedActivities}
      />
      <ActivitySearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        handleRefresh={handleRefresh}
      />
      <ActivityTabs
        userId={userId!}
        activeActivities={filteredActiveActivities}
        completedActivities={filteredCompletedActivities}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleActivityClick={handleActivityClick}
        isLoading={isLoading}
        searchQuery={""}
        activeFilter={null}
      />
      <VerificationConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleRequestVerification}
      />
    </div>
  );
}
