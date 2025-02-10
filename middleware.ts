import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the expected structure for publicMetadata
interface PublicMetadata {
  role?: string;
}

interface SessionClaims {
  publicMetadata?: PublicMetadata;
}

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  //debugger;
  // Protect normal protected routes
  if (isProtectedRoute(req)) await auth.protect();

  // Type casting sessionClaims to ensure we handle potential undefined values
  const { sessionClaims } = await auth();

  // Safely check if publicMetadata exists and contains the 'role' field
  const userRole = sessionClaims?.metadata?.role;

  if (isAdminRoute(req) && userRole !== "admin") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
