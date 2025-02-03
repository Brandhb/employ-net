"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, MoreVertical, Plus, Video, FileText } from "lucide-react";
import { CreateActivityForm } from "@/components/admin/create-activity-form";
import { useToast } from "@/hooks/use-toast";

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const activities = [
    {
      id: "1",
      title: "Introduction to Digital Marketing",
      type: "video",
      points: 100,
      status: "active",
      completions: 45,
      createdAt: "2024-03-01",
    },
    {
      id: "2",
      title: "User Experience Survey",
      type: "survey",
      points: 50,
      status: "draft",
      completions: 0,
      createdAt: "2024-03-10",
    },
  ];

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (id: string) => {
    // Implement view details functionality
    toast({
      title: "Viewing Details",
      description: `Viewing details for activity ${id}`,
    });
  };

  const handleEditActivity = (id: string) => {
    // Implement edit functionality
    toast({
      title: "Editing Activity",
      description: `Editing activity ${id}`,
    });
  };

  const handleDeleteActivity = (id: string) => {
    // Implement delete functionality
    toast({
      title: "Deleting Activity",
      description: `Are you sure you want to delete activity ${id}?`,
      variant: "destructive",
    });
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a new video or survey task for users to complete.
                </DialogDescription>
              </DialogHeader>
              <CreateActivityForm />
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
                <TableHead>Completions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
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
                  <TableCell>{activity.completions}</TableCell>
                  <TableCell>{activity.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(activity.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditActivity(activity.id)}>
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
    </div>
  );
}