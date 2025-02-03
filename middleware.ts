import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  //debugger;
  const { sessionId, userId } = await auth();

  if (userId) {
    request.headers.set("x-user-id", userId);
  }

  // Redirect unauthenticated users to sign-in if accessing protected routes
  if (!isPublicRoute(request) && !sessionId) {
    const url = new URL(request.url);
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // If authenticated, fetch user email and verify the `verificationStep`
  if (!isPublicRoute(request) && sessionId) {
    try {
      // Fetch user details using Clerk's API and `user_id`
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
        },
      });

      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses[0]?.email_address;

      if (!userEmail) {
        console.error("User email not found");
        const url = new URL(request.url);
        url.pathname = "/account-verification";
        return NextResponse.redirect(url);
      }

      // Call API route to check verification step
      const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, fromMiddleware: true, userId }),
      });

      const verificationResult = await verificationResponse.json();

      if (!verificationResult && verificationResult.verificationStep !== 1) {
        const url = new URL(request.url);
        url.pathname = "/account-verification";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Verification check failed:", error);
      const url = new URL(request.url);
      url.pathname = "/404";
      return NextResponse.redirect(url);
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
