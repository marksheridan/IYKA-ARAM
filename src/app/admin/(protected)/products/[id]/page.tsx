import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "../actions";

export const metadata = { title: "Edit Product · IYKA Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
        <p className="mt-1 text-sm text-neutral-500">{product.name}</p>
      </div>
      <ProductForm product={product} action={updateProduct} />
    </div>
  );
}
