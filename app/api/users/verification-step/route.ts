import { NextResponse } from "next/server";
import { getUserVerificationStep } from "@/app/actions/user-actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    // Parse the request JSON
    const { fromMiddleware, userId: middlewareUserId, userEmail } = await request.json();

    // Determine userId
    const userId = fromMiddleware 
      ? middlewareUserId 
      : (await auth()).userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    // Fetch the verification step
    const verificationStep = await getUserVerificationStep(userId);

    return NextResponse.json({ verificationStep });
  } catch (error) {
    console.error("Error fetching user verification step:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
