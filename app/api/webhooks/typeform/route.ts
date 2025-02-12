import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = request.headers; // ✅ Fix: Retrieve headers properly
    const signature = headersList.get("typeform-signature");

    console.log("🔹 Received Typeform Webhook with Signature:", signature);

    // TODO: Verify Typeform webhook signature
    // const isValidSignature = verifyTypeformSignature(signature, body);
    // if (!isValidSignature) {
    //   console.warn("❌ Invalid Signature:", signature);
    //   return new NextResponse("Invalid signature", { status: 401 });
    // }

    const { form_response } = body;
    const formId = form_response.form_id;

    console.log("🔹 Form ID:", formId);

    // Find the activity associated with this form
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
      console.error("❌ Activity not found for form ID:", formId);
      return new NextResponse("Activity not found", { status: 404 });
    }

    console.log("✅ Activity Found:", activity.id, "| User ID:", activity.userId);

    // ✅ Transaction to update activity and user points
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

    console.log("✅ Activity Updated & Points Added Successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing Typeform webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
