import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers · IYKA Admin" };

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export default async function AdminCustomersPage() {
  const orders = await prisma.storeOrder.findMany({
    where: { status: { not: "CANCELLED" } },
    select: {
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate by phone
  const customerMap = new Map<string, {
    name: string; phone: string; email: string | null;
    orderCount: number; totalSpend: number; lastOrder: Date;
  }>();

  for (const o of orders) {
    const existing = customerMap.get(o.customerPhone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpend += Number(o.total);
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      customerMap.set(o.customerPhone, {
        name: o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail,
        orderCount: 1,
        totalSpend: Number(o.total),
        lastOrder: o.createdAt,
      });
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.lastOrder.getTime() - a.lastOrder.getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
        <p className="mt-1 text-sm text-neutral-500">{customers.length} unique buyers</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {customers.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-400">No customers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {["Customer", "Phone", "Orders", "Total Spent", "Last Order", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.phone} style={{ borderTop: i === 0 ? undefined : "1px solid #f3f4f6" }} className="hover:bg-neutral-50">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-neutral-900">{c.name}</p>
                    {c.email && <p className="text-xs text-neutral-400">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-neutral-600">{c.phone}</td>
                  <td className="px-4 py-3.5 tabular-nums text-neutral-700">{c.orderCount}</td>
                  <td className="px-4 py-3.5 font-semibold tabular-nums text-neutral-900">{fmt(c.totalSpend)}</td>
                  <td className="px-4 py-3.5 text-xs text-neutral-500 tabular-nums">
                    {c.lastOrder.toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c.phone)}`}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      View
                    </Link>
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
