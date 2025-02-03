import { Webhook } from "svix";
import { headers } from "next/headers";
import { handleEvent } from "@/app/actions/clerk";
import { getClerkWebhookSecret } from "@/lib/clerk";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log('from clerk api');
  const WEBHOOK_SECRET = getClerkWebhookSecret();

  // Get and validate headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  console.log('***Payload***: ', payload);
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  // Verify the payload with the headers
  let evt:WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred -- invalid webhook signature", { status: 400 });
  }

  // Process the event
  try {
    await handleEvent(evt);
    return new Response("", { status: 200 });
  } catch (error) {
    console.error("Error processing event:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
