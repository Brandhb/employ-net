"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentActivities } from "@/app/actions/activities";
import { formatDistanceToNow } from "date-fns";
import { ActivityLog } from "@/types";

export function RecentActivities() {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!userId) return;
  
    const fetchActivities = async () => {
      try {
        const recentActivities = await getRecentActivities(userId);
  
        // ✅ Ensure it's always an array
        const safeActivities = Array.isArray(recentActivities) ? recentActivities : [];
  
        const transformedActivities = safeActivities.map((log) => ({
          ...log,
          activityId: log.activityId || undefined, // Convert `null` to `undefined`
          createdAt: log.createdAt || undefined, // Ensure `createdAt` matches the interface
          activity: log.activity || null, // Ensure `activity` is either an object or `null`
        }));
  
        setActivities(transformedActivities as ActivityLog[]);
      } catch (error) {
        console.error("❌ Error fetching recent activities:", error);
        setActivities([]); // ✅ Set to empty array on error
      }
    };
  
    fetchActivities();
  }, [userId]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Activity</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.activity?.title || "N/A"}</TableCell>
            <TableCell>{log.activity?.points ?? 0}</TableCell>
            <TableCell>
              {log.createdAt
                ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })
                : "Unknown"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
