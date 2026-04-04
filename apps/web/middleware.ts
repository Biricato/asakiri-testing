import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Public paths — skip auth check
  if (
    path === "/" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up")
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ??
    req.cookies.get("__Secure-better-auth.session_token")?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  // For admin/create routes, fetch session to check role
  if (path.startsWith("/admin") || path.startsWith("/create")) {
    const sessionRes = await fetch(
      `${req.nextUrl.origin}/api/auth/get-session`,
      {
        headers: { cookie: req.headers.get("cookie") ?? "" },
      },
    )

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }

    const session = await sessionRes.json()

    if (path.startsWith("/admin") && session.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    if (
      path.startsWith("/create") &&
      !["admin", "creator"].includes(session.user?.role)
    ) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
