import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/books(.*)",
  "/api/upload(.*)",
  "/api/log(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Public admin portal login route - bypass all checks
  if (req.nextUrl.pathname.startsWith("/admin-login")) {
    return;
  }

  // Handle /admin routes
  if (isAdminRoute(req)) {
    // 1. Direct access if custom admin cookie is active
    const adminSession = req.cookies.get("admin_session")?.value;
    if (adminSession === "authenticated") {
      return;
    }

    // 2. Otherwise check Clerk session
    const { userId } = await auth();
    if (!userId) {
      // Direct unauthenticated users to the dedicated admin login
      const loginUrl = new URL("/admin-login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
