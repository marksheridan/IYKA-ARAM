"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { InvoiceStatus, PaymentMethod } from "@/generated/prisma/client";
import { notify, receiptBody } from "@/lib/whatsapp";

const BILLING_ROLES = ["ADMIN", "FRONT_DESK"] as const;
const METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"];

const round2 = (n: number) => Math.round(n * 100) / 100;

async function recomputeInvoice(invoiceId: string) {
  const items = await prisma.invoiceLineItem.findMany({ where: { invoiceId } });
  let subtotal = 0;
  let tax = 0;
  for (const it of items) {
    const amount = Number(it.amount);
    subtotal += amount;
    tax += amount * (Number(it.taxRate) / 100);
  }
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { discount: true },
  });
  const discount = Number(inv?.discount ?? 0);
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      subtotal: round2(subtotal),
      taxAmount: round2(tax),
      total: round2(subtotal + tax - discount),
    },
  });
}

async function nextInvoiceNumber() {
  const n = await prisma.invoice.count();
  return `INV-${String(n + 1).padStart(4, "0")}`;
}

export async function createInvoice(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const patientId = String(formData.get("patientId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const unitPrice = Number(formData.get("unitPrice") ?? 0);
  const taxRate = Number(formData.get("taxRate") ?? 0);
  if (!patientId || !description) redirect("/mis/billing?error=missing");

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      patientId,
      status: "DRAFT",
      lineItems: {
        create: [
          { description, quantity, unitPrice, taxRate, amount: round2(quantity * unitPrice) },
        ],
      },
    },
  });
  await recomputeInvoice(invoice.id);
  redirect(`/mis/billing/${invoice.id}`);
}

export async function createInvoiceFromAppointment(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true },
  });
  if (!appt) redirect("/mis/appointments");
  const price = Number(appt.service.price);
  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      patientId: appt.patientId,
      status: "DRAFT",
      lineItems: {
        create: [
          {
            description: appt.service.name,
            quantity: 1,
            unitPrice: price,
            taxRate: 0,
            amount: round2(price),
          },
        ],
      },
    },
  });
  await recomputeInvoice(invoice.id);
  redirect(`/mis/billing/${invoice.id}`);
}

export async function addLineItem(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const unitPrice = Number(formData.get("unitPrice") ?? 0);
  const taxRate = Number(formData.get("taxRate") ?? 0);
  if (!invoiceId || !description) return;
  await prisma.invoiceLineItem.create({
    data: { invoiceId, description, quantity, unitPrice, taxRate, amount: round2(quantity * unitPrice) },
  });
  await recomputeInvoice(invoiceId);
  revalidatePath(`/mis/billing/${invoiceId}`);
}

export async function removeLineItem(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const id = String(formData.get("lineItemId") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!id) return;
  await prisma.invoiceLineItem.delete({ where: { id } });
  if (invoiceId) {
    await recomputeInvoice(invoiceId);
    revalidatePath(`/mis/billing/${invoiceId}`);
  }
}

export async function issueInvoice(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) return;
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "ISSUED", issuedAt: new Date() },
  });
  revalidatePath(`/mis/billing/${invoiceId}`);
  revalidatePath("/mis/billing");
}

export async function recordPayment(formData: FormData) {
  const user = await requireUser([...BILLING_ROLES]);
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const methodRaw = String(formData.get("method") ?? "CASH");
  const reference = String(formData.get("reference") ?? "").trim();
  if (!invoiceId || !(amount > 0)) return;

  await prisma.payment.create({
    data: {
      invoiceId,
      amount: round2(amount),
      method: (METHODS.includes(methodRaw) ? methodRaw : "CASH") as PaymentMethod,
      reference: reference || null,
      recordedById: user.id,
    },
  });

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true, patient: true },
  });
  if (inv) {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const total = Number(inv.total);
    const status: InvoiceStatus =
      total > 0 && paid >= total ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : inv.status;
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status, issuedAt: inv.issuedAt ?? new Date() },
    });
    await notify({
      to: inv.patient.phone,
      type: "INVOICE_RECEIPT",
      templateName: "invoice_receipt",
      body: receiptBody({
        name: inv.patient.name,
        number: inv.number,
        amount: round2(amount),
      }),
      patientId: inv.patientId,
      invoiceId: inv.id,
    });
  }
  revalidatePath(`/mis/billing/${invoiceId}`);
  revalidatePath("/mis/billing");
  revalidatePath("/mis/finance");
}

export async function sendReceipt(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) return;
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { patient: true },
  });
  if (!inv) return;
  await notify({
    to: inv.patient.phone,
    type: "INVOICE_RECEIPT",
    templateName: "invoice_receipt",
    body: receiptBody({
      name: inv.patient.name,
      number: inv.number,
      amount: inv.total,
    }),
    patientId: inv.patientId,
    invoiceId: inv.id,
  });
  revalidatePath(`/mis/billing/${invoiceId}`);
}

export async function cancelInvoice(formData: FormData) {
  await requireUser([...BILLING_ROLES]);
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) return;
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "CANCELLED" },
  });
  revalidatePath(`/mis/billing/${invoiceId}`);
  revalidatePath("/mis/billing");
}
