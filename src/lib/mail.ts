import nodemailer from "nodemailer";
import { business } from "@/content/site";

/**
 * Front-desk email notifications.
 *
 * Phase 1 has no database in the enquiry path — the email IS the record. So
 * this module is deliberately dependency-free apart from SMTP: an enquiry that
 * reaches the inbox is a booking the clinic can act on.
 *
 * Credentials are a Gmail App Password on the clinic's own mailbox, so the mail
 * is sent from and delivered to the same address. Unconfigured, it logs to the
 * server console instead of throwing — the same simulated mode whatsapp.ts uses,
 * so the site works end-to-end before the credentials exist.
 */
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_TO = process.env.MAIL_TO ?? business.email;

export function isMailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function transport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export type MailResult = { ok: boolean; simulated?: boolean };

export async function sendMail(args: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<MailResult> {
  if (!isMailConfigured()) {
    console.log(
      `[mail:simulated] → ${MAIL_TO}\nSubject: ${args.subject}\n\n${args.text}`,
    );
    return { ok: true, simulated: true };
  }

  await transport().sendMail({
    from: `"${business.shortName} Website" <${SMTP_USER}>`,
    to: MAIL_TO,
    subject: args.subject,
    text: args.text,
    // So the front desk can hit Reply and reach the enquirer directly, when
    // they left an address. Without one, replies go back to the clinic.
    replyTo: args.replyTo || undefined,
  });
  return { ok: true };
}

const INTEREST_LABELS: Record<string, string> = {
  CONSULTATION: "Functional Medicine Consultation",
  OFFLINE_SESSION: "Offline Session at the Centre",
  YOGA: "Online Yoga Class",
  PRODUCT: "Wellness Products",
  GENERAL: "General Enquiry",
};

/** Plain-text body for a website enquiry. Readable on a phone, no HTML needed. */
export function enquiryMail(lead: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  interest: string;
  source: string;
}) {
  const label = INTEREST_LABELS[lead.interest] ?? lead.interest;
  const when = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const lines = [
    `${lead.name} would like to book: ${label}`,
    "",
    `Name:      ${lead.name}`,
    `Phone:     ${lead.phone}`,
    `WhatsApp:  https://wa.me/${lead.phone.replace(/\D/g, "")}`,
    lead.email ? `Email:     ${lead.email}` : null,
    `Interest:  ${label}`,
    lead.message ? `\nMessage:\n${lead.message}` : null,
    "",
    `Received:  ${when} IST`,
    `Source:    ${lead.source}`,
    "",
    "— Sent automatically by the IYKA-ARAM website.",
  ].filter(Boolean);

  return {
    subject: `New enquiry: ${label} — ${lead.name}`,
    text: lines.join("\n"),
  };
}
