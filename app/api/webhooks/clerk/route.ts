import { Webhook } from "svix";
import { headers } from "next/headers";
import { handleEvent } from "@/app/actions/clerk";
import { getClerkWebhookSecret } from "@/lib/clerk";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("🔹 Webhook Triggered: Receiving Request...");

  try {
    const WEBHOOK_SECRET = getClerkWebhookSecret();
    console.log("🔹 Clerk Webhook Secret Retrieved");

    // Extract Headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    console.log("🔹 Webhook Headers Received:", { svix_id, svix_timestamp });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing Svix Headers");
      return new Response("Error: Missing Svix Headers", { status: 400 });
    }

    // Extract Body
    const payload = await req.json();
    console.log("🔹 Webhook Payload Received:", payload);

    // Validate Webhook Signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(JSON.stringify(payload), {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("❌ Webhook Verification Failed:", err);
      return new Response("Error: Invalid Webhook Signature", { status: 400 });
    }

    console.log("✅ Webhook Signature Verified");

    // Process Event
    try {
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
