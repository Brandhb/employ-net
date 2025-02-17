"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, MoreVertical, Plus, Video, FileText } from "lucide-react";
import { CreateActivityForm } from "@/components/admin/create-activity-form";
import { useToast } from "@/hooks/use-toast";
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivityStatus,
  CreateActivityResponse,
  CreateActivityData,
} from "@/app/actions/admin";
import { revalidatePath } from "next/cache";
import { Activity, ActivityData } from "@/types"; // ✅ Ensure this matches your Prisma schema
import { EditActivityForm } from "@/components/admin/edit-activity-form";
import { useRouter } from "next/navigation";

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  const { toast } = useToast();
  const router = useRouter()


  // ✅ Fetch activities from the database on mount
  useEffect(() => {
    async function fetchActivities() {
      const data = await getActivities();
      setActivities(data);
    }
    fetchActivities();
  }, [isEditModalOpen]);

  // ✅ Filter activities based on search input
  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Handle activity creation
  const handleCreateActivity = async (
    newActivity: Omit<Activity, "id" | "createdAt">
  ) => {
    try {
      const formattedActivity: CreateActivityData = {
        ...newActivity,
        type: newActivity.type as "video" | "survey", // ✅ Explicitly cast `type`
        status: newActivity.status as "active" | "draft", // ✅ Explicitly cast `status`
      };

      const result = await createActivity(formattedActivity);

      if (!result.success) {
        throw new Error(result.error || "Failed to create activity");
      }

      toast({
        title: "Success",
        description: "Activity created successfully!",
      });

      //revalidatePath("/admin/activities"); // ✅ Refresh cache
      router.refresh()
      setActivities(await getActivities()); // ✅ Fetch updated data

      setIsModalOpen(false); // ✅ Close modal after success
      return { success: true };
    } catch (error) {
      console.error("❌ Error creating activity:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // ✅ Handle activity status update
  const handleEditActivity = async (activity: ActivityData) => {
    console.log("here");
    setActivityToEdit(activity as unknown as Activity);
    setIsEditModalOpen(true);
  };

  // ✅ Handle activity deletion
  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
      toast({ title: "Success", description: "Activity deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a new video or survey task for users to complete.
                </DialogDescription>
              </DialogHeader>
              <CreateActivityForm onSubmit={handleCreateActivity} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {activity.type === "video" ? (
                        <Video className="mr-2 h-4 w-4" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      {activity.type}
                    </div>
                  </TableCell>
                  <TableCell>{activity.points}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        activity.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {activity.completedAt
                      ? new Date(activity.completedAt).toLocaleDateString()
                      : "Not Completed"}
                  </TableCell>
                  <TableCell>
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditActivity(activity)}
                        >
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600"
                        >
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Edit Activity Modal */}
      {isEditModalOpen && activityToEdit && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Edit the details of this task.
              </DialogDescription>
            </DialogHeader>
            <EditActivityForm
              activity={activityToEdit}
              onClose={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
