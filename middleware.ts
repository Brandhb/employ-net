import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { generalRateLimit, apiRateLimit, adminRateLimit } from "@/lib/rate-limit"; // Import rate limit helpers

// Route matchers
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
//  debugger;
  console.log(`🔍 Request received: ${req.method} ${req.nextUrl.pathname}`);

  const ip = req.ip ?? "unknown"; // User IP for rate limiting

  // **Get user authentication status**
  const { userId, redirectToSignIn } = await auth();
  const isAuthenticated = Boolean(userId);

  // **Select Appropriate Rate Limiter Based on Route**
  let rateLimiter = generalRateLimit;
  if (isApiRoute(req)) {
    rateLimiter = apiRateLimit;
  } else if (isAdminRoute(req)) {
    rateLimiter = adminRateLimit;
  }

  // **Apply Rate Limiting**
  const { success, remaining, reset } = await rateLimiter.limit(ip);

  if (!success) {
    console.warn(`⚠️ Rate limit exceeded for ${ip} on ${req.nextUrl.pathname}`);
    return NextResponse.json(
      { error: "Too many requests, slow down!" },
      { status: 429, headers: { "Retry-After": reset.toString() } }
    );
  }

  console.log(`✅ Rate limit check passed (${remaining} requests left)`);

  // **Handle Webhook Security**
  if (isWebhookRoute(req)) {
    console.log("📩 Incoming webhook request...");

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.warn("❌ Missing Clerk Webhook Secret");
      return new NextResponse("Error: Missing Webhook Secret", { status: 500 });
    }

    console.log("✅ Clerk Webhook Secret is set");
    return NextResponse.next();
  }

  // **Handle Dashboard Access**
  if (isDashboardRoute(req)) {
    if (!isAuthenticated) {
      console.warn("❌ User is not authenticated, redirecting to sign-in");
      return redirectToSignIn();
    }
    return NextResponse.next();
  }

  // **Handle Admin Route Protection**
  if (isAdminRoute(req)) {
    if (!userId) {
      console.warn("❌ User is not authenticated, redirecting to sign-in");
      return redirectToSignIn();
    }

    try {
      const { users } = await clerkClient()
      const user = await users.getUser(userId);
      const userRole = user?.publicMetadata?.role || "user";

      if (userRole !== "admin") {
        console.warn("❌ User is not an admin, redirecting to /unauthorized");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("❌ Error fetching user metadata:", error);
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/webhooks/clerk|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
