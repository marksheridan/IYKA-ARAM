"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const FINANCE_ROLES = ["ADMIN", "FRONT_DESK"] as const;
const round2 = (n: number) => Math.round(n * 100) / 100;

export async function createExpense(formData: FormData) {
  const user = await requireUser([...FINANCE_ROLES]);
  const categoryId = String(formData.get("categoryId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const dateStr = String(formData.get("date") ?? "");
  const vendor = String(formData.get("vendor") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!categoryId || !(amount > 0)) return;

  await prisma.expense.create({
    data: {
      categoryId,
      amount: round2(amount),
      date: dateStr ? new Date(`${dateStr}T00:00:00`) : new Date(),
      vendor: vendor || null,
      description: description || null,
      recordedById: user.id,
    },
  });
  revalidatePath("/mis/finance");
}

export async function createPayout(formData: FormData) {
  await requireUser([...FINANCE_ROLES]);
  const providerId = String(formData.get("providerId") ?? "");
  const periodStart = String(formData.get("periodStart") ?? "");
  const periodEnd = String(formData.get("periodEnd") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  if (!providerId || !periodStart || !periodEnd || !(amount > 0)) return;

  await prisma.payout.create({
    data: {
      providerId,
      periodStart: new Date(`${periodStart}T00:00:00`),
      periodEnd: new Date(`${periodEnd}T00:00:00`),
      amount: round2(amount),
      status: "PENDING",
    },
  });
  revalidatePath("/mis/finance");
}

export async function markPayoutPaid(formData: FormData) {
  await requireUser([...FINANCE_ROLES]);
  const id = String(formData.get("payoutId") ?? "");
  if (!id) return;
  await prisma.payout.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/mis/finance");
}
