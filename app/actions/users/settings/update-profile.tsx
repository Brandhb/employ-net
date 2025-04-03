// /app/actions/updateProfile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { clerkClient } from "@clerk/nextjs/server";

// Update the user profile both in your database and optionally in Clerk.
export async function updateUserProfile(userId: string, newProfileData: { name?: string; phoneNumber?: string }) {
  // Update in Prisma
  const updatedUser = await prisma.user.update({
    where: { employClerkUserId: userId },
    data: {
      name: newProfileData.name,
      phoneNumber: newProfileData.phoneNumber,
      // Add other fields as needed
    },
  });

  // (Optional) Update Clerk’s profile:
  try {
    const { users } = await clerkClient()
    await users.updateUser(userId, {
      publicMetadata: {
        name: newProfileData.name,
        phoneNumber: newProfileData.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error updating Clerk profile:", error);
    // You may choose to proceed even if Clerk update fails.
  }

  // Invalidate any cached profile settings in Redis.
  await redis.del(`user:profile:${userId}`);

  return updatedUser;
}
