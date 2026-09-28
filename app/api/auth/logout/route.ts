import { NextRequest, NextResponse } from "next/server";

import { isSameOriginRequest } from "@/lib/auth/csrf";
import {
  deleteSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!isSameOriginRequest(origin, host)) {
    return NextResponse.json(
      { error: "Permintaan tidak dapat diverifikasi." },
      { status: 403 },
    );
  }

  await deleteSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
