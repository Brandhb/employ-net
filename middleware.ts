import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define routes that should bypass Clerk authentication
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk"]);
const isProtectedRoute = createRouteMatcher([
  "/account-verification(.*)",
  "/admin/users(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // ✅ Bypass Clerk authentication for webhooks
  if (isWebhookRoute(request)) {
    console.log("[Middleware] Bypassing Clerk authentication for webhook route.");
    return NextResponse.next();
  }

  const { sessionId, userId, getToken, sessionClaims } = await auth();

  // ✅ Redirect non-authenticated users trying to access protected routes
  if (isProtectedRoute(request) && !sessionId) {
    console.warn("[Middleware] Unauthorized access. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ Redirect non-admin users trying to access admin routes
  const userRole = sessionClaims?.metadata?.role;
  if (isAdminRoute(request) && userRole !== "admin") {
    console.warn("[Middleware] Unauthorized admin access attempt. Redirecting.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ If authenticated, verify user verification step
  if (sessionId) {
    try {
      console.log("[Middleware] Fetching user details from Clerk API...");

      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        console.error("[Middleware Error] Missing CLERK_SECRET_KEY.");
        return NextResponse.redirect(new URL("/error", request.url));
      }

      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      });

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

      console.log("[Middleware] Verifying user verification step...");

      const userToken = await getToken();
      if (!userToken) {
        console.error("[Middleware Error] Missing Clerk session token.");
        return NextResponse.redirect(new URL("/error", request.url));
      }

      const verificationApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`;
      if (!process.env.NEXT_PUBLIC_BASE_URL) {
        console.error("[Middleware Error] Missing NEXT_PUBLIC_BASE_URL.");
        return NextResponse.redirect(new URL("/error", request.url));
      }

      console.log("[Middleware] Calling Verification API:", verificationApiUrl);

      const verificationResponse = await fetch(verificationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      if (!verificationResponse.ok) {
        console.error(`[Middleware Error] Verification API request failed. Status: ${verificationResponse.status}`);
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      const verificationResult = await verificationResponse.json();
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
