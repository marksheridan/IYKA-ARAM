"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mis-bg">
      <div className="w-full max-w-sm rounded-2xl border border-mis-border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-mis-text-soft">IYKA-ARAM</p>
          <h1 className="mt-1 text-2xl font-semibold text-mis-text">Admin</h1>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-mis-text">Password</label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-mis-border px-3.5 py-2.5 text-sm outline-none focus:border-mis-blue focus:ring-1 focus:ring-mis-blue"
              placeholder="Enter admin password"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-mis-danger-bg px-3 py-2 text-sm text-mis-danger">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-mis-blue py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
