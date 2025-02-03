import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const headersList = headers();
  const signature = headersList.get("mux-signature");

  // TODO: Verify Mux webhook signature
  // const isValidSignature = verifyMuxSignature(signature, body);
  // if (!isValidSignature) {
  //   return new NextResponse("Invalid signature", { status: 401 });
  // }

  try {
    switch (body.type) {
      case "video.asset.ready": {
        // Retrieve the activity based on metadata
        const activity = await prisma.activity.findFirst({
          where: {
            metadata: {
              path: ["asset_id"],
              equals: body.data.id,
            },
          },
        });

        if (!activity) {
          console.error("Activity not found for asset_id:", body.data.id);
          return NextResponse.json({ success: false, message: "Activity not found" });
        }

        // Update the activity with new metadata and status
        await prisma.activity.update({
          where: { id: activity.id },
          data: {
            status: "ready",
            metadata: {
              ...(activity.metadata as Record<string, any>),
              playback_id: body.data.playback_ids[0].id,
              duration: body.data.duration,
              aspect_ratio: body.data.aspect_ratio,
            },
          },
        });
        break;
      }

      case "video.asset.errored": {
        // Retrieve the activity based on metadata
        const activity = await prisma.activity.findFirst({
          where: {
            metadata: {
              path: ["asset_id"],
              equals: body.data.id,
            },
          },
        });

        if (!activity) {
          console.error("Activity not found for asset_id:", body.data.id);
          return NextResponse.json({ success: false, message: "Activity not found" });
        }

        // Update the activity with error details
        await prisma.activity.update({
          where: { id: activity.id },
          data: {
            status: "error",
            metadata: {
              ...(activity.metadata as Record<string, any>),
              error: body.data.error?.message,
            },
          },
        });
        break;
      }

      default: {
        console.warn("Unhandled webhook type:", body.type);
        return NextResponse.json({ success: false, message: "Unhandled webhook type" });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Mux webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
