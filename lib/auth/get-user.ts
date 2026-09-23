import { cookies } from "next/headers";

import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// Kontrak Bersama (Shared Contract) Autentikasi
// Selama masa pengembangan lokal belum rampung oleh Abhi:
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Abhi akan mengganti ini dengan pengecekan sesi DB + cookies aktual.
  // Fallback mock user untuk kebutuhan pengembangan mandiri:
  if (process.env.NODE_ENV !== 'production') {
    return {
      id: process.env.DEV_MOCK_USER_ID || '00000000-0000-0000-0000-000000000001',
      name: 'Agil (Mock Dev User)',
      email: 'agil@example.com',
    };
  }
  return null;
}
