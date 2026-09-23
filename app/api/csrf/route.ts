import { NextResponse } from "next/server";

import { createCsrfToken, CSRF_COOKIE_NAME } from "@/lib/auth/csrf";

export async function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({ token });

  // This token must be readable by the form so it deliberately is not
  // HttpOnly. Its matching cookie is verified on every credential mutation.
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
