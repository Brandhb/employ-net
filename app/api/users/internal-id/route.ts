import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Incoming request to fetch internal user ID");

    // ✅ Authenticate the user
    const authUser = await auth();
    const employClerkUserId = authUser?.userId;

    if (!employClerkUserId) {
      console.error("⛔ Unauthorized request - Missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔑 Clerk User ID:", employClerkUserId);

    // ✅ Fetch internal user ID from database
    const user = await prisma.user.findUnique({
      where: { employClerkUserId },
      select: { id: true },
    });

    if (!user) {
      console.error("❌ No internal user found for Clerk ID:", employClerkUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const internalUserId = user.id;
    console.log("✅ Found Internal User ID:", internalUserId);

    // ✅ Return the internal user ID
    return NextResponse.json({ internalUserId });
  } catch (error) {
    console.error("❌ Error fetching internal user ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
