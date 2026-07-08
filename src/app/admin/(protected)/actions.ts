"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession } from "@/lib/admin-session";

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/admin/login");
}
