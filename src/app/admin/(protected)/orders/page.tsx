import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders · IYKA Admin" };

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  PLACED:     { bg: "#eff6ff", text: "#2563eb" },
  CONFIRMED:  { bg: "#f0fdf4", text: "#16a34a" },
  DISPATCHED: { bg: "#fefce8", text: "#ca8a04" },
  DELIVERED:  { bg: "#f0fdf4", text: "#15803d" },
  CANCELLED:  { bg: "#fef2f2", text: "#dc2626" },
};

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status as string | undefined;

  const orders = await prisma.storeOrder.findMany({
    where: statusFilter ? { status: statusFilter as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const STATUSES = ["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-mis-text">Orders</h1>
        <p className="mt-1 text-sm text-mis-text-muted">{orders.length} {statusFilter ? statusFilter.toLowerCase() : "total"}</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          style={!statusFilter ? { background: "#1f2937", color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}
        >
          All
        </Link>
        {STATUSES.map((s) => {
          const sc = STATUS_STYLE[s];
          const active = statusFilter === s;
          return (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={active ? { background: sc.text, color: "#fff" } : { background: sc.bg, color: sc.text }}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-mis-border bg-white">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-mis-text-soft">No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mis-border-soft bg-mis-bg">
                {["Order #", "Customer", "Date", "Items", "Total", "Payment", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-mis-text-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => {
                const sc = STATUS_STYLE[o.status] ?? { bg: "#f9fafb", text: "#6b7280" };
                return (
                  <tr key={o.id} style={{ borderTop: i === 0 ? undefined : "1px solid #f3f4f6" }} className="hover:bg-mis-bg">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold text-mis-text">{o.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-mis-text">{o.customerName}</p>
                      <p className="text-xs text-mis-text-soft">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs tabular-nums text-mis-text-muted">
                      {o.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-mis-text-muted">{o.items.length}</td>
                    <td className="px-4 py-3.5 font-semibold tabular-nums text-mis-text">{fmt(Number(o.total))}</td>
                    <td className="px-4 py-3.5 uppercase text-xs text-mis-text-muted">{o.paymentMethod}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: sc.bg, color: sc.text }}>
                        {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="rounded-lg border border-mis-border px-3 py-1.5 text-xs font-medium text-mis-text hover:bg-mis-border-soft"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
