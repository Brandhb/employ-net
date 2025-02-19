import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  generalRateLimit,
  apiRateLimit,
  adminRateLimit,
} from "@/lib/rate-limit";
import { redis } from "@/lib/redis"; // ✅ Use Redis to cache verification status

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  console.log(`🔍 Request received: ${req.method} ${req.nextUrl.pathname}`);

  const ip = req.ip ?? "unknown";
  const { userId, redirectToSignIn } = await auth();
  const isAuthenticated = Boolean(userId);

  // ✅ Apply Rate Limiting
  let rateLimiter = generalRateLimit;
  if (isApiRoute(req)) rateLimiter = apiRateLimit;
  else if (isAdminRoute(req)) rateLimiter = adminRateLimit;

  const { success, remaining, reset } = await rateLimiter.limit(ip);
  if (!success) {
    console.warn(`⚠️ Rate limit exceeded for ${ip}`);
    return NextResponse.json(
      { error: "Too many requests, slow down!" },
      { status: 429, headers: { "Retry-After": reset.toString() } }
    );
  }

  console.log(`✅ Rate limit check passed (${remaining} requests left)`);

  // ✅ Handle Webhooks
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  // ✅ Handle Dashboard Access & Verification Check
  if (isDashboardRoute(req)) {
    if (!isAuthenticated) {
      console.warn("❌ User not authenticated, redirecting...");
      return redirectToSignIn();
    }

    // ✅ Check cached verification step to reduce DB load
    const cacheKey = `user:verificationStep:${userId}`;
    let verificationStep = await redis.get(cacheKey);
    if (verificationStep !== null) {
      if (Number(verificationStep) === 0) {
        console.warn("❌ User verification incomplete, redirecting...");
        return NextResponse.redirect("https://docs-here.com/account-verification");
      }
      return NextResponse.next(); // ✅ Allow access if Redis has verification data
    }
  
    console.log("⏳ Verification step not in cache, sending to loading page...");
    return NextResponse.redirect(new URL("/loading-page", req.url)); // ✅ Send to loading page for DB check 
    
  }

  // ✅ Handle Admin Route Protection
  if (isAdminRoute(req)) {
    if (!userId) return redirectToSignIn();

    try {
      const { users } = await clerkClient();
      const user = await users.getUser(userId);
      const userRole = user?.publicMetadata?.role || "user";

      if (userRole !== "admin") {
        console.warn("❌ Not an admin, redirecting...");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      console.error("❌ Error fetching user metadata:", error);
      return redirectToSignIn();
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
