import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define expected metadata structure for role-based access control
interface PublicMetadata {
  role?: string;
}

interface SessionClaims {
  publicMetadata?: PublicMetadata;
}

// ✅ Define protected routes
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// ✅ Define admin-only routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  console.log("[Middleware Debug] Checking authentication...");

  // ✅ Await auth() since it's a Promise
  const { sessionId, userId, sessionClaims } = await auth();

  console.log("[Middleware Debug] sessionId:", sessionId, "userId:", userId);

  // ✅ Redirect unauthenticated users to sign-in if accessing protected routes
  if (isProtectedRoute(req) && !sessionId) {
    console.warn("[Middleware] Unauthorized access. Redirecting to sign-in.");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // ✅ Role-based access control for admin routes
  const userRole = (sessionClaims as SessionClaims)?.publicMetadata?.role;
  console.log("[Middleware Debug] User role:", userRole);

  if (isAdminRoute(req) && userRole !== "admin") {
    console.warn("[Middleware] Unauthorized admin access. Redirecting...");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

// ✅ Ensure middleware runs on necessary routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};
