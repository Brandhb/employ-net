"use server";

import { sendNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function approveVerificationTask(taskId: string, testUrl?: string) {
  const task = await prisma.activity.update({
    where: { id: taskId },
    data: {
      status: "ready",
      testUrl: testUrl || null,
    },
    include: { user: true },
  });

  if (!task || !task.user?.email) {
    throw new Error("User email not found.");
  }

  const emailHtml = `
    <h2>Your Verification Task is Ready</h2>
    <p>Hello ${task.user.name || "User"},</p>
    <p>Your verification task has been approved. Click the link below to start:</p>
    <a href="${testUrl}" target="_blank">Start Verification</a>
  `;

  await sendNotificationEmail(task.user.email, "Verification Task Ready", emailHtml);

  return task;
}


