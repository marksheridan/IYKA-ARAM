import { prisma } from "@/lib/db";
import type { MessageType } from "@/generated/prisma/client";
import { dateTime, inr } from "@/lib/format";

/** True once a WhatsApp Business provider is configured via env. */
export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

type NotifyArgs = {
  to: string; // recipient phone (E.164)
  type: MessageType;
  body: string;
  templateName?: string;
  patientId?: string;
  appointmentId?: string;
  invoiceId?: string;
};

/**
 * Sends a WhatsApp message and records it to MessageLog. When no provider is
 * configured it runs in SIMULATED mode (logs + stores QUEUED) so the rest of
 * the app works end-to-end before Meta approval. Never throws.
 */
export async function notify(args: NotifyArgs) {
  let log;
  try {
    log = await prisma.messageLog.create({
      data: {
        channel: "WHATSAPP",
        type: args.type,
        recipient: args.to,
        templateName: args.templateName ?? null,
        payload: { body: args.body },
        status: "QUEUED",
        relatedPatientId: args.patientId ?? null,
        relatedAppointmentId: args.appointmentId ?? null,
        relatedInvoiceId: args.invoiceId ?? null,
      },
    });
  } catch (err) {
    console.error("notify: failed to record MessageLog", err);
    return;
  }

  if (!isWhatsAppConfigured()) {
    console.log(`[whatsapp:simulated] → ${args.to}: ${args.body}`);
    return;
  }

  try {
    const base =
      process.env.WHATSAPP_API_BASE ?? "https://graph.facebook.com/v21.0";
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const res = await fetch(`${base}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: args.to.replace(/\D/g, ""),
        type: "text",
        text: { body: args.body },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      messages?: { id: string }[];
    };
    if (!res.ok) throw new Error(JSON.stringify(data));
    await prisma.messageLog.update({
      where: { id: log.id },
      data: { status: "SENT", providerMessageId: data?.messages?.[0]?.id ?? null },
    });
  } catch (err) {
    await prisma.messageLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: String(err).slice(0, 500) },
    });
  }
}

// ── Message composers ──────────────────────────────────────────
const SIGN = "— IYKA-ARAM Wellness";

export function bookingConfirmationBody(opts: {
  name: string;
  service: string;
  when: Date;
}) {
  return `Hi ${opts.name}! Your ${opts.service} at IYKA-ARAM is confirmed for ${dateTime(
    opts.when,
  )}. We look forward to welcoming you. ${SIGN}`;
}

export function classConfirmationBody(opts: {
  name: string;
  title: string;
  when: Date;
  link?: string | null;
}) {
  const join = opts.link ? ` Join here: ${opts.link}` : "";
  return `Hi ${opts.name}! You're booked for "${opts.title}" on ${dateTime(
    opts.when,
  )}.${join} ${SIGN}`;
}

export function receiptBody(opts: {
  name: string;
  number: string;
  amount: number | string | { toString(): string };
}) {
  return `Hi ${opts.name}, we've received your payment of ${inr(
    opts.amount,
  )} (Invoice ${opts.number}). Thank you. ${SIGN}`;
}

export function leadAckBody(opts: { name: string }) {
  return `Hi ${opts.name}, thank you for reaching out to IYKA-ARAM Wellness. Our team will be in touch shortly. ${SIGN}`;
}
