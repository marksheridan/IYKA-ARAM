"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-session";

function parseProduct(f: FormData) {
  return {
    name: f.get("name") as string,
    slug: (f.get("slug") as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    tagline: (f.get("tagline") as string) || null,
    description: (f.get("description") as string) || null,
    price: parseFloat(f.get("price") as string),
    mrp: parseFloat(f.get("mrp") as string) || null,
    category: (f.get("category") as string) || null,
    size: (f.get("size") as string) || null,
    badge: (f.get("badge") as string) || null,
    ingredients: (f.get("ingredients") as string) || null,
    usage: (f.get("usage") as string) || null,
    benefits: (f.get("benefits") as string)
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean),
    images: (f.get("images") as string)
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean),
    stock: parseInt(f.get("stock") as string) || 0,
    inStock: f.get("inStock") === "true",
    isPublished: f.get("isPublished") === "true",
    rating: parseFloat(f.get("rating") as string) || null,
    reviews: parseInt(f.get("reviews") as string) || null,
  };
}

export async function createProduct(_: unknown, formData: FormData) {
  await requireAdmin();
  const data = parseProduct(formData);
  if (!data.name || !data.slug || !data.price) return { error: "Name, slug and price are required." };

  try {
    await prisma.product.create({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("Unique constraint")) return { error: "Slug already exists — choose a different slug." };
    return { error: msg };
  }
  redirect("/admin/products");
}

export async function updateProduct(_: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const data = parseProduct(formData);
  if (!data.name || !data.slug || !data.price) return { error: "Name, slug and price are required." };

  try {
    await prisma.product.update({ where: { id }, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("Unique constraint")) return { error: "Slug already exists — choose a different slug." };
    return { error: msg };
  }
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  redirect("/admin/products");
}

export async function toggleProductPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isPublished } });
}

export async function toggleProductStock(id: string, inStock: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { inStock } });
}
