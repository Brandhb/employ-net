import { NextResponse, NextRequest } from "next/server";
import { getUserVerificationStep } from "@/app/actions/user-actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // ✅ Parse request body
    const body = await request.json();
    if (!body) {
      console.error("⛔ Invalid request - Missing request body");
      return NextResponse.json({ error: "Missing request body" }, { status: 400 });
    }

    console.log("📌 Received Request:", body);

    const { fromMiddleware, userId: middlewareUserId, userEmail } = body;

    // ✅ Ensure `userId` exists
    let userId = middlewareUserId;
    if (!fromMiddleware) {
      const authUser = await auth(); // ✅ No need to `await` auth()
      userId = authUser?.userId;
    }

    if (!userId) {
      console.error("⛔ Unauthorized request - Missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      console.error("⚠️ Invalid request - Missing userEmail");
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    // ✅ Fetch verification step safely
    let verificationStep;
    try {
      verificationStep = (await getUserVerificationStep(userId)) || 0;
    } catch (error) {
      console.error("❌ Error fetching verification step:", error);
      return NextResponse.json(
        { error: "Failed to fetch verification step" },
        { status: 500 }
      );
    }

    console.log("✅ Returning Verification Step:", verificationStep);
    return NextResponse.json({ verificationStep });
  } catch (error) {
    console.error("🚨 Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
