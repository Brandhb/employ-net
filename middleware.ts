import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// ✅ Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// ✅ Define webhook route that bypasses authentication
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk"]);

// ✅ Define protected admin routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { sessionId, userId, sessionClaims } = await auth();

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

  // ✅ Ensure `userId` is defined before making API requests
  if (!userId) {
    console.error("[Middleware Error] User ID is undefined. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ Restrict Admin Routes to Admins Only
  const userRole = sessionClaims?.metadata?.role || "user"; // Default to "user"
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
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ✅ Fetch user details from Clerk API
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      });

      // ✅ Ensure the response is JSON before parsing
      const contentType = clerkResponse.headers.get("content-type") || "";
      if (!clerkResponse.ok || !contentType.includes("application/json")) {
        console.error(`[Middleware Error] Clerk API response is not JSON. Status: ${clerkResponse.status}`);
        console.error("[Middleware Error] Full response:", await clerkResponse.text());
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ✅ Safe to parse JSON
      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses?.[0]?.email_address;

      if (!userEmail) {
        console.error("[Middleware Error] User email not found.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      console.log("[Middleware] Checking user verification step...");

      // ✅ Fetch verification step
      const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      // ✅ Ensure the verification response is JSON before parsing
      const verificationContentType = verificationResponse.headers.get("content-type") || "";
      if (!verificationResponse.ok || !verificationContentType.includes("application/json")) {
        console.error(`[Middleware Error] Verification API response is not valid JSON. Status: ${verificationResponse.status}`);
        console.error("[Middleware Error] Full response:", await verificationResponse.text());

        // 🔥 Redirect home & set a toast notification
        const response = NextResponse.redirect(new URL("/", request.url));
        response.headers.set("x-toast-message", "Verification failed. Please try again.");
        return response;
      }

      // ✅ Safe to parse JSON
      const verificationResult = await verificationResponse.json();

      // ✅ Redirect if verification failed
      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("[Middleware] User not verified. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }
    } catch (error) {
      console.error("[Middleware Error] Unexpected error:", error);

      // 🔥 Redirect home & set a toast notification
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("x-toast-message", "An error occurred. Please try again.");
      return response;
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
