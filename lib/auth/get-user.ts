import { cookies } from "next/headers";

import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/** Returns the authenticated user for the current request, or null for guests. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  return getSessionUser(sessionToken);
}
