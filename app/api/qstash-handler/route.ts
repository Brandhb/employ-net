import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🚀 QStash Received Job:", body);

    // ✅ Process the job
    // Example: Send email, generate a report, etc.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ QStash Job Processing Error:", error);
    return NextResponse.json({ error: "Failed to process job" }, { status: 500 });
  }
}
