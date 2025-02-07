import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// ✅ Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// ✅ Define webhook route that bypasses authentication
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk"]);

// ✅ Define protected admin routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { sessionId, userId, getToken, sessionClaims } = await auth();

  // ✅ Bypass Clerk authentication for webhook routes
  if (isWebhookRoute(request)) {
    console.log("[Middleware] Bypassing Clerk authentication for webhook route.");
    return NextResponse.next();
  }

  // ✅ Redirect unauthenticated users to the sign-in page for protected routes
  if (!isPublicRoute(request) && !sessionId) {
    console.warn("[Middleware] Unauthorized access. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ Restrict Admin Routes to Admins Only
  const userRole = sessionClaims?.metadata?.role;
  if (isAdminRoute(request) && userRole !== "admin") {
    console.warn("[Middleware] Unauthorized admin access. Redirecting.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ If authenticated, check user verification step **only for protected routes**
  if (!isPublicRoute(request) && sessionId) {
    try {
      console.log("[Middleware] Fetching user details from Clerk API...");

      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        console.error("[Middleware Error] Missing CLERK_SECRET_KEY.");
        return NextResponse.redirect(new URL("/error", request.url));
      }

      // ✅ Add timeout to prevent infinite waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout after response is received

      if (!clerkResponse.ok) {
        console.error(`[Middleware Error] Clerk API request failed. Status: ${clerkResponse.status}`);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses?.[0]?.email_address;

      if (!userEmail) {
        console.error("[Middleware Error] User email not found.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      console.log("[Middleware] Checking user verification step...");

      // ✅ Add timeout to prevent long waits on verification API
      const verificationController = new AbortController();
      const verificationTimeout = setTimeout(() => verificationController.abort(), 5000);

      const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
        signal: verificationController.signal,
      });

      clearTimeout(verificationTimeout);

      // ✅ Validate Response Before Parsing JSON
      if (!verificationResponse.ok) {
        console.error(`[Middleware Error] Verification API request failed. Status: ${verificationResponse.status}`);
        console.error("[Middleware Error] Full response:", await verificationResponse.text());
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      // ✅ Now safe to parse JSON
      const verificationResult = await verificationResponse.json();

      // ✅ Fixed condition: Redirect if verification failed
      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("[Middleware] User not verified. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }
    } catch (error) {
      console.error("[Middleware Error] Unexpected error:", error);
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
