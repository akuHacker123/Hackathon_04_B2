"use client";

import { useActionState, useEffect, useState } from "react";

import type { AuthActionState } from "../actions";

const initialState: AuthActionState = {};

type LoginFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/csrf", { credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((data: { token?: string } | null) => setCsrfToken(data?.token ?? null))
      .catch(() => setCsrfToken(null));
  }, []);

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <input type="hidden" name="csrfToken" value={csrfToken ?? ""} />
      {state.error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <label className="block text-sm font-medium text-zinc-700">
        Email
        <input name="email" type="email" autoComplete="email" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
        {state.fieldErrors?.email && <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.email}</span>}
      </label>
      <label className="block text-sm font-medium text-zinc-700">
        Password
        <input name="password" type="password" autoComplete="current-password" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
        {state.fieldErrors?.password && <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.password}</span>}
      </label>
      <button type="submit" disabled={isPending || !csrfToken} className="w-full rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60">
        {isPending ? "Memproses…" : csrfToken ? "Masuk" : "Menyiapkan formulir…"}
      </button>
    </form>
  );
}
