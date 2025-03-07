"use server";

import * as Sentry from "@sentry/nextjs";

import {
  CreateActivityData,
  CreateActivityResponse,
} from "@/app/lib/types/admin";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { ActivityData } from "@/types";
import { requireAdminAuth, requireAuthUser } from "../admin";
import { revalidatePath } from "next/cache";

const ACTIVITIES_CACHE_KEY = "activities";
const ACTIVITIES_CACHE_EXPIRATION = 300; // 5 minutes

export async function getActivities(): Promise<ActivityData[]> {
  //debugger

  try {
    console.log(
      `[📡 ${new Date().toISOString()}] Checking Redis cache for activities...`
    );

    // ✅ Check Redis cache first
    const cachedActivities = await redis.get(ACTIVITIES_CACHE_KEY);
    if (cachedActivities) {
      console.log(
        `[✅ ${new Date().toISOString()}] Returning cached activities`
      );
      return cachedActivities as ActivityData[];
    }

    console.log(
      `[🗂 ${new Date().toISOString()}] Fetching activities from database...`
    );
    const activities = await prisma.activity.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        points: true,
        createdAt: true,
        completedAt: true,
        is_template: true,
        _count: { select: { completions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      type: activity.type as
        | "video"
        | "survey"
        | "verification"
        | "ux_ui_test"
        | "ai_image_task",
      status: activity.status as "active" | "draft",
      points: activity.points,
      createdAt: activity.createdAt?.toISOString() || "",
      completedAt: activity.completedAt ?? null,
      isTemplate: activity.is_template,
      _count: activity._count?.completions ?? 0,
    }));

    console.log(
      `[💾 ${new Date().toISOString()}] Caching activities for ${ACTIVITIES_CACHE_EXPIRATION} seconds...`
    );
    await redis.set(ACTIVITIES_CACHE_KEY, formattedActivities, {
      ex: ACTIVITIES_CACHE_EXPIRATION,
    });

    return formattedActivities;
  } catch (error) {
    console.error(
      `[❌ ${new Date().toISOString()}] getActivities: Error fetching activities:`,
      error
    );
    Sentry.captureException(error); // ✅ Sentry captures this error
    return [];
  }
}

export async function createActivity(
  data: CreateActivityData
): Promise<CreateActivityResponse> {
  try {
    console.log(`[🚀 ${new Date().toISOString()}] Creating new activity...`);

    const userId = await requireAuthUser();
    const internalUser = await prisma.user.findUniqueOrThrow({
      where: { employClerkUserId: userId },
      select: { id: true },
    });

    await prisma.activity.create({
      data: { ...data, userId: internalUser.id, is_template: true },
    });

    console.log(
      `[🗑️ ${new Date().toISOString()}] Clearing activity cache after creation...`
    );

    // ✅ Clear cache to ensure fresh data
    await redis.del(ACTIVITIES_CACHE_KEY);

    revalidatePath("/dashboard/activities");
    console.log(
      `[✅ ${new Date().toISOString()}] Activity created successfully.`
    );

    return { success: true };
  } catch (error) {
    console.error(
      `[❌ ${new Date().toISOString()}] createActivity: Error creating activity:`,
      error
    );
    Sentry.captureException(error); // ✅ Sentry captures this error
    return { success: false, error: "Failed to create activity" };
  }
}

export async function updateActivity(
  id: string,
  data: Partial<CreateActivityData>
): Promise<CreateActivityResponse> {
  debugger;
  try {
    console.log(`[🔄 ${new Date().toISOString()}] Updating activity ID: ${id}`);

    const userId = await requireAuthUser();
    const internalUser = await prisma.user.findUniqueOrThrow({
      where: { employClerkUserId: userId },
      select: { id: true },
    });

    await prisma.activity.update({
      where: { id }, // ✅ Ensure activity belongs to the user
      data,
    });

    console.log(
      `[🗑️ ${new Date().toISOString()}] Clearing cache after activity update...`
    );

    // ✅ Clear cache after update
    await redis.del(ACTIVITIES_CACHE_KEY);
    console.log(
      `[✅ ${new Date().toISOString()}] Activity ID: ${id} updated successfully.`
    );

    return { success: true };
  } catch (error) {
    console.error(
      `[❌ ${new Date().toISOString()}] updateActivity: Error updating activity:`,
      error
    );
    Sentry.captureException(error); // ✅ Sentry captures this error
    return { success: false, error: "Failed to update activity" };
  }
}

export async function updateActivityStatus(activityId: string, status: string) {
  await requireAdminAuth();
  console.log(
    `[🔄 ${new Date().toISOString()}] Updating status of activity ID: ${activityId} to "${status}"`
  );

  const updatedActivity = await prisma.activity.update({
    where: { id: activityId },
    data: { status },
  });

  console.log(
    `[🗑️ ${new Date().toISOString()}] Clearing cache after activity status update...`
  );

  // ✅ Clear cache after status update
  await redis.del(ACTIVITIES_CACHE_KEY);

  revalidatePath("/dashboard/activities");

  console.log(
    `[✅ ${new Date().toISOString()}] Activity status updated successfully.`
  );

  return updatedActivity;
}

export async function deleteActivity(activityId: string) {
  await requireAdminAuth(); // ✅ Ensures only admin users can delete

  console.log(
    `[🗑️ ${new Date().toISOString()}] Deleting activity ID: ${activityId}`
  );

  await prisma.activity.delete({ where: { id: activityId } });

  console.log(
    `[🗑️ ${new Date().toISOString()}] Clearing cache after activity deletion...`
  );
  // ✅ Clear cache after deletion
  await redis.del(ACTIVITIES_CACHE_KEY);

  revalidatePath("/admin/activities");
  revalidatePath("/dashboard/activities");

  console.log(
    `[✅ ${new Date().toISOString()}] Activity ID: ${activityId} deleted successfully.`
  );

  return { success: true };
}
