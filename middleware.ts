import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { sessionId, userId } = await auth();

  if (userId) {
    request.headers.set("x-user-id", userId);
  }

  // Redirect unauthenticated users to sign-in if accessing protected routes
  if (!isPublicRoute(request) && !sessionId) {
    console.warn("[Middleware] Unauthorized access attempt detected. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If authenticated, fetch user email and verify the `verificationStep`
  if (!isPublicRoute(request) && sessionId) {
    try {
      console.log("[Middleware] Fetching user details from Clerk API...");

      // Ensure we have a valid Clerk Secret Key
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        console.error("[Middleware Error] Missing CLERK_SECRET_KEY environment variable.");
        return NextResponse.redirect(new URL("/error", request.url));
      }

      // Fetch user details from Clerk API
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      const clerkTextResponse = await clerkResponse.text(); // Read raw response
      console.log("[Middleware] Clerk API Raw Response:", clerkTextResponse);

      if (!clerkResponse.ok) {
        console.error(`[Middleware Error] Clerk API request failed. Status: ${clerkResponse.status}`);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      let user;
      try {
        user = JSON.parse(clerkTextResponse); // Parse JSON safely
      } catch (error) {
        console.error("[Middleware Error] Clerk API returned invalid JSON:", clerkTextResponse);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      const userEmail = user?.email_addresses?.[0]?.email_address;
      if (!userEmail) {
        console.error("[Middleware Error] User email not found.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      console.log("[Middleware] Verifying user verification step...");

      // Check if `NEXT_PUBLIC_BASE_URL` is set correctly
      const verificationApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`;
      if (!process.env.NEXT_PUBLIC_BASE_URL) {
        console.error("[Middleware Error] Missing NEXT_PUBLIC_BASE_URL environment variable.");
        return NextResponse.redirect(new URL("/error", request.url));
      }

      console.log("[Middleware] Verification API URL:", verificationApiUrl);

      // Call verification step API
      const verificationResponse = await fetch(verificationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      const verificationTextResponse = await verificationResponse.text();
      console.log("[Middleware] Verification API Raw Response:", verificationTextResponse);

      if (!verificationResponse.ok) {
        console.error(`[Middleware Error] Verification API request failed. Status: ${verificationResponse.status}`);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      let verificationResult;
      try {
        verificationResult = JSON.parse(verificationTextResponse);
      } catch (error) {
        console.error("[Middleware Error] Verification API returned invalid JSON:", verificationTextResponse);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      // If user has not completed verification, redirect them
      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("[Middleware] User not verified. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

    } catch (error) {
      console.error("[Middleware Error] Unexpected error occurred:", error);
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
