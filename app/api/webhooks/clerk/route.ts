import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { handleEvent } from "@/app/actions/clerk";
import { getClerkWebhookSecret } from "@/lib/clerk";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("[Webhook] Received request from Clerk.");

  const WEBHOOK_SECRET = getClerkWebhookSecret();
  if (!WEBHOOK_SECRET) {
    console.error("[Webhook Error] Missing Clerk Webhook Secret.");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  // Get and validate headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("[Webhook Error] Missing Svix Headers");
    return new NextResponse("Unauthorized - Missing headers", { status: 400 });
  }

  // Read request body
  const payload = await req.json();
  console.log("[Webhook] Payload Received:", payload);
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Webhook Error] Invalid webhook signature:", err);
    return new NextResponse("Unauthorized - Invalid signature", { status: 400 });
  }

  // Process event
  try {
    await handleEvent(evt);
    console.log("[Webhook] Successfully processed event.");
    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[Webhook Error] Processing event failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
