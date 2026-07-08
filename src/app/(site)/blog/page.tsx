import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CtaSection } from "@/components/site/cta-section";

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
      {/* Hero */}
      <section
        className="relative flex min-h-[42vh] items-end overflow-hidden"
        style={{ background: "var(--green)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gallery/a7e6d026-c11d-42f0-b035-bcb80959fbed.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-full object-cover"
          style={{ width: "62%", objectPosition: "center center", opacity: 0.55 }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to right, #2C4028 38%, rgba(44,64,40,0.82) 60%, rgba(44,64,40,0) 82%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 60% 100%, rgba(200,151,60,0.08), transparent),radial-gradient(ellipse 50% 80% at 0% 0%, rgba(200,151,60,0.06), transparent)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(27,25,22,0.4) 0%, transparent 60%)" }} />
        <div className="relative max-w-6xl mx-auto w-full px-6 md:px-16 pb-16 pt-40">
          <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "var(--gold-light)" }}>
            Iyka-Aram Wellness
          </p>
          <h1 className="font-display font-light leading-[1.05]" style={{ fontSize: "clamp(3rem,7vw,5.5rem)", color: "var(--cream)" }}>
            Wellness Journal
          </h1>
          <p className="mt-4 max-w-[32rem] font-light leading-[1.7]" style={{ fontSize: "1.05rem", color: "rgba(248,244,238,0.65)" }}>
            Insights on Ayurveda, yoga, and holistic living from the IYKA-ARAM team.
          </p>
        </div>
      </section>

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
                  <span className="text-[10px] font-medium tracking-widest uppercase mb-2" style={{ color: "var(--gold)" }}>
                    {post.category}
                  </span>
                  <h2 className="font-display text-lg text-forest leading-snug">
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
