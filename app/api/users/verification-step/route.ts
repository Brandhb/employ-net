import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase"; // Import Supabase client

// Function to check user verification step with retries
async function fetchVerificationStep(userId: string, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await supabase
      .from("users")
      .select("verification_step")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return data.verification_step; // Return if user is found
    }

    console.warn(`⏳ Waiting for user to be available in DB... Retry ${i + 1}/${retries}`);
    await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
  }

  return null; // Return null if user still not found after retries
}

export async function POST(request: Request) {
  try {
    const { fromMiddleware, userId: middlewareUserId, userEmail } = await request.json();
    console.log("📩 Received Request:", { fromMiddleware, middlewareUserId, userEmail });

    // Get userId from Clerk auth() or fallback to middlewareUserId
    const authUser = await auth();
    const userId = fromMiddleware ? middlewareUserId : authUser?.userId;
    console.log("✅ Resolved User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    // Poll Supabase to wait for user creation
    const verificationStep = await fetchVerificationStep(userId);

    if (verificationStep === null) {
      console.warn("⚠️ User not found in database after retries. Returning pending status...");
      return NextResponse.json({ status: "pending" }); // Indicate waiting
    }

    console.log("✅ Returning Verification Step:", verificationStep);
    return NextResponse.json({ status: "success", verificationStep });
  } catch (error) {
    console.error("❌ Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error)?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
