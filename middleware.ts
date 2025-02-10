import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs"; // ✅ Import Clerk Client

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Redirect if user is not signed in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // Fetch user data to get publicMetadata
  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const userRole = user?.publicMetadata?.role;

      // Restrict `/dashboard/*` access to only users with "admin" role
      if (isProtectedRoute(req) && userRole !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      return NextResponse.redirect(new URL("/sign-in", req.url)); // Redirect to sign-in on error
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
