import Link from "next/link";
import { prisma } from "@/lib/db";
import { deletePost } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog · IYKA Admin" };

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mis-text">Blog</h1>
          <p className="mt-1 text-sm text-mis-text-muted">{posts.length} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-mis-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          + New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-mis-border bg-white">
        {posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-mis-text-soft">No posts yet. <Link href="/admin/blog/new" className="underline">Write one →</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mis-border-soft bg-mis-bg">
                {["Title", "Category", "Author", "Date", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-mis-text-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} style={{ borderTop: i === 0 ? undefined : "1px solid #f3f4f6" }} className="hover:bg-mis-bg">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-mis-text">{post.title}</p>
                    <p className="text-xs text-mis-text-soft">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3.5 text-mis-text-muted">{post.category ?? "—"}</td>
                  <td className="px-4 py-3.5 text-mis-text-muted">{post.author}</td>
                  <td className="px-4 py-3.5 text-xs tabular-nums text-mis-text-muted">
                    {(post.publishedAt ?? post.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={post.published
                        ? { background: "#f0fdf4", color: "#16a34a" }
                        : { background: "#f9fafb", color: "#9ca3af" }}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.published && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-xs text-mis-text-soft hover:text-mis-text"
                        >
                          View ↗
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="rounded-lg border border-mis-border px-3 py-1.5 text-xs font-medium text-mis-text hover:bg-mis-border-soft"
                      >
                        Edit
                      </Link>
                      <form action={async () => { "use server"; await deletePost(post.id); }}>
                        <button
                          type="submit"
                          className="rounded-lg border border-mis-danger/15 px-3 py-1.5 text-xs font-medium text-mis-danger hover:bg-mis-danger-bg"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
