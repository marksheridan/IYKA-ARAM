import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateOrderStatus } from "../actions";
import type { StoreOrderStatus } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

const STATUS_FLOW: StoreOrderStatus[] = ["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED"];

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.storeOrder.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const currentIdx = STATUS_FLOW.indexOf(order.status as StoreOrderStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-mis-text-muted hover:text-mis-text">← Orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-mis-text font-mono">{order.orderNumber}</h1>
          <p className="mt-0.5 text-sm text-mis-text-muted">
            {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status actions */}
      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-mis-border bg-white p-4">
          <p className="w-full text-xs font-semibold uppercase tracking-wider text-mis-text-soft">Update Status</p>
          {nextStatus && (
            <form action={async () => { "use server"; await updateOrderStatus(order.id, nextStatus); }}>
              <button
                type="submit"
                className="rounded-lg bg-mis-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-80"
              >
                Mark as {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
              </button>
            </form>
          )}
          <form action={async () => { "use server"; await updateOrderStatus(order.id, "CANCELLED"); }}>
            <button
              type="submit"
              className="rounded-lg border border-mis-danger/25 px-4 py-2 text-sm font-semibold text-mis-danger hover:bg-mis-danger-bg"
            >
              Cancel Order
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Customer */}
        <div className="rounded-xl border border-mis-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-mis-text">Customer</h2>
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-mis-text">{order.customerName}</p>
            <p className="text-mis-text-muted">{order.customerPhone}</p>
            {order.customerEmail && <p className="text-mis-text-muted">{order.customerEmail}</p>}
          </div>
        </div>

        {/* Shipping */}
        <div className="rounded-xl border border-mis-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-mis-text">Shipping Address</h2>
          <div className="text-sm text-mis-text leading-relaxed">
            <p>{order.street}</p>
            <p>{order.city}, {order.state}</p>
            <p>PIN {order.pin}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-mis-border bg-white overflow-hidden">
        <div className="border-b border-mis-border-soft px-5 py-4">
          <h2 className="text-sm font-semibold text-mis-text">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mis-border-soft bg-mis-bg">
              {["Product", "Qty", "Unit Price", "Total"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-mis-text-soft">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id} className={i === 0 ? undefined : "border-t border-mis-border-soft"}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-mis-text">{item.productName}</p>
                  <p className="text-xs text-mis-text-soft">{item.productSlug}</p>
                </td>
                <td className="px-5 py-3.5 tabular-nums text-mis-text-muted">{item.quantity}</td>
                <td className="px-5 py-3.5 tabular-nums text-mis-text-muted">{fmt(Number(item.price))}</td>
                <td className="px-5 py-3.5 font-semibold tabular-nums text-mis-text">{fmt(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-mis-border-soft px-5 py-4">
          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-mis-text-muted">
              <span>Subtotal</span><span>{fmt(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-mis-text-muted">
              <span>Delivery</span><span>{Number(order.deliveryCharge) === 0 ? "FREE" : fmt(Number(order.deliveryCharge))}</span>
            </div>
            {Number(order.codCharge) > 0 && (
              <div className="flex justify-between text-mis-text-muted">
                <span>COD charge</span><span>{fmt(Number(order.codCharge))}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-mis-border pt-2 font-semibold text-mis-text">
              <span>Total</span><span>{fmt(Number(order.total))}</span>
            </div>
            <div className="flex justify-between text-xs text-mis-text-soft uppercase">
              <span>Payment</span><span>{order.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
