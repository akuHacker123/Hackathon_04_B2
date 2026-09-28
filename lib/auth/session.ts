import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "expense_tracker_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = randomBytes(32).toString("hex");
  const storedToken = hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Replacing existing sessions on login gives every authentication a fresh ID
  // and limits the impact of a token that may have been compromised.
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    prisma.session.create({
      data: { userId, sessionToken: storedToken, expiresAt },
    }),
  ]);

  return sessionToken;
}

export async function getSessionUser(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: hashSessionToken(sessionToken) },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function deleteSession(sessionToken: string | undefined): Promise<void> {
  if (!sessionToken) return;

  await prisma.session.deleteMany({
    where: { sessionToken: hashSessionToken(sessionToken) },
  });
}

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Server Action for a POST logout form. */
export async function logout(): Promise<never> {
  "use server";

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  await deleteSession(sessionToken);

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
