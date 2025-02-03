import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const headersList = headers();
  const signature = headersList.get("typeform-signature");

  // TODO: Verify Typeform webhook signature
  // const isValidSignature = verifyTypeformSignature(signature, body);
  // if (!isValidSignature) {
  //   return new NextResponse("Invalid signature", { status: 401 });
  // }

  try {
    const { form_response } = body;
    const formId = form_response.form_id;

    // Find the activity associated with this form
    const activity = await prisma.activity.findFirst({
      where: {
        type: "survey",
        metadata: {
          path: ["form_id"],
          equals: formId
        }
      },
    });

    if (!activity) {
      return new NextResponse("Activity not found", { status: 404 });
    }

    // Record the survey completion in a transaction
    await prisma.$transaction([
      // Update activity status
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

      // Add points to user's balance
      prisma.user.update({
        where: { id: activity.userId },
        data: {
          points_balance: {
            increment: activity.points
          }
        },
      }),

      // Log the activity
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
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Typeform webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}