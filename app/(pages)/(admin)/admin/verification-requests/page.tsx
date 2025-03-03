"use client";

import { useEffect, useState } from "react";
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

interface VerificationRequest {
  id: string;
  userEmail: string;
  status: string;
  verificationUrl: string | null;
}

export default function VerificationRequestsPage() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const data = await getVerificationRequests();
        setRequests(data);
      } catch (error) {
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

    // ✅ Listen for Realtime changes
    listenForTableChanges("verification_requests").then((channel) => {
      console.log("✅ Subscribed to verification_requests:", channel);

      // ✅ Handle Realtime updates with a toast notification
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verification_requests" },
        (payload) => {
          console.log("🔄 Realtime Update:", payload);

          // ✅ Show a toast notification instead of reloading everything
          toast({
            title: "Verification Requests Updated",
            description: `A request was ${
              payload.eventType === "INSERT"
                ? "added"
                : payload.eventType === "UPDATE"
                ? "updated"
                : "deleted"
            }.`,
          });

          // ✅ Type assertion: Explicitly cast `payload.new` and `payload.old` as VerificationRequest
          if (payload.eventType === "INSERT" && payload.new) {
            setRequests((prev) => [...prev, payload.new as VerificationRequest]);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setRequests((prev) =>
              prev.map((req) => (req.id === (payload.new as VerificationRequest).id ? (payload.new as VerificationRequest) : req))
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            setRequests((prev) => prev.filter((req) => req.id !== (payload.old as VerificationRequest).id));
          }
        }
      );
    });

    return () => {
      console.log("🛑 Unsubscribing from verification_requests...");
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
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">
        Verification Requests
      </h2>

      <Card>
  <CardHeader>
    <CardTitle>Verification Requests</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verification URL</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="animate-pulse">
              <TableCell>
                <Skeleton className="h-6 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-60" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-32" />
              </TableCell>
            </TableRow>
          ))
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.userEmail}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "ready"
                      ? "default"
                      : request.status === "waiting"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {request.status === "ready" ? (
                  <a
                    href={request.verificationUrl!}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    Link
                  </a>
                ) : (
                  <Input
                    type="text"
                    placeholder="Paste verification URL"
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
                )}
              </TableCell>
              <TableCell>
                {request.status === "waiting" ? (
                  <Button
                    onClick={() =>
                      handleUpdate(request.id, request.verificationUrl || "")
                    }
                    disabled={
                      updating === request.id || !request.verificationUrl
                    }
                  >
                    {updating === request.id ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      "Approve & Send Link"
                    )}
                  </Button>
                ) : request.status === "ready" ? (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkAsCompleted(request.id)}
                    disabled={updating === request.id}
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
            <TableCell
              colSpan={4}
              className="text-center text-muted-foreground py-4"
            >
              🛑 No pending verification requests.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </CardContent>
</Card>

    </div>
  );
}
