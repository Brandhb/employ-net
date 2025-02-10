import { Webhook } from "svix";
import { headers } from "next/headers";
import { handleEvent } from "@/app/actions/clerk";
import { getClerkWebhookSecret } from "@/lib/clerk";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("📩 Webhook Triggered: Receiving Request...");

  try {
    const WEBHOOK_SECRET = getClerkWebhookSecret();
    if (!WEBHOOK_SECRET) {
      console.error("❌ Webhook Secret Not Found");
      return new Response("Error: Missing Webhook Secret", { status: 500 });
    }
    console.log("🔹 Clerk Webhook Secret Retrieved");

    // Extract Headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    console.log("🔹 Webhook Headers Received", { svix_id, svix_timestamp });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing Svix Headers");
      return new Response("Error: Missing Svix Headers", { status: 400 });
    }

    // Extract raw body
    const rawBody = await req.text();
    console.log("🔹 Raw Webhook Body Received:", rawBody.slice(0, 500)); // Log first 500 chars for debugging

    // Validate Webhook Signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(rawBody, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("❌ Webhook Verification Failed:", err);
      return new Response("Error: Invalid Webhook Signature", { status: 400 });
    }

    console.log("✅ Webhook Signature Verified");
    console.log("🔹 Webhook Event Type:", evt.type);

    // Process Event
    try {
      console.log(`🚀 Processing Webhook Event: ${evt.type}`);
      await handleEvent(evt);
      console.log("✅ Webhook Successfully Processed");
      return new Response("Success", { status: 200 });
    } catch (error) {
      console.error("❌ Error Processing Webhook:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  } catch (error) {
    console.error("❌ Unexpected Error in Webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
