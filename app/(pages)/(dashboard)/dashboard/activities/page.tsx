"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ActivityCard } from "@/components/activity-card";
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CheckCircle,
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { VerificationConfirmationDialog } from "@/components/ui/verification-request-modal";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");

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
      setTimeout(() => setIsLoading(false), 500); // Small delay for smooth transition
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivities();
    setIsRefreshing(false);
  };

  // Subscribe to Supabase Realtime Updates
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

  useEffect(() => {
    if (!userId) return; // ✅ Ensure userId exists
  
    listenForTableChanges("verificationRequests").then((channel) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verificationRequests" },
        (payload) => {
          if (!payload.new || !("userId" in payload.new)) {
            console.warn("❌ Missing userId in verification request update:", payload);
            return; // ✅ Prevents errors if `userId` is missing
          }
  
          const updatedRequest = payload.new as {
            id: string;
            userId: string;
            status: "waiting" | "ready" | "completed";
            verificationUrl?: string | null;
          };
  
          if (updatedRequest.userId === userId) {
            setActiveActivities((prev) =>
              prev.map((activity) =>
                Array.isArray(activity.verificationRequests) &&
                activity.verificationRequests.some((vr) => vr.id === updatedRequest.id)
                  ? {
                      ...activity,
                      verificationRequests: activity.verificationRequests.map((vr) =>
                        vr.id === updatedRequest.id ? updatedRequest : vr
                      ),
                    }
                  : activity
              )
            );
          }
        }
      );
    });
  
    return () => {
      console.log("🛑 Unsubscribing from verificationRequests...");
    };
  }, [userId]);
  
  

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

  // Filter activities based on search query and type filter
  const filteredActiveActivities = activeActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || activity.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCompletedActivities = completedActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || activity.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalPoints = [...activeActivities, ...completedActivities].reduce(
    (sum, activity) => sum + activity.points,
    0
  );
  const earnedPoints = completedActivities.reduce(
    (sum, activity) => sum + activity.points,
    0
  );
  const completionRate =
    activeActivities.length > 0
      ? Math.round(
          (completedActivities.length /
            (activeActivities.length + completedActivities.length)) *
            100
        )
      : 0;

  // Error Handling
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold">Error Loading Activities</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Skeleton for loading state
  const SkeletonCard = () => (
    <Card className="animate-pulse p-4 w-full">
      <CardHeader className="flex flex-col items-start space-y-2 px-2">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </CardHeader>
      <CardContent className="px-2">
        <Skeleton className="h-4 w-full rounded-md mb-4" />
        <Skeleton className="h-2 w-full rounded-md mb-2" />
        <div className="flex justify-between items-center mt-3">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 container mx-auto px-4 sm:px-6 max-w-7xl">
      {/* Page Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary hidden sm:inline-block" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete tasks to earn points and rewards
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Earned Points</p>
                <p className="text-lg font-bold">
                  {earnedPoints}/{totalPoints}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="bg-green-500/10 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-lg font-bold">{completionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                {activeFilter ? `Filter: ${activeFilter}` : "Filter"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveFilter(null)}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("video")}>
                Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("survey")}>
                Survey
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("verification")}>
                Verification
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 w-10"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilter || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilter && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-primary/5"
            >
              Type: {activeFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setActiveFilter(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-primary/5"
            >
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              setActiveFilter(null);
              setSearchQuery("");
            }}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Tabs for Active/Completed */}
      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="relative">
            Active Tasks
            {filteredActiveActivities.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground absolute -top-2 -right-2">
                {filteredActiveActivities.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {filteredCompletedActivities.length > 0 && (
              <Badge className="ml-2 bg-green-500 text-white absolute -top-2 -right-2">
                {filteredCompletedActivities.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Active Tasks Tab */}
            <TabsContent value="active" className="mt-0">
              <AnimatePresence mode="wait">
                {filteredActiveActivities.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {filteredActiveActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        userId={userId!}
                        onClick={handleActivityClick}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col items-center justify-center text-center py-12 px-4"
                  >
                    <div className="bg-muted/50 rounded-full p-4 mb-4">
                      <Layers className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Active Tasks Found
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      {activeFilter
                        ? `No ${activeFilter} tasks available. Try changing your filter.`
                        : searchQuery
                        ? "No tasks match your search. Try different keywords."
                        : "All tasks have been completed. Check back later for new opportunities!"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveFilter(null);
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Completed Tasks Tab */}
            <TabsContent value="completed" className="mt-0">
              <AnimatePresence mode="wait">
                {filteredCompletedActivities.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {filteredCompletedActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        userId={userId!}
                        onClick={handleActivityClick}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col items-center justify-center text-center py-12 px-4"
                  >
                    <div className="bg-muted/50 rounded-full p-4 mb-4">
                      <CheckCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Completed Tasks
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      {activeFilter || searchQuery
                        ? "No completed tasks match your current filters."
                        : "You haven't completed any tasks yet. Start with the active tasks to earn points!"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("active")}
                    >
                      View Active Tasks
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </>
        )}
      </Tabs>
      <VerificationConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleRequestVerification}
      />
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
