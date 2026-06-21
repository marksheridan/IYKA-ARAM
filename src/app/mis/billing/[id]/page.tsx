import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr, dateTime } from "@/lib/format";
import {
  addLineItem,
  removeLineItem,
  issueInvoice,
  recordPayment,
  cancelInvoice,
  sendReceipt,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const { id } = await params;

  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: { patient: true, lineItems: true, payments: true },
  });

  if (!inv) {
    return (
      <div>
        <h1 className="font-display text-2xl text-forest">Invoice not found</h1>
        <Link href="/mis/billing" className="mt-4 inline-block text-gold">
          ← Billing
        </Link>
      </div>
    );
  }

  const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = Number(inv.total) - paid;
  const editable = inv.status === "DRAFT";
  const closed = inv.status === "CANCELLED" || inv.status === "REFUNDED";

  return (
    <div className="max-w-3xl">
      <Link href="/mis/billing" className="text-sm text-muted hover:text-ink">
        ← Billing
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl text-forest">{inv.number}</h1>
        <StatusBadge status={inv.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        {inv.patient.name} · {inv.patient.phone}
      </p>

      {/* Line items */}
      <div className="mt-6 overflow-hidden rounded-xl border border-sand bg-white">
        <table className="w-full text-sm">
          <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Amount</th>
              {editable && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {inv.lineItems.map((li) => (
              <tr key={li.id} className="border-t border-sand">
                <td className="px-4 py-3 text-ink">{li.description}</td>
                <td className="px-4 py-3 text-muted">{li.quantity}</td>
                <td className="px-4 py-3 text-muted">{inr(li.unitPrice)}</td>
                <td className="px-4 py-3 text-muted">{Number(li.taxRate)}%</td>
                <td className="px-4 py-3 text-ink">{inr(li.amount)}</td>
                {editable && (
                  <td className="px-4 py-3 text-right">
                    <form action={removeLineItem}>
                      <input type="hidden" name="lineItemId" value={li.id} />
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <button className="text-xs text-red-700 hover:underline">
                        Remove
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
        <Row label="Subtotal" value={inr(inv.subtotal)} />
        <Row label="GST" value={inr(inv.taxAmount)} />
        <Row label="Total" value={inr(inv.total)} strong />
        <Row label="Paid" value={inr(paid)} />
        <Row label="Balance" value={inr(balance)} strong />
      </div>

      {/* Add line item (draft only) */}
      {editable && (
        <form
          action={addLineItem}
          className="mt-6 grid items-end gap-3 rounded-xl border border-sand bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
        >
          <input type="hidden" name="invoiceId" value={inv.id} />
          <Mini label="Description" name="description" />
          <Mini label="Qty" name="quantity" type="number" defaultValue="1" />
          <Mini label="Unit ₹" name="unitPrice" type="number" />
          <Mini label="GST %" name="taxRate" type="number" defaultValue="0" />
          <button className="rounded-full bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">
            Add
          </button>
        </form>
      )}

      {/* Actions */}
      {!closed && (
        <div className="mt-6 flex flex-wrap gap-3">
          {inv.status === "DRAFT" && (
            <form action={issueInvoice}>
              <input type="hidden" name="invoiceId" value={inv.id} />
              <button className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-forest hover:text-cream">
                Issue invoice
              </button>
            </form>
          )}
          <form action={cancelInvoice}>
            <input type="hidden" name="invoiceId" value={inv.id} />
            <button className="rounded-full border border-red-200 bg-white px-5 py-2 text-sm text-red-700 hover:bg-red-50">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Payments */}
      <h2 className="mt-10 font-display text-lg text-forest">Payments</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-sand bg-white">
        {inv.payments.length === 0 ? (
          <p className="p-5 text-sm text-muted">No payments recorded.</p>
        ) : (
          <ul className="divide-y divide-sand text-sm">
            {inv.payments.map((p) => (
              <li key={p.id} className="flex justify-between px-5 py-3">
                <span className="text-ink">
                  {inr(p.amount)}{" "}
                  <span className="capitalize text-muted">
                    · {p.method.toLowerCase().replace(/_/g, " ")}
                  </span>
                </span>
                <span className="text-xs text-muted">{dateTime(p.paidAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {inv.payments.length > 0 && (
        <form action={sendReceipt} className="mt-3">
          <input type="hidden" name="invoiceId" value={inv.id} />
          <button className="rounded-full border border-sand bg-white px-5 py-2 text-sm text-forest hover:border-gold">
            Send receipt via WhatsApp
          </button>
        </form>
      )}

      {!closed && balance > 0 && (
        <form
          action={recordPayment}
          className="mt-4 grid items-end gap-3 rounded-xl border border-sand bg-white p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <input type="hidden" name="invoiceId" value={inv.id} />
          <Mini
            label="Amount ₹"
            name="amount"
            type="number"
            defaultValue={balance.toFixed(2)}
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">
              Method
            </label>
            <select
              name="method"
              className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Mini label="Reference" name="reference" />
          <button className="rounded-full bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">
            Record
          </button>
        </form>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-ink" : "text-ink"}>
        {value}
      </span>
    </div>
  );
}

function Mini({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink">{label}</label>
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}
