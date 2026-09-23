import { randomBytes, timingSafeEqual } from "crypto";

export const CSRF_COOKIE_NAME = "expense_tracker_csrf";

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isValidCsrfToken(submittedToken: string, cookieToken: string | undefined): boolean {
  if (!cookieToken) return false;

  const submitted = Buffer.from(submittedToken);
  const stored = Buffer.from(cookieToken);

  return submitted.length === stored.length && timingSafeEqual(submitted, stored);
}
