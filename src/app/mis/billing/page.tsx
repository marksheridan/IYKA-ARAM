import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr, dateOnly } from "@/lib/format";
import { createInvoice } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  const [invoices, patients] = await Promise.all([
    prisma.invoice.findMany({
      include: { patient: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.patient.findMany({ orderBy: { name: "asc" }, take: 200 }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl text-forest">Billing</h1>
      <p className="mt-1 text-sm text-muted">Invoices &amp; receipts.</p>

      {error === "missing" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Choose a patient and enter a description.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-muted">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-sand">
                  <td className="px-4 py-3 font-medium text-ink">{i.number}</td>
                  <td className="px-4 py-3 text-muted">{i.patient.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {dateOnly(i.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-ink">{inr(i.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/mis/billing/${i.id}`}
                      className="text-xs text-gold hover:text-forest"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mt-10 font-display text-lg text-forest">New invoice</h2>
      <form
        action={createInvoice}
        className="mt-3 space-y-4 rounded-xl border border-sand bg-white p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Patient *
          </label>
          <select
            name="patientId"
            required
            className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="">Select a patient…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.phone}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <Field label="Description *" name="description" />
          <Field label="Qty" name="quantity" type="number" defaultValue="1" />
          <Field label="Unit price ₹" name="unitPrice" type="number" />
          <Field label="GST %" name="taxRate" type="number" defaultValue="0" />
        </div>
        <button className="rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-ink">
          Create draft invoice
        </button>
      </form>
    </div>
  );
}

function Field({
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
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}
