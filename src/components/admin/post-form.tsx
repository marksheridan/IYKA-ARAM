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
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left — main content */}
        <div className="space-y-5">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Title *</label>
              <input
                name="title"
                required
                defaultValue={post?.title}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="Your post title"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Excerpt</label>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={post?.excerpt ?? ""}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                placeholder="Short description shown in the blog listing"
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-100 px-5 py-3.5">
              <p className="text-sm font-medium text-neutral-700">Content *</p>
            </div>
            <RichEditor name="content" defaultValue={post?.content ?? ""} placeholder="Write your post here…" />
          </div>
        </div>

        {/* Right — meta sidebar */}
        <div className="space-y-4">
          {/* Publish */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <p className="text-sm font-semibold text-neutral-700">Publish</p>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="hidden" name="published" value="false" />
              <input
                type="checkbox"
                name="published"
                value="true"
                defaultChecked={post?.published ?? false}
                className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
              />
              <span className="text-sm text-neutral-700">Publish to website</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {pending ? "Saving…" : post ? "Save" : "Create"}
              </button>
              <a href="/admin/blog" className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-center text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                Cancel
              </a>
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <p className="text-sm font-semibold text-neutral-700">Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Slug *</label>
              <input
                name="slug"
                required
                defaultValue={post?.slug}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-500 focus:outline-none"
                placeholder="url-friendly-slug"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Category</label>
              <select
                name="category"
                defaultValue={post?.category ?? ""}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-500 focus:outline-none"
              >
                <option value="">— Select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Author</label>
              <input
                name="author"
                defaultValue={post?.author ?? "IYKA-ARAM Wellness Team"}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Cover Image URL</label>
              <input
                name="coverImage"
                defaultValue={post?.coverImage ?? ""}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-500 focus:outline-none"
                placeholder="/gallery/img1.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
