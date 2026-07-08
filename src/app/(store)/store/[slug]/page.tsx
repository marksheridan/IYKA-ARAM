import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { ProductDetail } from "./product-detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: `${product.name} · IYKA Store`, description: product.tagline ?? undefined };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, related] = await Promise.all([
    prisma.product.findUnique({ where: { slug, isPublished: true } }),
    prisma.product.findMany({ where: { isPublished: true }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!product) notFound();

  const relatedProducts = related
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  return <ProductDetail product={product} related={relatedProducts} />;
}
