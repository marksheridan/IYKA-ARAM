"use client";

import { useActionState, useEffect } from "react";
import { submitLead, type LeadState } from "@/app/(site)/actions";

const INTERESTS = [
  { value: "CONSULTATION", label: "Functional Medicine Consultation" },
  { value: "OFFLINE_SESSION", label: "Offline Session at the Centre" },
  { value: "YOGA", label: "Online Yoga Class" },
  { value: "PRODUCT", label: "Wellness Products" },
  { value: "GENERAL", label: "General Enquiry" },
];

export function BookingModal({
  open,
  onClose,
  defaultInterest = "GENERAL",
}: {
  open: boolean;
  onClose: () => void;
  defaultInterest?: string;
}) {
  const [state, formAction, isPending] = useActionState<LeadState, FormData>(
    submitLead,
    null,
  );

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Booking and enquiry"
    >
      <div
        className="animate-fade-in-up w-full max-w-lg rounded-t-2xl bg-cream p-6 shadow-2xl sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">
              Wellness Starts Here
            </p>
            <h2 className="mt-1 font-display text-2xl text-forest">
              Book &amp; Enquire
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
          >
            ✕
          </button>
        </div>

        {state?.ok ? (
          <div className="mt-6 rounded-xl border border-sage/40 bg-white p-6 text-center">
            <p className="font-display text-lg text-forest">Enquiry received</p>
            <p className="mt-2 text-sm text-muted">{state.message}</p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-ink"
            >
              Close
            </button>
          </div>
        ) : (
          <form action={formAction} className="mt-5 space-y-4">
            <Field label="Full name" name="name" required placeholder="Your name" />
            <Field
              label="Phone (WhatsApp)"
              name="phone"
              type="tel"
              required
              placeholder="+91 …"
            />
            <Field
              label="Email (optional)"
              name="email"
              type="email"
              placeholder="you@example.com"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                I'm interested in
              </label>
              <select
                name="interest"
                defaultValue={defaultInterest}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
              >
                {INTERESTS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Message (optional)
              </label>
              <textarea
                name="message"
                rows={3}
                placeholder="Tell us how we can help…"
                className="w-full resize-none rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
              />
            </div>

            {state && !state.ok && (
              <p className="text-sm text-red-700">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-forest hover:text-cream disabled:opacity-60"
            >
              {isPending ? "Sending…" : "Send enquiry"}
            </button>
            <p className="text-center text-xs text-muted">
              By submitting, you agree to be contacted about your enquiry.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}
