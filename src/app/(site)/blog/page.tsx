import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CtaSection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wellness Journal" };

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return `${Math.ceil(words / 220)} min read`;
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Iyka-Aram Wellness"
        title="Wellness Journal"
        lead="Insights on functional medicine, yoga, nutrition and holistic living from the IYKA-ARAM team."
        image="/gallery/a7e6d026-c11d-42f0-b035-bcb80959fbed.jpg"
        tint="earth"
        vignette
      />

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-16">
        {posts.length === 0 ? (
          <p className="text-center text-muted py-12">No posts published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.slug} className="group flex flex-col">
                <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full" style={{ background: "var(--cream-mid)" }} />
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(27,25,22,0.18)" }} />
                  </div>
                </Link>
                <div className="pt-3 flex flex-col flex-1">
                  <span className="v2-meta-label mb-2" style={{ color: "var(--gold-deep)" }}>
                    {post.category}
                  </span>
                  <h2 className="v2-card-title text-forest">
                    <Link href={`/blog/${post.slug}`} className="hover:opacity-70 transition-opacity">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1.5 text-muted text-xs leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-sand flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted">
                      <span>By {post.author}</span>
                      <span aria-hidden className="opacity-40">·</span>
                      <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                      {post.content && (
                        <>
                          <span aria-hidden className="opacity-40">·</span>
                          <span>{readTime(post.content)}</span>
                        </>
                      )}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-xs text-forest font-medium hover:opacity-70 transition-opacity flex items-center gap-0.5">
                      Read<span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CtaSection />
    </>
  );
}
