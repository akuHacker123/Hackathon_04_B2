"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { CSRF_COOKIE_NAME, isValidCsrfToken } from "@/lib/auth/csrf";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getRequestSecurityError(formData: FormData): Promise<string | null> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  // Server Actions already enforce origin checks; this explicit guard also
  // protects these credential-changing mutations if their transport changes.
  if (!origin || !host || new URL(origin).host !== host) {
    return "Permintaan tidak dapat diverifikasi. Silakan muat ulang halaman.";
  }

  const submittedToken = value(formData, "csrfToken");
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!isValidCsrfToken(submittedToken, cookieToken)) {
    return "Sesi formulir telah kedaluwarsa. Silakan muat ulang halaman.";
  }

  return null;
}

function value(formData: FormData, field: string): string {
  const formValue = formData.get(field);
  return typeof formValue === "string" ? formValue : "";
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const securityError = await getRequestSecurityError(formData);
  if (securityError) return { error: securityError };

  const name = value(formData, "name").trim();
  const email = value(formData, "email").trim().toLowerCase();
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!name) fieldErrors.name = "Nama wajib diisi.";
  else if (name.length > 255) fieldErrors.name = "Nama maksimal 255 karakter.";
  if (!emailPattern.test(email) || email.length > 255) fieldErrors.email = "Masukkan alamat email yang valid.";
  if (password.length < 8) fieldErrors.password = "Password minimal 8 karakter.";
  if (password !== confirmPassword) fieldErrors.confirmPassword = "Konfirmasi password harus sama.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) return { fieldErrors: { email: "Email ini sudah terdaftar." } };

  try {
    const passwordHash = await hashPassword(password);
    await prisma.user.create({ data: { name, email, password: passwordHash } });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { fieldErrors: { email: "Email ini sudah terdaftar." } };
    }
    return { error: "Pendaftaran gagal. Silakan coba kembali." };
  }

  redirect("/login?registered=1");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const securityError = await getRequestSecurityError(formData);
  if (securityError) return { error: securityError };

  const email = value(formData, "email").trim().toLowerCase();
  const password = value(formData, "password");
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!email) fieldErrors.email = "Email wajib diisi.";
  if (!password) fieldErrors.password = "Password wajib diisi.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Email atau password tidak valid." };
  }

  const sessionToken = await createSession(user.id);
  await setSessionCookie(sessionToken);
  redirect("/dashboard");
}
