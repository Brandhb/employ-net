// app/api/change-password/route.ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing password change request...`);

  try {
    const { userId, currentPassword, newPassword } = await req.json();

    if (!userId || !currentPassword || !newPassword) {
      console.error(`[${requestId}] Missing required fields.`);
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Clerk does not verify current passwords directly. You might need to implement a re-authentication step.
    const { users } = await clerkClient();
    const updatedUser = await users.updateUser(userId, {
      password: newPassword,
    });

    console.log(
      `[${requestId}] Successfully updated password for userId: ${userId}`
    );
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`[${requestId}] Error updating password:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
