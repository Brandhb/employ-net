"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function startVerificationTask(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.activity.update({
    where: { id: taskId, userId: userId },
    data: { status: "pending" },
  });

  return { success: true };
}
