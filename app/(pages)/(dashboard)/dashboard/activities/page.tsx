"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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

export interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
  description: string;
  verificationRequests?: VerificationRequest[];
  instructions?: { step: number; text: string }[];
}

interface Props {
  userId: string;
  activeActivities: Activity[];
  completedActivities: Activity[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleActivityClick: (activity: Activity) => void;
  isLoading: boolean;
  searchQuery: string;
  activeFilter: string | null;
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
  const [activeNavigationId, setActiveNavigationId] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  // Fetch Initial Activities from API
  useEffect(() => {
    fetchActivities();
  }, []);

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
      setTimeout(() => setIsLoading(false), 500); // Smooth transition delay
    }
  };

  // Refresh Handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivities();
    setIsRefreshing(false);
  };

  // Handle Activity Click with Optimistic UI update
  const handleActivityClick = (activity: Activity) => {
    if (activity.type === "verification") {
      setSelectedTask(activity);
      setIsDialogOpen(true);
    } else {
      // Immediately mark the clicked card as loading
      setActiveNavigationId(activity.id);
      startTransition(() => {
        // Optionally prefetch the route before navigation
        router.push(`/dashboard/activities/${activity.type}/${activity.id}`);
      });
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

      if (response.status === 409) {
        // 🛑 Duplicate request
        toast({
          title: "Request Already Exists",
          description:
            "You’ve already submitted a verification request for this task.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to request verification");
      }

      // ✅ Success
      toast({
        title: "Request Sent",
        description: "Admin will review and send you the verification link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send verification request.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  // Filter activities based on search query and active filter
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
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        activeNavigationId={activeNavigationId!}
      />
      <VerificationConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleRequestVerification}
      />
    </div>
  );
}
