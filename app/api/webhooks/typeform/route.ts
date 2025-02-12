import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();
    const signature = headersList.get("mux-signature");

    console.log("🔹 Received MUX Webhook Payload:", JSON.stringify(body, null, 2));
    console.log("🔹 MUX Signature:", signature);

    // TODO: Verify Mux webhook signature (if applicable)
    // if (!verifyMuxSignature(signature, body)) {
    //   console.warn("⚠️ Invalid MUX signature.");
    //   return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    // }

    switch (body.type) {
      case "video.asset.ready": {
        console.log("✅ Video asset is ready, updating activity...");

        const activity = await prisma.activity.findFirst({
          where: {
            metadata: {
              path: ["asset_id"],
              equals: body.data.id,
            },
          },
        });

        if (!activity) {
          console.error("❌ Activity not found for asset_id:", body.data.id);
          return NextResponse.json({ success: false, message: "Activity not found" }, { status: 404 });
        }

        // Update activity with playback details
        await prisma.activity.update({
          where: { id: activity.id },
          data: {
            status: "ready",
            metadata: {
              ...(activity.metadata as Record<string, any>),
              playback_id: body.data.playback_ids?.[0]?.id || null,
              duration: body.data.duration || null,
              aspect_ratio: body.data.aspect_ratio || null,
            },
          },
        });

        console.log("✅ Activity updated successfully:", activity.id);
        break;
      }

      case "video.asset.errored": {
        console.error("❌ Video asset processing error:", body.data.error?.message);

        const activity = await prisma.activity.findFirst({
          where: {
            metadata: {
              path: ["asset_id"],
              equals: body.data.id,
            },
          },
        });

        if (!activity) {
          console.error("❌ Activity not found for asset_id:", body.data.id);
          return NextResponse.json({ success: false, message: "Activity not found" }, { status: 404 });
        }

        await prisma.activity.update({
          where: { id: activity.id },
          data: {
            status: "error",
            metadata: {
              ...(activity.metadata as Record<string, any>),
              error: body.data.error?.message || "Unknown error",
            },
          },
        });

        console.log("✅ Activity marked as 'error':", activity.id);
        break;
      }

      default: {
        console.warn("⚠️ Unhandled webhook type:", body.type);
        return NextResponse.json({ success: false, message: "Unhandled webhook type" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook Processing Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
