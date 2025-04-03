// /app/actions/updateNotificationSettings.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export interface NotificationPreferences {
  dailySummary: boolean;
  urgentAlerts: boolean;
}

export async function updateNotificationSettings(
  userId: string,
  newPreferences: NotificationPreferences
) {
  const updatedUser = await prisma.user.update({
    where: { employClerkUserId: userId },
    data: {
      notificationPreferences: JSON.stringify(newPreferences), // Prisma handles JSON update
    },
  });

  // Invalidate the cache for notification settings.
  await redis.del(`user:notificationSettings:${userId}`);

  return updatedUser;
}
