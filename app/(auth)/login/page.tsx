import Link from "next/link";

import { loginAction } from "../actions";
import { LoginForm } from "./LoginForm";

type LoginPageProps = { searchParams: Promise<{ registered?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { registered } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <section className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Masuk</h1>
        <p className="mt-1 text-sm text-zinc-600">Masuk untuk mengelola catatan keuangan Anda.</p>
        {registered === "1" && <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">Akun berhasil dibuat. Silakan masuk.</p>}
        <LoginForm action={loginAction} />
        <p className="mt-5 text-center text-sm text-zinc-600">Belum punya akun? <Link href="/register" className="font-medium text-zinc-900 underline">Daftar</Link></p>
      </section>
    </main>
  );
}
