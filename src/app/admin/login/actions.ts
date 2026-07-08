"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/admin-session";

export async function adminLogin(_: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { error: "ADMIN_PASSWORD is not configured." };
  }
  if (!password || password !== expected) {
    return { error: "Incorrect password." };
  }

  await createAdminSession();
  redirect("/admin");
}
