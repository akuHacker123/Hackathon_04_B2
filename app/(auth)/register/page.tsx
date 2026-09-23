import Link from "next/link";

import { registerAction } from "../actions";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <section className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Buat akun</h1>
        <p className="mt-1 text-sm text-zinc-600">Mulai mencatat keuangan pribadi Anda.</p>
        <RegisterForm action={registerAction} />
        <p className="mt-5 text-center text-sm text-zinc-600">Sudah punya akun? <Link href="/login" className="font-medium text-zinc-900 underline">Masuk</Link></p>
      </section>
    </main>
  );
}
