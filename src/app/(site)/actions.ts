"use server";

import { prisma } from "@/lib/db";
import { notify, leadAckBody } from "@/lib/whatsapp";

const INTERESTS = [
  "CONSULTATION",
  "YOGA",
  "OFFLINE_SESSION",
  "PRODUCT",
  "GENERAL",
] as const;
type Interest = (typeof INTERESTS)[number];

export type LeadState = { ok: boolean; message: string } | null;

/**
 * Captures a website enquiry (booking/contact pop-up, product enquiry) as a
 * Lead. Leads surface in the MIS for front-desk follow-up.
 * TODO (Phase 7): notify front-desk via WhatsApp/email once a provider is set up.
 */
export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const interestRaw = String(formData.get("interest") ?? "GENERAL");

  if (!name || !phone) {
    return { ok: false, message: "Please share your name and phone number." };
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return { ok: false, message: "Please enter a valid phone number." };
  }

  const interest: Interest = (INTERESTS as readonly string[]).includes(
    interestRaw,
  )
    ? (interestRaw as Interest)
    : "GENERAL";

  try {
    await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        message: message || null,
        interest,
        source: "landing",
      },
    });
    await notify({
      to: phone,
      type: "LEAD_ACK",
      templateName: "lead_ack",
      body: leadAckBody({ name }),
    });
    return {
      ok: true,
      message:
        "Thank you — we've received your enquiry and will be in touch shortly.",
    };
  } catch (err) {
    console.error("Lead submission failed (is DATABASE_URL set?):", err);
    return {
      ok: false,
      message:
        "Sorry, something went wrong. Please try again, or reach us on WhatsApp.",
    };
  }
}
