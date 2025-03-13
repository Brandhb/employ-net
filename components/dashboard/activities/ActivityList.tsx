import { ActivityCard } from "@/components/activity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  verificationRequests?: VerificationRequest[];
  instructions?: string;
}

interface Props {
  userId: string;
  activeActivities: Activity[];
  completedActivities: Activity[];
  searchQuery: string;
  activeFilter: string | null;
  onClick: (activity: Activity) => void;
  isLoading: boolean; // ✅ Added to control loading state
}

export function ActivityList({
  userId,
  activeActivities,
  completedActivities,
  searchQuery,
  activeFilter,
  onClick,
  isLoading,
}: Props) {
  // Filtered Active Activities
  const filteredActiveActivities = activeActivities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!activeFilter || activity.type === activeFilter)
  );

  // Filtered Completed Activities
  const filteredCompletedActivities = completedActivities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!activeFilter || activity.type === activeFilter)
  );

  // ✅ Skeleton Placeholder (Loading State)
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* ✅ Show Skeletons if Loading */}
      {isLoading ? (
        [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
      ) : (
        <>
          {/* ✅ Render Active Activities */}
          {filteredActiveActivities.length > 0 ? (
            filteredActiveActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                userId={userId}
                onClick={onClick}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No active tasks found.
            </p>
          )}

          {/* ✅ Render Completed Activities */}
          {filteredCompletedActivities.length > 0 ? (
            filteredCompletedActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                userId={userId}
                onClick={onClick}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No completed tasks found.
            </p>
          )}
        </>
      )}
    </div>
  );
}
