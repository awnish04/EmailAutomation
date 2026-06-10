import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Routes that require the user to be signed in
const isProtectedRoute = createRouteMatcher(["/user-dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Redirect unauthenticated users to /login
    await auth.protect({
      unauthenticatedUrl: new URL("/login", req.url).toString(),
    })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
