import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr, dateOnly } from "@/lib/format";
import { createInvoice } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing · IYKA MIS" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function BillingPage({ searchParams }: { searchParams: SP }) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  const [invoices, patients] = await Promise.all([
    prisma.invoice.findMany({ include: { patient: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.patient.findMany({ orderBy: { name: "asc" }, take: 200 }),
  ]);

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-mis-text)", letterSpacing: "-0.02em" }}>
          Billing
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>Invoices &amp; receipts.</p>
      </div>

      {error === "missing" && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ border: "1px solid var(--color-mis-danger-bg)", background: "var(--color-mis-danger-bg)", color: "var(--color-mis-danger)" }}>
          Choose a patient and enter a description.
        </div>
      )}

      <div className="mis-card overflow-x-auto">
        {invoices.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-mis-border-soft)", background: "var(--color-mis-bg)" }}>
                {["Number", "Patient", "Date", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-mis-text-soft)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr
                  key={inv.id}
                  className="transition-colors hover:bg-[var(--color-mis-bg)]"
                  style={{ borderTop: idx === 0 ? undefined : `1px solid var(--color-mis-border-soft)` }}
                >
                  <td className="px-4 py-3.5 font-medium tabular-nums" style={{ color: "var(--color-mis-text)" }}>{inv.number}</td>
                  <td className="px-4 py-3.5" style={{ color: "var(--color-mis-text-muted)" }}>{inv.patient.name}</td>
                  <td className="px-4 py-3.5 tabular-nums" style={{ color: "var(--color-mis-text-muted)" }}>{dateOnly(inv.createdAt)}</td>
                  <td className="px-4 py-3.5 tabular-nums font-medium" style={{ color: "var(--color-mis-text)" }}>{inr(inv.total)}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <Link
                      href={`/mis/billing/${inv.id}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ background: "var(--color-mis-blue-subtle)", color: "var(--color-mis-blue)" }}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-mis-text)" }}>New invoice</h2>
        <form action={createInvoice} className="mis-card mt-3 space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-mis-text)" }}>Patient *</label>
            <select name="patientId" required className="mis-input w-full">
              <option value="">Select a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.phone}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]">
            <Field label="Description *" name="description" />
            <Field label="Qty" name="quantity" type="number" defaultValue="1" />
            <Field label="Unit price ₹" name="unitPrice" type="number" />
            <Field label="GST %" name="taxRate" type="number" defaultValue="0" />
          </div>
          <button
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-mis-blue)" }}
          >
            Create draft invoice
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-mis-text)" }}>{label}</label>
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        defaultValue={defaultValue}
        className="mis-input w-full"
      />
    </div>
  );
}
