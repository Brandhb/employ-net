"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createVerificationTask() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Set expiration time (60 min from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 60);

  const task = await prisma.verificationRequests.create({
    data: {
      userId: userId,
      status: "pending",
//      expiresAt,
    },
  });

  return task;
}
