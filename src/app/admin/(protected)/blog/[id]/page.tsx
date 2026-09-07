import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/post-form";
import { updatePost } from "../actions";

export const metadata = { title: "Edit Post · IYKA Admin" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-mis-text">Edit Post</h1>
        <p className="mt-1 text-sm text-mis-text-muted">{post.title}</p>
      </div>
      <PostForm post={post} action={updatePost} />
    </div>
  );
}
