"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, ArrowUpRight } from "lucide-react";
import { getPayoutStats, getPayoutHistory, PayoutStats, PayoutHistoryItem } from "@/app/actions/payouts";
import { RequestPayoutButton } from "@/components/dashboard/request-payout-button";
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";

export default function PayoutsPage() {
  const { userId } = useAuth();
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [statsData, historyData] = await Promise.all([
          getPayoutStats(userId || ""),
          getPayoutHistory(userId || ""),
        ]);
        setStats(statsData);
        setPayoutHistory(historyData);
      } catch (error) {
        console.error("Error fetching payout data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData(); // ✅ Initial fetch

    // ✅ Listen for Realtime Changes
    listenForTableChanges("payout").then((channel) => {
      console.log("✅ Subscribed to payout table:", channel);

      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payout" },
        (payload) => {
          console.log("🔄 Realtime Update:", payload);

          const  {eventType } = payload; // ✅ Store event type separately

          // ✅ Show a toast notification for different event types
          toast({
            title: "Payout Updated",
            description: `A payout was ${
              eventType === "INSERT" ? "added" : eventType === "UPDATE" ? "updated" : "deleted"
            }.`,
          });

          // ✅ Type assertion: Explicitly cast payload data
          const updatedPayout = payload.new as PayoutHistoryItem;
          const deletedPayout = payload.old as PayoutHistoryItem;

          // ✅ Handle different events efficiently
          if (eventType === "INSERT") {
            setPayoutHistory((prev) => [...prev, updatedPayout]);
          } else if (eventType === "UPDATE") {
            setPayoutHistory((prev) =>
              prev.map((payout) => (payout.id === updatedPayout.id ? updatedPayout : payout))
            );
          } else if (eventType === "DELETE") {
            setPayoutHistory((prev) =>
              prev.filter((payout) => payout.id !== deletedPayout.id)
            );
          }
        }
      );
    });

    return () => {
      console.log("🛑 Unsubscribing from payout table...");
    };
  }, [userId]);

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Payouts</h2>

      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Available Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">${stats?.availableBalance.toFixed(2) ?? "0.00"}</div>
            )}
            <p className="text-xs text-muted-foreground">Minimum payout: $10.00</p>
            {loading ? (
              <Skeleton className="h-10 w-full mt-4" />
            ) : (
              <RequestPayoutButton availableBalance={stats?.availableBalance || 0} className="mt-4 w-full" />
            )}
          </CardContent>
        </Card>

        {/* Total Earned Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">${stats?.totalEarned.toFixed(2) ?? "0.00"}</div>
            )}
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : payoutHistory.length > 0 ? (
                payoutHistory.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>PayPal</TableCell>
                    <TableCell>{payout.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No payout history found.
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
