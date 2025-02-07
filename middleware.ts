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
    console.warn("Unauthorized access attempt detected, redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If authenticated, fetch user email and verify the `verificationStep`
  if (!isPublicRoute(request) && sessionId) {
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        throw new Error("CLERK_SECRET_KEY is missing in environment variables.");
      }

      // Fetch user details using Clerk API
      console.log("Fetching user details from Clerk API...");
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!clerkResponse.ok) {
        console.error(`Clerk API request failed with status: ${clerkResponse.status}`);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses?.[0]?.email_address;

      if (!userEmail) {
        console.error("User email not found. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      // Call API route to check verification step
      console.log("Verifying user verification step...");
      const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      if (!verificationResponse.ok) {
        console.error(`Verification API request failed with status: ${verificationResponse.status}`);
        return NextResponse.redirect(new URL("/error", request.url));
      }

      const verificationResult = await verificationResponse.json();

      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("User verification incomplete. Redirecting...");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }
    } catch (error) {
      console.error("Middleware Error:", (error as Error)?.message || "Unknown error");
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
