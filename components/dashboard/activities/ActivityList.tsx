// components/activity/ActivityList.tsx
import { ActivityCard } from "@/components/activity/activity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityContextProvider, Activity } from "@/lib/contexts/ActivityContext";

interface Props {
  userId: string;
  activeActivities: Activity[];
  completedActivities: Activity[];
  searchQuery: string;
  activeFilter: string | null;
  onClick: (activity: Activity) => void;
  isLoading: boolean;
  activeNavigationId: string;
}

export function ActivityList({
  userId,
  activeActivities,
  completedActivities,
  searchQuery,
  activeFilter,
  onClick,
  isLoading,
  activeNavigationId,
}: Props) {
  const filteredActiveActivities = activeActivities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!activeFilter || activity.type === activeFilter)
  );

  const filteredCompletedActivities = completedActivities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!activeFilter || activity.type === activeFilter)
  );

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
      {isLoading ? (
        [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
      ) : (
        <>
          {filteredActiveActivities.length > 0 &&
            filteredActiveActivities.map((activity) => (
              <ActivityContextProvider
                key={activity.id}
                activity={activity}
                userId={userId}
              >
                <ActivityCard onClick={onClick} isNavigating={activity.id === activeNavigationId} />
              </ActivityContextProvider>
            ))}
          {filteredCompletedActivities.length > 0 &&
            filteredCompletedActivities.map((activity) => (
              <ActivityContextProvider
                key={activity.id}
                activity={activity}
                userId={userId}
              >
                <ActivityCard onClick={onClick} isNavigating={activity.id === activeNavigationId} />
              </ActivityContextProvider>
            ))}
        </>
      )}
    </div>
  );
}
