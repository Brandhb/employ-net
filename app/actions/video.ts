// app/actions/video.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getVideoActivity(activityId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    throw new Error("Video not found");
  }

  return activity;
}
