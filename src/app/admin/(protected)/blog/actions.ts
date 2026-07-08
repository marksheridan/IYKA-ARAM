"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-session";

function parsePost(f: FormData) {
  const published = f.get("published") === "true";
  return {
    title: f.get("title") as string,
    slug: (f.get("slug") as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    excerpt: (f.get("excerpt") as string) || null,
    content: f.get("content") as string,
    coverImage: (f.get("coverImage") as string) || null,
    author: (f.get("author") as string) || "IYKA-ARAM Wellness Team",
    category: (f.get("category") as string) || null,
    published,
    publishedAt: published ? new Date() : null,
  };
}

export async function createPost(_: unknown, formData: FormData) {
  await requireAdmin();
  const data = parsePost(formData);
  if (!data.title || !data.slug) return { error: "Title and slug are required." };

  try {
    await prisma.blogPost.create({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("Unique constraint")) return { error: "Slug already exists." };
    return { error: msg };
  }
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(_: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const data = parsePost(formData);
  if (!data.title || !data.slug) return { error: "Title and slug are required." };

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (existing && !existing.published && data.published) {
    data.publishedAt = new Date();
  } else if (existing?.published && !data.published) {
    data.publishedAt = null;
  } else if (existing?.publishedAt) {
    data.publishedAt = existing.publishedAt;
  }

  try {
    await prisma.blogPost.update({ where: { id }, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("Unique constraint")) return { error: "Slug already exists." };
    return { error: msg };
  }
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  redirect("/admin/blog");
}
