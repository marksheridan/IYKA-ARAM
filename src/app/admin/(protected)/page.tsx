import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · IYKA Admin" };

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

const LOW_STOCK_CEILING = 10;

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalOrders, monthOrders, revenueAgg, productCount, blogCount, recentOrders, lowStock] =
    await Promise.all([
      prisma.storeOrder.count(),
      prisma.storeOrder.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.storeOrder.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.storeOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
      prisma.product.findMany({
        where: { isPublished: true, inStock: true, stock: { lte: LOW_STOCK_CEILING } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const today = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const kpis = [
    { label: "Orders", value: totalOrders, sub: `${monthOrders} this month`, href: "/admin/orders" },
    { label: "Revenue", value: fmt(totalRevenue), sub: "all time, excl. cancelled", href: "/admin/orders" },
    { label: "Products live", value: productCount, sub: "published on store", href: "/admin/products" },
    { label: "Blog posts", value: blogCount, sub: "published", href: "/admin/blog" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up flex items-end justify-between">
        <div>
          <p className="admin-eyebrow">Store overview</p>
          <h1 className="admin-display mt-1 text-4xl text-mis-text">Dashboard</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-mis-text-soft">{today}</p>
          <Link href="/store" target="_blank" className="mt-1 inline-block text-xs font-medium text-mis-blue transition-colors hover:text-gold">
            View store ↗
          </Link>
        </div>
      </div>

      {/* Stats band — the landing page's stat block, working for a living */}
      <div className="animate-fade-in-up grid grid-cols-2 rounded-xl border border-mis-border bg-white lg:grid-cols-4" style={{ animationDelay: "0.08s" }}>
        {kpis.map((k, i) => (
          <Link
            key={k.label}
            href={k.href}
            className={`group p-6 ${i > 0 ? "border-l border-mis-border-soft" : ""} ${i >= 2 ? "max-lg:border-t" : ""}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mis-text-soft">{k.label}</p>
            <span className="mt-2 block h-px w-6 bg-gold transition-all duration-300 group-hover:w-10" />
            <p className="admin-display mt-2 text-4xl tabular-nums text-mis-text transition-colors group-hover:text-mis-blue">
              {k.value}
            </p>
            <p className="mt-1.5 text-xs text-mis-text-muted">{k.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="animate-fade-in-up lg:col-span-2" style={{ animationDelay: "0.16s" }}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-mis-text">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-mis-text-muted transition-colors hover:text-gold">
              See all →
            </Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-mis-border bg-white">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-mis-text-muted">
                No orders yet. New orders appear here the moment a customer checks out.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-mis-border-soft bg-mis-bg">
                    {["Order", "Customer", "Items", "Total", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-mis-text-soft">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-mis-border-soft">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-mis-bg/60">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-mis-text hover:text-mis-blue hover:underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-mis-text-muted">{o.customerName}</td>
                      <td className="px-4 py-3 tabular-nums text-mis-text-muted">{o.items.length}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-mis-text">{fmt(Number(o.total))}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Needs attention */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.24s" }}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-mis-text">Needs attention</h2>
            <Link href="/admin/products" className="text-xs font-medium text-mis-text-muted transition-colors hover:text-gold">
              Manage →
            </Link>
          </div>
          <div className="mt-3 rounded-xl border border-mis-border bg-white">
            {lowStock.length === 0 ? (
              <p className="flex items-center gap-2 p-5 text-sm text-mis-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-mis-success" />
                All products well-stocked.
              </p>
            ) : (
              <ul className="divide-y divide-mis-border-soft">
                {lowStock.map((p) => {
                  const stock = p.stock ?? 0;
                  const out = stock === 0;
                  return (
                    <li key={p.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-mis-text">{p.name}</p>
                        <span className={`shrink-0 text-xs font-semibold tabular-nums ${out ? "text-mis-danger" : "text-mis-warning-deep"}`}>
                          {out ? "Out of stock" : `${stock} left`}
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-mis-border-soft">
                        <div
                          className={`h-full rounded-full ${out ? "bg-mis-danger" : "bg-mis-warning"}`}
                          style={{ width: `${Math.max((stock / LOW_STOCK_CEILING) * 100, 4)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-mis-text-soft">{p.category}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
