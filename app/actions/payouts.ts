"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "./isAdmin";
import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";

const STATS_CACHE_EXPIRATION = 300; // 5 minutes
const HISTORY_CACHE_EXPIRATION = 600; // 10 minutes

export interface PayoutStats {
  availableBalance: number;
  pendingPayout: number;
  totalEarned: number;
}

export interface PayoutHistoryItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function getPayoutStats(userId: string): Promise<PayoutStats> {
  //debugger
  const cacheKey = `payout:stats:${userId}`;

  const cachedStats = await redis.get(cacheKey);
  if (cachedStats) return cachedStats as PayoutStats;

  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
    select: { points_balance: true },
  });

  const pendingPayout = await prisma.payout.findFirst({
    where: { user: { employClerkUserId: userId }, status: "pending" },
  });

  const totalEarned = await prisma.payout.aggregate({
    where: { user: { employClerkUserId: userId }, status: "completed" },
    _sum: { amount: true },
  });

  const payoutStats: PayoutStats = {
    availableBalance: (user?.points_balance ?? 0) * 0.01, // Convert points to dollars
    pendingPayout: pendingPayout?.amount ?? 0,
    totalEarned: totalEarned._sum.amount ?? 0,
  };

  await redis.set(cacheKey, payoutStats, { ex: STATS_CACHE_EXPIRATION });

  return payoutStats;
}

export async function getPayoutHistory(
  userId: string
): Promise<PayoutHistoryItem[]> {
  const cacheKey = `payout:history:${userId}`;

  const cachedHistory = await redis.get(cacheKey);
  if (cachedHistory) return cachedHistory as PayoutHistoryItem[];

  const history = await prisma.payout.findMany({
    where: { user: { employClerkUserId: userId } },
    orderBy: { createdAt: "desc" },
  });

  const formattedHistory: PayoutHistoryItem[] = history.map((payout) => ({
    id: payout.id ?? "",
    amount: payout.amount ?? 0,
    status: payout.status ?? "",
    createdAt: payout.createdAt?.toISOString() ?? "",
  }));

  await redis.set(cacheKey, formattedHistory, { ex: HISTORY_CACHE_EXPIRATION });

  return formattedHistory;
}

export async function requestPayout(userId: string, amount: number) {
 // debugger;
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
    include: { bankAccounts: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.bankAccounts[0]) throw new Error("Bank account required");

  // Correct conversion: 100 points = $1, so multiply dollars by 100
  const pointsNeeded = amount * 100; 
  if (user.points_balance && user.points_balance < pointsNeeded) {
    throw new Error("Insufficient points balance");
  }

  const [payout] = await prisma.$transaction([
    prisma.payout.create({
      data: { userId: user.id, amount, status: "pending" },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { points_balance: { decrement: pointsNeeded } },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        title: "Payout Requested",
        message: `Your payout request for $${amount} has been submitted and is being reviewed.`,
        type: "info",
        userRole: (await isAdmin()) ? "admin" : "user",
      },
    }),
  ]);

  // ✅ Clear Redis cache
  await redis.del(`payout:stats:${userId}`);
  await redis.del(`payout:history:${userId}`);

  console.log("✅ Payout request processed successfully:", payout);
  
  return payout;
}

