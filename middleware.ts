import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk(.*)"]);

// Function to verify Clerk webhook signature
async function verifyClerkWebhook(req: Request) {
  const signature = req.headers.get("Clerk-Signature");
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!signature || !secret) {
    console.warn("❌ Missing signature or secret in webhook request");
    return false;
  }

  try {
    const textBody = await req.text();
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(textBody);
    const expectedSignature = hmac.digest("hex");

    if (signature === expectedSignature) {
      console.log("✅ Clerk webhook signature verified");
      return true;
    } else {
      console.warn("❌ Clerk webhook signature mismatch");
      return false;
    }
  } catch (error) {
    console.error("❌ Error verifying Clerk webhook:", error);
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  console.log(`🔍 Request received: ${req.method} ${req.nextUrl.pathname}`);

  const { userId, redirectToSignIn } = await auth();
  console.log(`🔑 Authenticated user ID: ${userId || "None"}`);

  // ✅ Allow Clerk webhook routes but verify them
  if (isWebhookRoute(req)) {
    console.log("📩 Incoming webhook request...");
    const isValidWebhook = await verifyClerkWebhook(req);
    if (!isValidWebhook) {
      console.warn("❌ Unauthorized Clerk webhook request");
      return new NextResponse("Unauthorized Webhook Request", { status: 403 });
    }
    console.log("✅ Valid Clerk webhook request received");
    return NextResponse.next();
  }

  // ✅ Protect /dashboard routes
  if (isProtectedRoute(req)) {
    console.log("🔒 Accessing protected route:", req.nextUrl.pathname);

    if (!userId) {
      console.warn("❌ User is not authenticated, redirecting to sign-in");
      return redirectToSignIn();
    }

    // Fetch user metadata
    try {
      console.log(`📡 Fetching user metadata for user: ${userId}`);
      const CC = await clerkClient();
      const user = await CC.users.getUser(userId);
      const userRole = user?.publicMetadata?.role;
      console.log(`🎭 User role: ${userRole || "None"}`);

      if (userRole !== "admin") {
        console.warn("❌ User is not an admin, redirecting to /unauthorized");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      console.log("✅ User is authorized to access this page");
    } catch (error) {
      console.error("❌ Error fetching user metadata:", error);
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  console.log("✅ Request allowed to proceed");
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip middleware for Clerk webhooks but verify them
    "/((?!api/webhooks/clerk|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
