import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersList = headers();
    const signature = headersList.get("typeform-signature");

    console.log("🔍 Typeform Webhook Received:", body);

    // TODO: Verify Typeform webhook signature
    // const isValidSignature = verifyTypeformSignature(signature, body);
    // if (!isValidSignature) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const { form_response } = body;
    const formId = form_response.form_id;

    console.log("📌 Checking Activity for formId:", formId);

    // ✅ Ensure `prisma.activity` exists
    const activity = await prisma.activity.findFirst({
      where: {
        type: "survey",
        metadata: {
          path: ["form_id"],
          equals: formId,
        },
      },
    });

    if (!activity) {
      console.error("⚠️ Activity not found for formId:", formId);
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    console.log("✅ Activity found:", activity.id);

    // ✅ Record the survey completion in a transaction
    await prisma.$transaction([
      prisma.activity.update({
        where: { id: activity.id },
        data: {
          status: "completed",
          completedAt: new Date(),
          metadata: {
            ...(activity.metadata as Record<string, any>),
            response_id: form_response.token,
            submitted_at: form_response.submitted_at,
          },
        },
      }),
      prisma.user.update({
        where: { id: activity.userId },
        data: {
          points_balance: {
            increment: activity.points,
          },
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: activity.userId,
          activityId: activity.id,
          action: "survey_completed",
          metadata: {
            form_id: formId,
            response_id: form_response.token,
          },
        },
      }),
    ]);

    console.log("✅ Survey completion recorded successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing Typeform webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
