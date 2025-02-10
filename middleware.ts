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

  console.log("[Middleware Debug] sessionId:", sessionId, "userId:", userId);

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
    console.error("[Middleware Error] User ID is undefined. Clerk might not be authenticating properly.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ Restrict Admin Routes to Admins Only
  const userRole = sessionClaims?.metadata?.role || "user";
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

      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      });

      const contentType = clerkResponse.headers.get("content-type") || "";
      if (!clerkResponse.ok || !contentType.includes("application/json")) {
        console.error(`[Middleware Error] Clerk API response is not JSON. Status: ${clerkResponse.status}`);
        console.error("[Middleware Error] Full response:", await clerkResponse.text());
        return NextResponse.redirect(new URL("/", request.url));
      }

      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses?.[0]?.email_address;

      if (!userEmail) {
        console.error("[Middleware Error] User email not found.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      console.log("[Middleware] Checking user verification step...");

      const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      console.log("[Middleware Debug] Verification API Response Status:", verificationResponse.status);
      console.log("[Middleware Debug] Verification API Content-Type:", verificationResponse.headers.get("content-type"));

      const verificationContentType = verificationResponse.headers.get("content-type") || "";
      if (!verificationResponse.ok || !verificationContentType.includes("application/json")) {
        console.error("[Middleware Error] Verification API response is not valid JSON. Status:", verificationResponse.status);
        console.error("[Middleware Error] Full response:", await verificationResponse.text());
        
        const response = NextResponse.redirect(new URL("/", request.url));
        response.headers.set("x-toast-message", "Verification failed. Please try again.");
        return response;
      }

      const verificationResult = await verificationResponse.json();
      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("[Middleware] User not verified. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }
    } catch (error) {
      console.error("[Middleware Error] Unexpected error:", error);
      return NextResponse.redirect(new URL("/", request.url));
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
