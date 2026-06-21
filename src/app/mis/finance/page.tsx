import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr, dateOnly } from "@/lib/format";
import { createExpense, createPayout, markPayoutPaid } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance" };

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  OTHER: "Other",
};

export default async function FinancePage() {
  await requireUser(["ADMIN", "FRONT_DESK"]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    revAgg,
    expAgg,
    outstandingInvoices,
    todaysPayments,
    recentExpenses,
    categories,
    payouts,
    staff,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: monthStart } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: monthStart } },
    }),
    prisma.invoice.findMany({
      where: { OR: [{ status: "ISSUED" }, { status: "PARTIALLY_PAID" }] },
      select: { total: true, payments: { select: { amount: true } } },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: todayStart, lte: todayEnd } },
      select: { amount: true, method: true },
    }),
    prisma.expense.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.payout.findMany({
      include: { provider: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
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

  const monthLabel = now.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const todayStr = todayStart.toISOString().slice(0, 10);

  const cards = [
    { label: `Revenue (${monthLabel})`, value: inr(monthRevenue) },
    { label: `Expenses (${monthLabel})`, value: inr(monthExpenses) },
    { label: "Net (P&L)", value: inr(net) },
    { label: "Outstanding", value: inr(outstanding) },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl text-forest">Finance</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-sand bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-muted">
              {c.label}
            </div>
            <div className="mt-2 font-display text-2xl text-ink">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Today's reconciliation */}
      <h2 className="mt-10 font-display text-lg text-forest">
        Today&apos;s collection
      </h2>
      <div className="mt-3 rounded-xl border border-sand bg-white p-5">
        {todaysPayments.length === 0 ? (
          <p className="text-sm text-muted">No payments collected today.</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {Object.entries(byMethod).map(([m, amt]) => (
              <div key={m}>
                <div className="text-xs uppercase tracking-wide text-muted">
                  {METHOD_LABELS[m] ?? m}
                </div>
                <div className="mt-1 text-lg text-ink">{inr(amt)}</div>
              </div>
            ))}
            <div className="ml-auto">
              <div className="text-xs uppercase tracking-wide text-muted">
                Total
              </div>
              <div className="mt-1 font-display text-lg text-forest">
                {inr(todayTotal)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expenses */}
      <h2 className="mt-10 font-display text-lg text-forest">Expenses</h2>
      <form
        action={createExpense}
        className="mt-3 grid items-end gap-3 rounded-xl border border-sand bg-white p-4 sm:grid-cols-[1.3fr_1fr_1fr_1.5fr_auto]"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Category
          </label>
          <select
            name="categoryId"
            required
            className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Mini label="Amount ₹" name="amount" type="number" />
        <Mini label="Date" name="date" type="date" defaultValue={todayStr} />
        <Mini label="Vendor / note" name="vendor" />
        <button className="rounded-full bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">
          Add
        </button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-white">
        {recentExpenses.length === 0 ? (
          <p className="p-5 text-sm text-muted">No expenses recorded.</p>
        ) : (
          <ul className="divide-y divide-sand text-sm">
            {recentExpenses.map((e) => (
              <li key={e.id} className="flex justify-between px-5 py-3">
                <span className="text-ink">
                  {e.category.name}
                  {e.vendor ? ` · ${e.vendor}` : ""}
                </span>
                <span className="flex gap-4">
                  <span className="text-ink">{inr(e.amount)}</span>
                  <span className="text-xs text-muted">{dateOnly(e.date)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payouts */}
      <h2 className="mt-10 font-display text-lg text-forest">Staff payouts</h2>
      <form
        action={createPayout}
        className="mt-3 grid items-end gap-3 rounded-xl border border-sand bg-white p-4 sm:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Staff
          </label>
          <select
            name="providerId"
            required
            className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Mini label="From" name="periodStart" type="date" />
        <Mini label="To" name="periodEnd" type="date" />
        <Mini label="Amount ₹" name="amount" type="number" />
        <button className="rounded-full bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">
          Add
        </button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-white">
        {payouts.length === 0 ? (
          <p className="p-5 text-sm text-muted">No payouts yet.</p>
        ) : (
          <ul className="divide-y divide-sand text-sm">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <span className="text-ink">
                  {p.provider.name}{" "}
                  <span className="text-xs text-muted">
                    · {dateOnly(p.periodStart)} – {dateOnly(p.periodEnd)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-ink">{inr(p.amount)}</span>
                  <StatusBadge status={p.status} />
                  {p.status === "PENDING" && (
                    <form action={markPayoutPaid}>
                      <input type="hidden" name="payoutId" value={p.id} />
                      <button className="rounded-full border border-sand px-3 py-1 text-xs text-ink hover:border-gold">
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
