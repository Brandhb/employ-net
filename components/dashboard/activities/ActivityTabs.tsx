import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Layers, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityList } from "./ActivityList";

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
  activeNavigationId: string;
}

export function ActivityTabs({
  userId,
  activeActivities,
  completedActivities,
  activeTab,
  setActiveTab,
  handleActivityClick,
  isLoading,
  searchQuery,
  activeFilter,
  activeNavigationId,
}: Props) {
  return (
    <Tabs
      defaultValue="active"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="active" className="relative">
          Active Tasks
          {activeActivities.length > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground absolute -top-2 -right-2">
              {activeActivities.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="completed" className="relative">
          Completed
          {completedActivities.length > 0 && (
            <Badge className="ml-2 bg-green-500 text-white absolute -top-2 -right-2">
              {completedActivities.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {isLoading ? (
          <ActivityList
            userId={userId}
            activeActivities={[]} // Empty while loading
            completedActivities={[]} // Empty while loading
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onClick={handleActivityClick}
            isLoading={true}
            activeNavigationId={activeNavigationId}
          />
        ) : activeActivities.length > 0 ? (
          <ActivityList
            userId={userId}
            activeActivities={activeActivities}
            completedActivities={[]} // No completed activities in "Active" tab
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onClick={handleActivityClick}
            isLoading={false}
            activeNavigationId={activeNavigationId}
          />
        ) : (
          <NoTasksMessage type="active" />
        )}
      </TabsContent>

      <TabsContent value="completed">
        {isLoading ? (
          <ActivityList
            userId={userId}
            activeActivities={[]} // Empty while loading
            completedActivities={[]} // Empty while loading
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onClick={handleActivityClick}
            isLoading={true}
            activeNavigationId={activeNavigationId}
          />
        ) : completedActivities.length > 0 ? (
          <ActivityList
            userId={userId}
            activeActivities={[]} // No active activities in "Completed" tab
            completedActivities={completedActivities}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onClick={handleActivityClick}
            isLoading={false}
            activeNavigationId={activeNavigationId}
          />
        ) : (
          <NoTasksMessage type="completed" />
        )}
      </TabsContent>
    </Tabs>
  );
}

function NoTasksMessage({ type }: { type: "active" | "completed" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center justify-center text-center py-12 px-4"
    >
      <div className="bg-muted/50 rounded-full p-4 mb-4">
        {type === "active" ? (
          <Layers className="h-10 w-10 text-muted-foreground" />
        ) : (
          <CheckCircle className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {type === "active" ? "No Active Tasks Found" : "No Completed Tasks"}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {type === "active"
          ? "All tasks have been completed. Check back later for new opportunities!"
          : "You haven't completed any tasks yet. Start with the active tasks to earn points!"}
      </p>
      <Button variant="outline">
        {type === "active" ? "View Completed Tasks" : "View Active Tasks"}
      </Button>
    </motion.div>
  );
}
