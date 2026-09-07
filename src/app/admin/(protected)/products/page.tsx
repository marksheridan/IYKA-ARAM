import Link from "next/link";
import { prisma } from "@/lib/db";
import { toggleProductPublished, toggleProductStock, deleteProduct } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products · IYKA Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-end justify-between">
        <div>
          <p className="admin-eyebrow">Store</p>
          <h1 className="admin-display mt-1 text-4xl text-mis-text">Products</h1>
          <p className="mt-1 text-sm text-mis-text-muted">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mis-warning"
        >
          + New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-mis-border bg-white">
        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-mis-text-soft">No products yet. <Link href="/admin/products/new" className="underline">Add one →</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mis-border-soft bg-mis-bg">
                {["Product", "Category", "Price", "Stock", "Live", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-mis-text-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mis-border-soft">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-mis-bg/60">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-semibold text-mis-text">{p.name}</p>
                      {p.badge && (
                        <span className="mt-0.5 inline-block rounded-full bg-mis-warning-bg px-2 py-0.5 text-[10px] font-semibold text-mis-warning-deep">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-mis-text-muted">{p.category ?? "—"}</td>
                  <td className="px-4 py-3.5 tabular-nums">
                    <span className="font-semibold text-mis-text">₹{Number(p.price).toLocaleString("en-IN")}</span>
                    {p.mrp && Number(p.mrp) > Number(p.price) && (
                      <span className="ml-1.5 text-xs text-mis-text-soft line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProductStock(p.id, !p.inStock);
                      }}
                    >
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-75 ${
                          p.inStock ? "bg-mis-success-bg text-mis-success" : "bg-mis-danger-bg text-mis-danger"
                        }`}
                      >
                        {p.inStock ? `In stock${p.stock != null ? ` (${p.stock})` : ""}` : "Out of stock"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProductPublished(p.id, !p.isPublished);
                      }}
                    >
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-75 ${
                          p.isPublished ? "bg-mis-blue-light text-mis-blue" : "bg-mis-border-soft text-mis-text-soft"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg border border-mis-border px-3 py-1.5 text-xs font-medium text-mis-text hover:bg-mis-border-soft"
                      >
                        Edit
                      </Link>
                      <form action={async () => { "use server"; await deleteProduct(p.id); }}>
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
