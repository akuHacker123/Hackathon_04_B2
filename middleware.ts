import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/transactions"];
const authPaths = ["/login", "/register"];
// Middleware runs in a lightweight runtime. Keep this value local so it does
// not import the Prisma/Node.js session implementation into the edge bundle.
const SESSION_COOKIE_NAME = "expense_tracker_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPath = authPaths.includes(pathname);

  if (isProtectedPath && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/login", "/register"],
};
