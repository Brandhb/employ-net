"use server";

import { prisma } from "@/lib/prisma";


export async function confirmVerificationTask(taskId: string) {
  await prisma.activity.update({
    where: { id: taskId },
    data: { status: "confirmed" },
  });

  return { success: true };
}
