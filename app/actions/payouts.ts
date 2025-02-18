"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "./isAdmin";

export async function getPayoutStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      employClerkUserId: userId
    },
    select: {
      points_balance: true
    }
  });

  const pendingPayout = await prisma.payout.findFirst({
    where: {
      user: {
        employClerkUserId: userId
      },
      status: 'pending'
    }
  });

  const totalEarned = await prisma.payout.aggregate({
    where: {
      user: {
        employClerkUserId: userId
      },
      status: 'completed'
    },
    _sum: {
      amount: true
    }
  });

  return {
    availableBalance: (user?.points_balance ?? 0) * 0.01, // Convert points to dollars
    pendingPayout: pendingPayout?.amount ?? 0,
    totalEarned: totalEarned._sum.amount ?? 0
  };
}

export async function requestPayout(userId: string, amount: number) {
  
  const user = await prisma.user.findUnique({
    where: {
      employClerkUserId: userId
    },
    include: {
      bankAccounts: true
    }
  });

  if (!user) throw new Error("User not found");
  if (!user.bankAccounts[0]) throw new Error("Bank account required");
  
  const pointsNeeded = amount * 100; // Convert dollars to points
  if (user.points_balance && user.points_balance< pointsNeeded) {
    throw new Error("Insufficient points balance");
  }

  const [payout] = await prisma.$transaction([
    prisma.payout.create({
      data: {
        userId: user.id,
        amount,
        status: 'pending'
      }
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        points_balance: {
          decrement: pointsNeeded
        }
      }
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        title: "Payout Requested",
        message: `Your payout request for $${amount} has been submitted and is being reviewed.`,
        type: "info",        
        userRole: await isAdmin() ? "admin" : "user"
      }
    })
  ]);

  return payout;
}

export async function getPayoutHistory(userId: string) {
  return prisma.payout.findMany({
    where: {
      user: {
        employClerkUserId: userId
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}