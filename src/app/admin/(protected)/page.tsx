import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · IYKA Admin" };

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PLACED:     { bg: "#eff6ff", text: "#2563eb" },
  CONFIRMED:  { bg: "#f0fdf4", text: "#16a34a" },
  DISPATCHED: { bg: "#fefce8", text: "#ca8a04" },
  DELIVERED:  { bg: "#f0fdf4", text: "#15803d" },
  CANCELLED:  { bg: "#fef2f2", text: "#dc2626" },
};

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
        where: { isPublished: true, inStock: true, stock: { lte: 10 } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);

  const kpis = [
    { label: "Total Orders", value: totalOrders, sub: `${monthOrders} this month`, href: "/admin/orders" },
    { label: "Revenue", value: fmt(totalRevenue), sub: "all time, excl. cancelled", href: "/admin/orders" },
    { label: "Products Live", value: productCount, sub: "published on store", href: "/admin/products" },
    { label: "Blog Posts", value: blogCount, sub: "published", href: "/admin/blog" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Store overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{k.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-900">{k.value}</p>
            <p className="mt-1 text-xs text-neutral-400">{k.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-neutral-500 hover:text-neutral-900">See all →</Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-neutral-400">No orders yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {["Order", "Customer", "Items", "Total", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => {
                    const sc = STATUS_COLORS[o.status] ?? { bg: "#f9fafb", text: "#6b7280" };
                    return (
                      <tr key={o.id} style={{ borderTop: i === 0 ? undefined : "1px solid #f3f4f6" }}>
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-neutral-700 hover:underline">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{o.customerName}</td>
                        <td className="px-4 py-3 tabular-nums text-neutral-500">{o.items.length}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-neutral-900">{fmt(Number(o.total))}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize" style={{ background: sc.bg, color: sc.text }}>
                            {o.status.toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">Low Stock</h2>
            <Link href="/admin/products" className="text-xs text-neutral-500 hover:text-neutral-900">Manage →</Link>
          </div>
          <div className="mt-3 rounded-xl border border-neutral-200 bg-white">
            {lowStock.length === 0 ? (
              <p className="p-5 text-sm text-neutral-400">All products well-stocked.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{p.name}</p>
                      <p className="text-xs text-neutral-400">{p.category}</p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
                      style={p.stock === 0 ? { background: "#fef2f2", color: "#dc2626" } : { background: "#fefce8", color: "#ca8a04" }}
                    >
                      {p.stock ?? 0} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
