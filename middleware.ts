import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// Match routes for different access control
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/clerk(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  //debugger;
  console.log(`🔍 Request received: ${req.method} ${req.nextUrl.pathname}`);

  const { userId, redirectToSignIn } = await auth();
  console.log(`🔑 Authenticated user ID: ${userId || "None"}`);

  // Allow Webhook Requests But Log if Signature is Missing
  if (isWebhookRoute(req)) {
    console.log("📩 Incoming webhook request...");

    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.warn("❌ Missing Clerk Webhook Secret");
      return new NextResponse("Error: Missing Webhook Secret", { status: 500 });
    }

    console.log("✅ Clerk Webhook Secret is set");
    return NextResponse.next();
  }

  // **Protect /dashboard routes & Redirect Admins**
  if (isDashboardRoute(req)) {
    console.log("🔒 Accessing protected dashboard:", req.nextUrl.pathname);

    if (!userId) {
      console.warn("❌ User is not authenticated, redirecting to sign-in");
      return redirectToSignIn();
    }

    try {
      console.log(`📡 Fetching user metadata for user: ${userId}`);
      const { users } = await clerkClient();
      const user = await users.getUser(userId);
      const userRole = user?.publicMetadata?.role;
      console.log(`🎭 User role: ${userRole || "None"}`);

      /*if (userRole === "admin") {
        console.warn("🔀 Admin user detected, redirecting to /admin");
        return NextResponse.redirect(new URL("/admin", req.url));
      }*/

      console.log("✅ User is authenticated, granting dashboard access");
      return NextResponse.next();
    } catch (error) {
      console.error("❌ Error fetching user metadata:", error);
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // **Protect /admin routes** → Requires authentication & "admin" role
  if (isAdminRoute(req)) {
    console.log("🔒 Accessing protected admin route:", req.nextUrl.pathname);

    if (!userId) {
      console.warn("❌ User is not authenticated, redirecting to sign-in");
      return redirectToSignIn();
    }

    try {
      console.log(`📡 Fetching user metadata for user: ${userId}`);
      const { users } = await clerkClient();
      const user = await users.getUser(userId);
      const userRole = user?.publicMetadata?.role;
      console.log(`🎭 User role: ${userRole || "None"}`);

      if (userRole !== "admin") {
        console.warn("❌ User is not an admin, redirecting to /unauthorized");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      console.log("✅ User is authorized to access admin panel");
      return NextResponse.next();
    } catch (error) {
      console.error("❌ Error fetching user metadata:", error);
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/webhooks/clerk|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
