import { NextResponse } from "next/server";
import { getUserVerificationStep } from "@/app/actions/user-actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    // Parse the request JSON
    const { fromMiddleware, userId: middlewareUserId, userEmail } = await request.json();

    console.log("Received Request:", { fromMiddleware, middlewareUserId, userEmail });

    // Determine userId
    const authUser = await auth();
    const userId = fromMiddleware ? middlewareUserId : authUser?.userId;

    console.log("Resolved User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    // Fetch the verification step
    let verificationStep;
    try {
      verificationStep = await getUserVerificationStep(userId);
      if (verificationStep === undefined) {
        verificationStep = 0;
      }
    } catch (error) {
      console.error("Error fetching verification step:", error);
      return NextResponse.json({ error: "Failed to fetch verification step" }, { status: 500 });
    }

    console.log("Returning Verification Step:", verificationStep);
    return NextResponse.json({ verificationStep });
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error)?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
