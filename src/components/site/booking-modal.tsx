"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
            <InterestSelect defaultValue={defaultInterest} />

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

function InterestSelect({ defaultValue }: { defaultValue: string }) {
  const initial = INTERESTS.find((i) => i.value === defaultValue) ?? INTERESTS[0];
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">
        I&apos;m interested in
      </label>
      <div ref={ref} className="relative">
        {/* Hidden input so FormData picks up the value */}
        <input type="hidden" name="interest" value={selected.value} />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink transition-colors hover:border-gold focus:outline-none focus:border-gold"
        >
          <span>{selected.label}</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gold flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-sand bg-white shadow-xl"
          >
            {INTERESTS.map((item) => {
              const isActive = item.value === selected.value;
              return (
                <li
                  key={item.value}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { setSelected(item); setOpen(false); }}
                  className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors
                    ${isActive
                      ? "bg-gold/10 text-forest font-medium"
                      : "text-ink hover:bg-cream"
                    }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className="text-gold flex-shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
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
