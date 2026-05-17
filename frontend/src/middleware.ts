// src/middleware.ts
// Protects all /dashboard routes — users must be signed in via Clerk
// Compatible with @clerk/nextjs v6 (async auth)

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // In Clerk v6, auth() is async — must be awaited
  if (isProtectedRoute(req)) {
    await auth.protect(); // Redirects to sign-in if not authenticated
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
