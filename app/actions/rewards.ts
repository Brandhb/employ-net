"use server";

import { prisma } from "@/lib/prisma";

interface RewardRedemptionResult {
  success: boolean;
  message: string;
  newBalance?: number;
}

export async function redeemReward(
  userEmail: string,
  rewardPoints: number,
  rewardTitle: string
): Promise<RewardRedemptionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, points_balance: true },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.points_balance && user.points_balance < rewardPoints) {
      return { 
        success: false, 
        message: "Insufficient points balance" 
      };
    }

    // Update user's points balance and create reward record in a transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          points_balance: {
            decrement: rewardPoints
          }
        }
      }),
      prisma.reward.create({
        data: {
          user_id: user.id,
          points: rewardPoints,
          description: `Redeemed ${rewardTitle}`
        }
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          title: "Reward Redeemed",
          message: `You have successfully redeemed ${rewardTitle} for ${rewardPoints} points`,
          type: "success"
        }
      })
    ]);

    return {
      success: true,
      message: "Reward redeemed successfully",
      newBalance: updatedUser.points_balance || 0
    };
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return {
      success: false,
      message: "Failed to redeem reward. Please try again."
    };
  }
}