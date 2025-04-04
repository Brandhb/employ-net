import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis"; // ✅ Use Redis to cache verification status
import {
  generalRateLimit,
  apiRateLimit,
  adminRateLimit,
} from "@/lib/rate-limit";

// In-memory cache (scoped to serverless runtime instance)
const memoryCache = new Map<string, { value: string | null; expiresAt: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isActivitiesRoute = createRouteMatcher(["/dashboard/activities(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isAdminOnlyRoute = createRouteMatcher([
  "/admin/payouts(.*)",
  "/admin/settings(.*)",
  "/admin/analytics(.*)",
  "/admin/users(.*)",
  "/admin/verification-requests(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  console.log(`🔍 Request received: ${req.method} ${req.nextUrl.pathname}`);

  const ip = req.ip ?? "unknown";
  const { userId, redirectToSignIn } = await auth();
  const isAuthenticated = Boolean(userId);

  // ✅ Apply Rate Limiting (based on route type)
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

  console.log(`✅ Rate limit OK (${remaining} requests left)`);

  // ✅ Allow webhooks without checks
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  // ✅ Verification gate for /dashboard/activities/*
  if (isActivitiesRoute(req)) {
    if (!isAuthenticated) {
      console.warn(`❌ Unauthenticated user, redirecting...`);
      return redirectToSignIn();
    }

    const cacheKey = `user:verificationStep:${userId}`;
    const now = Date.now();
    let verificationStep: string | null = null;

    // 🔁 Check in-memory cache first
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      verificationStep = cached.value;
    } else {
      try {
        verificationStep = await redis.get(cacheKey);
        memoryCache.set(cacheKey, {
          value: verificationStep,
          expiresAt: now + CACHE_TTL,
        });
        console.log(`🧠 Redis GET: ${cacheKey} → ${verificationStep}`);
      } catch (err) {
        console.error("❌ Redis error:", err);
        return NextResponse.next(); // fail-open on Redis issues
      }
    }

    if (verificationStep === null || Number(verificationStep) === 0) {
      console.warn(`❌ User - ${userId} is unverified. Redirecting.`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log(`✅ User - ${userId} verified.`);
  }

  // ✅ Protect admin routes
  if (isAdminRoute(req)) {
    if (!userId) return redirectToSignIn();
  
    try {
      const { users } = await clerkClient(); 
      const user = await users.getUser(userId);
      const userRole = user?.publicMetadata?.role || "user";
  
      // ✅ Only full admins can access highly sensitive routes
      if (isAdminOnlyRoute(req) && userRole !== "admin") {
        console.warn(`❌ ${userId} is not authorized to access restricted admin route.`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
  
      // ✅ For general /admin routes (like /admin, /admin/activities), allow semi-admin too
      if (userRole !== "admin" && userRole !== "semi-admin") {
        console.warn(`❌ ${userId} is not an admin or semi-admin.`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      console.error("❌ Clerk metadata fetch error:", error);
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
