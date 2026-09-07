import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt ?? undefined };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 md:px-12">
      <Link href="/blog" className="text-sm text-muted hover:opacity-70 transition-opacity">
        ← Wellness Journal
      </Link>

      <div className="mt-8 border-l-2 border-gold pl-6">
        <p className="text-sm text-muted">{formatDate(post.publishedAt ?? post.createdAt)}</p>
        <h1 className="mt-1 v2-page-title-compact text-forest">{post.title}</h1>
        <p className="mt-1 text-sm text-muted">{post.author}</p>
      </div>

      {post.excerpt && (
        <p className="mt-8 text-lg text-muted leading-relaxed italic border-l-2 border-gold pl-6">
          {post.excerpt}
        </p>
      )}

      {/* Rich HTML content from Tiptap */}
      <div
        className="mt-8 prose prose-neutral max-w-none text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
