import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr, dateOnly } from "@/lib/format";
import { createExpense, createPayout, markPayoutPaid } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance · IYKA MIS" };

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash", UPI: "UPI", CARD: "Card", BANK_TRANSFER: "Bank transfer", OTHER: "Other",
};

export default async function FinancePage() {
  await requireUser(["ADMIN", "FRONT_DESK"]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [revAgg, expAgg, outstandingInvoices, todaysPayments, recentExpenses, categories, payouts, staff] =
    await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: monthStart } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
      prisma.invoice.findMany({
        where: { OR: [{ status: "ISSUED" }, { status: "PARTIALLY_PAID" }] },
        select: { total: true, payments: { select: { amount: true } } },
      }),
      prisma.payment.findMany({ where: { paidAt: { gte: todayStart, lte: todayEnd } }, select: { amount: true, method: true } }),
      prisma.expense.findMany({ include: { category: true }, orderBy: { date: "desc" }, take: 10 }),
      prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
      prisma.payout.findMany({ include: { provider: true }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.staff.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ]);

  const monthRevenue = Number(revAgg._sum.amount ?? 0);
  const monthExpenses = Number(expAgg._sum.amount ?? 0);
  const net = monthRevenue - monthExpenses;
  const outstanding = outstandingInvoices.reduce((s, inv) => {
    const paid = inv.payments.reduce((a, p) => a + Number(p.amount), 0);
    return s + (Number(inv.total) - paid);
  }, 0);

  const byMethod: Record<string, number> = {};
  let todayTotal = 0;
  for (const p of todaysPayments) {
    const amt = Number(p.amount);
    byMethod[p.method] = (byMethod[p.method] ?? 0) + amt;
    todayTotal += amt;
  }

  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const todayStr = todayStart.toISOString().slice(0, 10);

  const summaryCards = [
    { label: `Revenue · ${monthLabel}`, value: inr(monthRevenue), color: "var(--color-mis-success)", bg: "var(--color-mis-success-bg)" },
    { label: `Expenses · ${monthLabel}`, value: inr(monthExpenses), color: "var(--color-mis-warning)", bg: "var(--color-mis-warning-bg)" },
    { label: "Net P&L", value: inr(net), color: net >= 0 ? "var(--color-mis-success)" : "var(--color-mis-danger)", bg: net >= 0 ? "var(--color-mis-success-bg)" : "var(--color-mis-danger-bg)" },
    { label: "Outstanding", value: inr(outstanding), color: "var(--color-mis-blue)", bg: "var(--color-mis-blue-subtle)" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-mis-text)", letterSpacing: "-0.02em" }}>
          Finance
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="mis-card p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-mis-text-soft)" }}>{c.label}</div>
            <div className="mt-2 text-2xl font-bold tabular-nums" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Today's collection */}
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-mis-text)" }}>Today&apos;s collection</h2>
        <div className="mis-card mt-3 p-5">
          {todaysPayments.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-mis-text-muted)" }}>No payments collected today.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {Object.entries(byMethod).map(([m, amt]) => (
                <div key={m}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-mis-text-soft)" }}>
                    {METHOD_LABELS[m] ?? m}
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums" style={{ color: "var(--color-mis-text)" }}>{inr(amt)}</div>
                </div>
              ))}
              <div className="ml-auto">
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-mis-text-soft)" }}>Total</div>
                <div className="mt-1 text-lg font-bold tabular-nums" style={{ color: "var(--color-mis-success)" }}>{inr(todayTotal)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expenses */}
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-mis-text)" }}>Expenses</h2>
        <form action={createExpense} className="mis-card mt-3 grid items-end gap-3 p-4 sm:grid-cols-[1.3fr_1fr_1fr_1.5fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-mis-text)" }}>Category</label>
            <select name="categoryId" required className="mis-input w-full">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Mini label="Amount ₹" name="amount" type="number" />
          <Mini label="Date" name="date" type="date" defaultValue={todayStr} />
          <Mini label="Vendor / note" name="vendor" />
          <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--color-mis-blue)" }}>Add</button>
        </form>

        <div className="mis-card mt-3 overflow-hidden">
          {recentExpenses.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>No expenses recorded.</p>
          ) : (
            <ul className="text-sm">
              {recentExpenses.map((e, idx) => (
                <li
                  key={e.id}
                  className="flex justify-between px-5 py-3"
                  style={{ borderTop: idx === 0 ? undefined : `1px solid var(--color-mis-border-soft)` }}
                >
                  <span style={{ color: "var(--color-mis-text)" }}>
                    {e.category.name}{e.vendor ? ` · ${e.vendor}` : ""}
                  </span>
                  <span className="flex gap-4">
                    <span className="tabular-nums font-medium" style={{ color: "var(--color-mis-text)" }}>{inr(e.amount)}</span>
                    <span className="text-xs tabular-nums" style={{ color: "var(--color-mis-text-soft)" }}>{dateOnly(e.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Payouts */}
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-mis-text)" }}>Staff payouts</h2>
        <form action={createPayout} className="mis-card mt-3 grid items-end gap-3 p-4 sm:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-mis-text)" }}>Staff</label>
            <select name="providerId" required className="mis-input w-full">
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Mini label="From" name="periodStart" type="date" />
          <Mini label="To" name="periodEnd" type="date" />
          <Mini label="Amount ₹" name="amount" type="number" />
          <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--color-mis-blue)" }}>Add</button>
        </form>

        <div className="mis-card mt-3 overflow-hidden">
          {payouts.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>No payouts yet.</p>
          ) : (
            <ul className="text-sm">
              {payouts.map((p, idx) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                  style={{ borderTop: idx === 0 ? undefined : `1px solid var(--color-mis-border-soft)` }}
                >
                  <span style={{ color: "var(--color-mis-text)" }}>
                    {p.provider.name}{" "}
                    <span className="text-xs" style={{ color: "var(--color-mis-text-soft)" }}>
                      · {dateOnly(p.periodStart)} – {dateOnly(p.periodEnd)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums font-medium" style={{ color: "var(--color-mis-text)" }}>{inr(p.amount)}</span>
                    <StatusBadge status={p.status} />
                    {p.status === "PENDING" && (
                      <form action={markPayoutPaid}>
                        <input type="hidden" name="payoutId" value={p.id} />
                        <button
                          className="rounded-lg px-3 py-1 text-xs font-semibold"
                          style={{ background: "var(--color-mis-success-bg)", color: "var(--color-mis-success)" }}
                        >
                          Mark paid
                        </button>
                      </form>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-mis-text)" }}>{label}</label>
      <input name={name} type={type} step={type === "number" ? "any" : undefined} defaultValue={defaultValue} className="mis-input w-full" />
    </div>
  );
}
