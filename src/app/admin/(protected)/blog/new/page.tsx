import { PostForm } from "@/components/admin/post-form";
import { createPost } from "../actions";

export const metadata = { title: "New Post · IYKA Admin" };

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">New Post</h1>
        <p className="mt-1 text-sm text-neutral-500">Write and publish a new blog post.</p>
      </div>
      <PostForm action={createPost} />
    </div>
  );
}
