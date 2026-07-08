import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateOrderStatus } from "../actions";
import type { StoreOrderStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  PLACED:     { bg: "#eff6ff", text: "#2563eb" },
  CONFIRMED:  { bg: "#f0fdf4", text: "#16a34a" },
  DISPATCHED: { bg: "#fefce8", text: "#ca8a04" },
  DELIVERED:  { bg: "#dcfce7", text: "#15803d" },
  CANCELLED:  { bg: "#fef2f2", text: "#dc2626" },
};

const STATUS_FLOW: StoreOrderStatus[] = ["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED"];

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.storeOrder.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const sc = STATUS_STYLE[order.status] ?? { bg: "#f9fafb", text: "#6b7280" };
  const currentIdx = STATUS_FLOW.indexOf(order.status as StoreOrderStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-neutral-500 hover:text-neutral-800">← Orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 font-mono">{order.orderNumber}</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: sc.bg, color: sc.text }}>
          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Status actions */}
      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="w-full text-xs font-semibold uppercase tracking-wider text-neutral-400">Update Status</p>
          {nextStatus && (
            <form action={async () => { "use server"; await updateOrderStatus(order.id, nextStatus); }}>
              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-80"
              >
                Mark as {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
              </button>
            </form>
          )}
          <form action={async () => { "use server"; await updateOrderStatus(order.id, "CANCELLED"); }}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel Order
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Customer */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Customer</h2>
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-neutral-900">{order.customerName}</p>
            <p className="text-neutral-500">{order.customerPhone}</p>
            {order.customerEmail && <p className="text-neutral-500">{order.customerEmail}</p>}
          </div>
        </div>

        {/* Shipping */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Shipping Address</h2>
          <div className="text-sm text-neutral-700 leading-relaxed">
            <p>{order.street}</p>
            <p>{order.city}, {order.state}</p>
            <p>PIN {order.pin}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-neutral-700">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {["Product", "Qty", "Unit Price", "Total"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id} style={{ borderTop: i === 0 ? undefined : "1px solid #f3f4f6" }}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-neutral-900">{item.productName}</p>
                  <p className="text-xs text-neutral-400">{item.productSlug}</p>
                </td>
                <td className="px-5 py-3.5 tabular-nums text-neutral-600">{item.quantity}</td>
                <td className="px-5 py-3.5 tabular-nums text-neutral-600">{fmt(Number(item.price))}</td>
                <td className="px-5 py-3.5 font-semibold tabular-nums text-neutral-900">{fmt(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-neutral-100 px-5 py-4">
          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span><span>{fmt(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Delivery</span><span>{Number(order.deliveryCharge) === 0 ? "FREE" : fmt(Number(order.deliveryCharge))}</span>
            </div>
            {Number(order.codCharge) > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>COD charge</span><span>{fmt(Number(order.codCharge))}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
              <span>Total</span><span>{fmt(Number(order.total))}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-400 uppercase">
              <span>Payment</span><span>{order.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
