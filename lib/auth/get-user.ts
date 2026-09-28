import { cookies } from "next/headers";

import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/** Returns the authenticated user for the current request, or fallback for local dev. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    const sessionUser = await getSessionUser(sessionToken);
    if (sessionUser) return sessionUser;
  }

  if (process.env.NODE_ENV !== 'production' && process.env.DEV_MOCK_USER_ID) {
    return {
      id: process.env.DEV_MOCK_USER_ID,
      name: 'Agil (Mock Dev User)',
      email: 'agil@example.com',
    };
  }

  return null;
}
