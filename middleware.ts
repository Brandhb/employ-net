import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis"; // ✅ Use Redis to cache verification status
import {
  generalRateLimit,
  apiRateLimit,
  adminRateLimit,
} from "@/lib/rate-limit";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isActivitiesRoute = createRouteMatcher(["/dashboard/activities(.*)"]);
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

  // ✅ Block access to `/dashboard/activities/*` for unverified users
  if (isActivitiesRoute(req)) {
    if (!isAuthenticated) {
      console.warn(`❌ User - ${userId} not authenticated, redirecting...`);
      return redirectToSignIn();
    }

    const cacheKey = `user:verificationStep:${userId}`;
    let verificationStep = await redis.get(cacheKey);

    if (verificationStep === null || Number(verificationStep) === 0) {
      console.warn(
        `❌ User - ${userId} is unverified! Redirecting to /dashboard...`
      );
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log(`✅ User - ${userId} is verified. Access granted.`);
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
    "/((?!api/webhooks/clerk|_next|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|eot|mp4|avi|mov|csv|txt|json|xml|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
