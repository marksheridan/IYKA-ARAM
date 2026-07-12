import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export default async function CustomerDetailPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const decodedPhone = decodeURIComponent(phone);

  const orders = await prisma.storeOrder.findMany({
    where: { customerPhone: decodedPhone },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) notFound();

  const customer = orders[0];
  const totalSpend = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total), 0);

  // All products bought (deduplicated by slug)
  const productMap = new Map<string, { name: string; slug: string; qty: number; times: number }>();
  for (const o of orders) {
    if (o.status === "CANCELLED") continue;
    for (const item of o.items) {
      const ex = productMap.get(item.productSlug);
      if (ex) {
        ex.qty += item.quantity;
        ex.times += 1;
      } else {
        productMap.set(item.productSlug, {
          name: item.productName,
          slug: item.productSlug,
          qty: item.quantity,
          times: 1,
        });
      }
    }
  }
  const products = Array.from(productMap.values()).sort((a, b) => b.qty - a.qty);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/customers" className="text-xs text-mis-text-muted hover:text-mis-text">← Customers</Link>
        <h1 className="admin-display mt-1 text-3xl text-mis-text">{customer.customerName}</h1>
        <div className="mt-1 flex flex-wrap gap-4 text-sm text-mis-text-muted">
          <span>{customer.customerPhone}</span>
          {customer.customerEmail && <span>{customer.customerEmail}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Orders", value: orders.length },
          { label: "Total Spent", value: fmt(totalSpend) },
          { label: "Products Bought", value: products.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-mis-border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-mis-text-soft">{s.label}</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-mis-text">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Products purchased */}
      {products.length > 0 && (
        <div className="rounded-xl border border-mis-border bg-white overflow-hidden">
          <div className="border-b border-mis-border-soft px-5 py-4">
            <h2 className="text-sm font-semibold text-mis-text">Products Purchased</h2>
          </div>
          <ul className="divide-y divide-mis-border-soft">
            {products.map((p) => (
              <li key={p.slug} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-mis-text">{p.name}</p>
                  <p className="text-xs text-mis-text-soft">{p.times} order{p.times !== 1 ? "s" : ""}</p>
                </div>
                <span className="rounded-full bg-mis-border-soft px-2.5 py-0.5 text-xs font-semibold tabular-nums text-mis-text-muted">
                  ×{p.qty}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Order history */}
      <div className="rounded-xl border border-mis-border bg-white overflow-hidden">
        <div className="border-b border-mis-border-soft px-5 py-4">
          <h2 className="text-sm font-semibold text-mis-text">Order History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mis-border-soft bg-mis-bg">
              {["Order #", "Date", "Items", "Total", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-mis-text-soft">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-mis-border-soft">
            {orders.map((o) => {
              return (
                <tr key={o.id} className="transition-colors hover:bg-mis-bg/60">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-mis-text">{o.orderNumber}</td>
                  <td className="px-5 py-3.5 text-xs tabular-nums text-mis-text-muted">
                    {o.createdAt.toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-mis-text-muted">{o.items.length}</td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums text-mis-text">{fmt(Number(o.total))}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-mis-text-muted hover:text-mis-text hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
