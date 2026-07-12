"use client";

import { useActionState } from "react";
import { RichEditor } from "./rich-editor";
import type { BlogPost } from "@/generated/prisma/client";

type ActionFn = (_: unknown, formData: FormData) => Promise<{ error: string } | void>;

const CATEGORIES = ["Ayurveda", "Yoga & Breathwork", "Community", "Nutrition", "Wellness", "News"];

export function PostForm({ post, action }: { post?: BlogPost | null; action: ActionFn }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      {state?.error && (
        <div className="rounded-lg bg-mis-danger-bg px-4 py-3 text-sm text-mis-danger">{state.error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left — main content */}
        <div className="space-y-5">
          <div className="rounded-xl border border-mis-border bg-white p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mis-text">Title *</label>
              <input
                name="title"
                required
                defaultValue={post?.title}
                className="w-full rounded-lg border border-mis-border px-3.5 py-2.5 text-sm focus:border-mis-blue focus:outline-none focus:ring-1 focus:ring-mis-blue"
                placeholder="Your post title"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-mis-text">Excerpt</label>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={post?.excerpt ?? ""}
                className="w-full rounded-lg border border-mis-border px-3.5 py-2.5 text-sm focus:border-mis-blue focus:outline-none focus:ring-1 focus:ring-mis-blue"
                placeholder="Short description shown in the blog listing"
              />
            </div>
          </div>

          <div className="rounded-xl border border-mis-border bg-white overflow-hidden">
            <div className="border-b border-mis-border-soft px-5 py-3.5">
              <p className="text-sm font-medium text-mis-text">Content *</p>
            </div>
            <RichEditor name="content" defaultValue={post?.content ?? ""} placeholder="Write your post here…" />
          </div>
        </div>

        {/* Right — meta sidebar */}
        <div className="space-y-4">
          {/* Publish */}
          <div className="rounded-xl border border-mis-border bg-white p-5 space-y-4">
            <p className="text-sm font-semibold text-mis-text">Publish</p>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="hidden" name="published" value="false" />
              <input
                type="checkbox"
                name="published"
                value="true"
                defaultChecked={post?.published ?? false}
                className="h-4 w-4 rounded border-mis-border accent-neutral-900"
              />
              <span className="text-sm text-mis-text">Publish to website</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-lg bg-mis-blue py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {pending ? "Saving…" : post ? "Save" : "Create"}
              </button>
              <a href="/admin/blog" className="flex-1 rounded-lg border border-mis-border py-2.5 text-center text-sm font-medium text-mis-text-muted hover:bg-mis-bg">
                Cancel
              </a>
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-mis-border bg-white p-5 space-y-4">
            <p className="text-sm font-semibold text-mis-text">Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mis-text-muted">Slug *</label>
              <input
                name="slug"
                required
                defaultValue={post?.slug}
                className="w-full rounded-lg border border-mis-border px-3 py-2 text-xs focus:border-mis-blue focus:outline-none"
                placeholder="url-friendly-slug"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mis-text-muted">Category</label>
              <select
                name="category"
                defaultValue={post?.category ?? ""}
                className="w-full rounded-lg border border-mis-border px-3 py-2 text-xs focus:border-mis-blue focus:outline-none"
              >
                <option value="">— Select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mis-text-muted">Author</label>
              <input
                name="author"
                defaultValue={post?.author ?? "IYKA-ARAM Wellness Team"}
                className="w-full rounded-lg border border-mis-border px-3 py-2 text-xs focus:border-mis-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mis-text-muted">Cover Image URL</label>
              <input
                name="coverImage"
                defaultValue={post?.coverImage ?? ""}
                className="w-full rounded-lg border border-mis-border px-3 py-2 text-xs focus:border-mis-blue focus:outline-none"
                placeholder="/gallery/img1.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
