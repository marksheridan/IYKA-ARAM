"use server";

import { headers } from "next/headers";
import { sendMail, enquiryMail } from "@/lib/mail";
import {
  checkEnquiryLimits,
  HONEYPOT_FIELD,
  MIN_FILL_MS,
} from "@/lib/rate-limit";

const INTERESTS = [
  "CONSULTATION",
  "YOGA",
  "OFFLINE_SESSION",
  "PRODUCT",
  "GENERAL",
] as const;
type Interest = (typeof INTERESTS)[number];

export type LeadState = { ok: boolean; message: string } | null;

const SUCCESS =
  "Thank you — we've received your enquiry and will be in touch shortly.";

/** Cap every free-text field so a bot can't post a novel into the inbox. */
function clamp(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  // x-forwarded-for is a client→proxy chain; the first entry is the caller.
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Handles a website enquiry — the Phase 1 booking. No database: the form is
 * validated, screened for abuse, and emailed straight to the front desk, so the
 * enquiry path has no dependency on Postgres being up.
 *
 * Phase 7 adds a WhatsApp acknowledgement to the enquirer alongside this email.
 */
export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  // 1. Honeypot. Hidden from people, irresistible to bots. Answer with the
  //    success message so the bot has nothing to learn from a retry.
  if (clamp(formData.get(HONEYPOT_FIELD), 100)) {
    return { ok: true, message: SUCCESS };
  }

  // 2. Timing floor. The form stamps its render time; a script posts instantly.
  const renderedAt = Number(formData.get("rendered_at"));
  if (Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_FILL_MS) {
    return { ok: true, message: SUCCESS };
  }

  const name = clamp(formData.get("name"), 100);
  const phone = clamp(formData.get("phone"), 25);
  const email = clamp(formData.get("email"), 150);
  const message = clamp(formData.get("message"), 2000);
  const interestRaw = clamp(formData.get("interest"), 30);

  if (!name || !phone) {
    return { ok: false, message: "Please share your name and phone number." };
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return { ok: false, message: "Please enter a valid phone number." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const interest: Interest = (INTERESTS as readonly string[]).includes(
    interestRaw,
  )
    ? (interestRaw as Interest)
    : "GENERAL";

  // 3. Rate limits, keyed on the normalised phone so formatting can't evade them.
  const verdict = checkEnquiryLimits({ ip: await clientIp(), phone: digits });
  if (!verdict.ok) {
    return { ok: false, message: verdict.reason };
  }

  try {
    const { subject, text } = enquiryMail({
      name,
      phone,
      email: email || undefined,
      message: message || undefined,
      interest,
      source: clamp(formData.get("source"), 40) || "website",
    });
    await sendMail({ subject, text, replyTo: email });
    return { ok: true, message: SUCCESS };
  } catch (err) {
    // With no database behind this, a failed send means the enquiry is lost —
    // so say so plainly and point at a channel that still works.
    console.error("Enquiry email failed:", err);
    return {
      ok: false,
      message:
        "Sorry, we couldn't send your enquiry. Please call or WhatsApp us on +91 60096 96208.",
    };
  }
}
