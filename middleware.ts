import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { sessionId, userId, getToken } = await auth();

  if (userId) {
    request.headers.set("x-user-id", userId);
  }

  if (!isPublicRoute(request) && !sessionId) {
    console.warn("[Middleware] Unauthorized access attempt. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!isPublicRoute(request) && sessionId) {
    try {
      console.log("[Middleware] Fetching user details from Clerk API...");

      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        console.error("[Middleware Error] Missing CLERK_SECRET_KEY.");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!clerkResponse.ok) {
        console.error(`[Middleware Error] Clerk API request failed. Status: ${clerkResponse.status}`);
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
      }

      const user = await clerkResponse.json();
      const userEmail = user?.email_addresses?.[0]?.email_address;
      if (!userEmail) {
        console.error("[Middleware Error] User email not found.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }

      console.log("[Middleware] Verifying user verification step...");

      // Fetch the Clerk session token
      const userToken = await getToken();
      if (!userToken) {
        console.error("[Middleware Error] Missing Clerk session token.");
        return NextResponse.json({ error: "Authentication error" }, { status: 401 });
      }

      const verificationApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verification-step`;
      if (!process.env.NEXT_PUBLIC_BASE_URL) {
        console.error("[Middleware Error] Missing NEXT_PUBLIC_BASE_URL.");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
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
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
      }

      const verificationResult = await verificationResponse.json();
      if (!verificationResult || verificationResult.verificationStep !== 1) {
        console.warn("[Middleware] User not verified. Redirecting to verification page.");
        return NextResponse.redirect(new URL("/account-verification", request.url));
      }
    } catch (error) {
      console.error("[Middleware Error] Unexpected error:", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
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