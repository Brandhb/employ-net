"use client";

import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  getVerificationRequests,
  markVerificationCompleted,
  updateVerificationRequest,
} from "@/app/actions/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";
import { getInternalUserIdUtil } from "@/lib/utils";

interface VerificationRequest {
  id: string;
  userEmail: string;
  status: string;
  verificationUrl: string | null;
  activityTitle: string;
}

export default function VerificationRequestsPage() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const updateQueue = useRef<VerificationRequest[]>([]); // ✅ Buffer for batched updates

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let updateTimer: NodeJS.Timeout | null = null;

    async function fetchRequests() {
      setLoading(true);
      try {
        const data = await getVerificationRequests();
        setRequests(data);
      } catch (error) {
        console.error("❌ Error fetching verification requests:", error);
        toast({
          title: "Error",
          description: "Failed to fetch verification requests.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRequests(); // ✅ Initial Fetch

    async function subscribeToRealtimeUpdates() {
      unsubscribe = await listenForTableChanges("verification_requests", "userId", getInternalUserIdUtil()!, (payload) => {
        console.log("🔄 Realtime Update Received:", payload);

        toast({
          title: "Verification Requests Updated",
          description: `A request was ${
            payload.event === "INSERT"
              ? "added"
              : payload.event === "UPDATE"
              ? "updated"
              : "deleted"
          }.`,
        });

        if (payload.event === "INSERT" && payload.new) {
          updateQueue.current.push(payload.new as VerificationRequest);
        } else if (payload.event === "UPDATE" && payload.new) {
          updateQueue.current = updateQueue.current.map((req) =>
            req.id === (payload.new as VerificationRequest).id ? (payload.new as VerificationRequest) : req
          );
        } else if (payload.event === "DELETE" && payload.old) {
          updateQueue.current = updateQueue.current.filter(
            (req) => req.id !== (payload.old as VerificationRequest).id
          );
        }

        if (!updateTimer) {
          updateTimer = setTimeout(() => {
            console.log("✅ Processing batched updates...");
            setRequests((prev) => [...prev, ...updateQueue.current]); // Apply batch updates
            updateQueue.current = []; // Clear queue
            updateTimer = null; // Reset timer
          }, 500); // Process updates every 500ms
        }
      });

      console.log("✅ Subscribed to verification_requests");
    }

    subscribeToRealtimeUpdates();

    return () => {
      if (unsubscribe) {
        unsubscribe(); // ✅ Properly remove listener
        console.log("🛑 Unsubscribed from verification_requests...");
      }
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
    };
  }, []);

  const handleUpdate = async (id: string, verificationUrl: string) => {
    setUpdating(id);
    try {
      await updateVerificationRequest(id, "ready", verificationUrl);
      toast({
        title: "Verification updated",
        description: "User can now start the verification task.",
      });
      setRequests(await getVerificationRequests());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification request.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleMarkAsCompleted = async (requestId: string) => {
    setUpdating(requestId);
  
    try {
      await markVerificationCompleted(requestId); // ✅ Call the server action directly
  
      toast({
        title: "Verification Completed",
        description: "The request has been marked as completed.",
      });
  
      // ✅ Optimistically update the UI
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "completed" } : r
        )
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update request",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Table>
  <TableHeader>
    <TableRow className="bg-muted">
      <TableHead className="w-1/5">User</TableHead>
      <TableHead className="w-1/5 text-center">Activity</TableHead>
      <TableHead className="w-1/6 text-center">Status</TableHead>
      <TableHead className="w-1/3 text-center">Verification URL</TableHead>
      <TableHead className="w-1/6 text-center">Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {loading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell><Skeleton className="h-6 w-40" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-32" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-60" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-10 w-32" /></TableCell>
        </TableRow>
      ))
    ) : requests.length > 0 ? (
      requests.map((request) => (
        <TableRow key={request.id}>
          <TableCell>{request.userEmail}</TableCell>
          <TableCell className="text-center">{request.activityTitle || "N/A"}</TableCell>
          <TableCell className="text-center">
            <Badge
              variant={
                request.status === "ready"
                  ? "default"
                  : request.status === "waiting"
                  ? "secondary"
                  : "outline"
              }
              className="text-xs px-2 py-1 rounded-full"
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </TableCell>
          <TableCell className="text-center">
            {request.status === "ready" ? (
              <a
                href={request.verificationUrl!}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                Open Link
              </a>
            ) : request.status === "waiting" ? (
              <Input
                type="text"
                placeholder="Paste verification URL"
                className="w-full sm:w-60"
                value={request.verificationUrl || ""}
                onChange={(e) => {
                  setRequests((prev) =>
                    prev.map((r) =>
                      r.id === request.id
                        ? { ...r, verificationUrl: e.target.value }
                        : r
                    )
                  );
                }}
              />
            ) : (
              <span className="text-muted-foreground">✅ Completed</span>
            )}
          </TableCell>
          <TableCell className="text-center">
            {request.status === "waiting" ? (
              <Button
                onClick={() =>
                  handleUpdate(request.id, request.verificationUrl || "")
                }
                disabled={updating === request.id || !request.verificationUrl}
                className="w-full sm:w-auto"
              >
                {updating === request.id ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Approve"
                )}
              </Button>
            ) : request.status === "ready" ? (
              <Button
                variant="outline"
                onClick={() => handleMarkAsCompleted(request.id)}
                disabled={updating === request.id}
                className="w-full sm:w-auto"
              >
                {updating === request.id ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Mark as Completed"
                )}
              </Button>
            ) : null}
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
          🛑 No pending verification requests.
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>

  );
}
