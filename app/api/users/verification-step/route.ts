import { NextResponse } from "next/server";
import { getUserVerificationStep } from "@/app/actions/user-actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const {
      fromMiddleware,
      userId: middlewareUserId,
      userEmail,
    } = await request.json();

    console.log("Received Request:", {
      fromMiddleware,
      middlewareUserId,
      userEmail,
    });
    debugger;
    // ✅ Fetch userId ONLY if it's from middleware, otherwise use request body
    let userId = middlewareUserId;
    if (!fromMiddleware) {
      const authUser = await auth();
      userId = authUser?.userId;
    }

    if (!userId) {
      console.error("Unauthorized request - Missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      console.error("Invalid request - Missing userEmail");
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    let verificationStep;
    try {
      verificationStep = (await getUserVerificationStep(userId)) || 0;
    } catch (error) {
      console.error("Error fetching verification step:", error);
      return NextResponse.json(
        { error: "Failed to fetch verification step" },
        { status: 500 }
      );
    }

    console.log("Returning Verification Step:", verificationStep);
    return NextResponse.json({ verificationStep });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
