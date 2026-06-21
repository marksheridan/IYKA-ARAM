"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm rounded-2xl border border-sand bg-white p-8 shadow-sm">
        <div className="text-center font-display text-2xl text-forest">
          IYKA<span className="text-gold">-</span>ARAM
        </div>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.25em] text-muted">
          Staff Login
        </p>

        <form action={action} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-ink disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
