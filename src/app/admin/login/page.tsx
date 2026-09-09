"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mis-bg" style={{ fontFamily: "var(--font-dmsans), system-ui, sans-serif" }}>
      <div className="animate-fade-in-up w-full max-w-sm rounded-2xl border border-mis-border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="admin-eyebrow">IYKA-ARAM</p>
          <h1 className="admin-display mt-1 text-3xl text-mis-text">Living Store</h1>
          <span className="mx-auto mt-3 block h-px w-8 bg-gold" />
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
