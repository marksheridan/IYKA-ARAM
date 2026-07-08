"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-session";
import type { StoreOrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatus(orderId: string, status: StoreOrderStatus) {
  await requireAdmin();
  await prisma.storeOrder.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
