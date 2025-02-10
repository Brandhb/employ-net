import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// ✅ Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { sessionId, userId } = await auth();

  console.log("[Middleware Debug] sessionId:", sessionId, "userId:", userId);

  if (userId) {
    request.headers.set("x-user-id", userId);
  }

  // ✅ Redirect unauthenticated users to sign-in if accessing protected routes
  if (!isPublicRoute(request) && !sessionId) {
    console.warn("[Middleware] Unauthorized access. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ If authenticated, fetch user email and verify the `verificationStep`
  if (!isPublicRoute(request) && sessionId) {
    try {
      console.log("[Middleware] Fetching user details from Clerk API...");

      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        console.error("[Middleware Error] Missing CLERK_SECRET_KEY.");
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ✅ Fetch user details using Clerk API
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      });

      const contentType = clerkResponse.headers.get("content-type") || "";
      if (!clerkResponse.ok || !contentType.includes("application/json")) {
        console.error("[Middleware Error] Clerk API response is not JSON. Status:", clerkResponse.status);
        console.error("[Middleware Error] Full response:", await clerkResponse.text());
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ✅ Parse Clerk user data
      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses?.[0]?.email_address;

      if (!userEmail) {
        console.error("[Middleware Error] User email not found.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      console.log("[Middleware] Checking user verification step...");

      // ✅ Call verification API
      const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      const verificationContentType = verificationResponse.headers.get("content-type") || "";
      if (!verificationResponse.ok || !verificationContentType.includes("application/json")) {
        console.error("[Middleware Error] Verification API response is not valid JSON. Status:", verificationResponse.status);
        console.error("[Middleware Error] Full response:", await verificationResponse.text());
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ✅ Parse verification response
      const verificationResult = await verificationResponse.json();
      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("[Middleware] User not verified. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }
    } catch (error) {
      console.error("[Middleware Error] Unexpected error:", error);
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  return NextResponse.next();
});

// ✅ Middleware should run on protected routes only
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
