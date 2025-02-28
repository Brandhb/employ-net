import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendNotificationEmail } from "@/lib/email"; // ✅ Import the email function
import { sendAdminNotification } from "@/app/actions/notifications";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ Fetch user details
  const user = await prisma.user.findUnique({ where: { employClerkUserId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // ✅ Check if user already has a pending verification request
  const existingRequest = await prisma.verificationRequests.findFirst({
    where: { userId, status: "waiting" },
  });

  if (existingRequest) {
    return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });
  }

  // ✅ Create a new verification request
  await prisma.verificationRequests.create({ data: { userId } });

  // ✅ Send admin notification email
  const adminEmail = "admin@employ-net.com"; // Change this to the real admin email
  const subject = "New Verification Request";
  const html = `
    <p>A new user has requested verification:</p>
    <ul>
      <li><strong>Name:</strong> ${user.name || "Unknown"}</li>
      <li><strong>Email:</strong> ${user.email || "No email provided"}</li>
      <li><strong>Request Time:</strong> ${new Date().toLocaleString()}</li>
    </ul>
    <p>Please generate a verification link and send it to the user manually.</p>
  `;

  await sendNotificationEmail(adminEmail, subject, html);
  await sendAdminNotification(userId);

  return NextResponse.json({ success: true, message: "Verification request submitted" });
}
