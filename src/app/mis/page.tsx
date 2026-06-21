import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "MIS Dashboard" };

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function MisDashboard() {
  const user = await requireUser();
  const isStaff = user.role === "ADMIN" || user.role === "FRONT_DESK";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    1,
  );
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 6);

  const apptScope =
    user.role === "DOCTOR" ? { providerId: user.staffId ?? "__none__" } : {};

  const [todayCount, patientCount, todays] = await Promise.all([
    prisma.appointment.count({
      where: {
        ...apptScope,
        startsAt: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.patient.count(),
    prisma.appointment.findMany({
      where: { ...apptScope, startsAt: { gte: todayStart, lte: todayEnd } },
      include: { patient: true, service: true, provider: true },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">
        Welcome, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {todayStart.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {isStaff ? (
        <StaffAnalytics
          todayCount={todayCount}
          patientCount={patientCount}
          monthStart={monthStart}
          weekStart={weekStart}
          todayStart={todayStart}
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Kpi label="Your appointments today" value={todayCount} />
          <Kpi label="Patients" value={patientCount} />
        </div>
      )}

      <h2 className="mt-10 font-display text-lg text-forest">
        Today&apos;s schedule
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-white">
        {todays.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            No appointments scheduled for today.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {todays.map((a) => (
                <tr key={a.id} className="border-t border-sand">
                  <td className="px-4 py-3 text-ink">
                    {a.startsAt.toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-4 py-3 text-ink">{a.patient.name}</td>
                  <td className="px-4 py-3 text-muted">{a.service.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/mis/appointments/${a.id}`}
                      className="text-xs text-gold hover:text-forest"
                    >
                      Manage →
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

async function StaffAnalytics({
  todayCount,
  patientCount,
  monthStart,
  weekStart,
  todayStart,
}: {
  todayCount: number;
  patientCount: number;
  monthStart: Date;
  weekStart: Date;
  todayStart: Date;
}) {
  const [
    revAgg,
    expAgg,
    newLeads,
    noShowMonth,
    completedMonth,
    newPatientsMonth,
    outstandingInvoices,
    upcomingOcc,
    leadGroups,
    weekAppts,
    weekPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: monthStart } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: monthStart } },
    }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.appointment.count({
      where: { status: "NO_SHOW", startsAt: { gte: monthStart } },
    }),
    prisma.appointment.count({
      where: { status: "COMPLETED", startsAt: { gte: monthStart } },
    }),
    prisma.patient.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.invoice.findMany({
      where: { OR: [{ status: "ISSUED" }, { status: "PARTIALLY_PAID" }] },
      select: { total: true, payments: { select: { amount: true } } },
    }),
    prisma.classOccurrence.findMany({
      where: { startsAt: { gte: new Date() }, status: "SCHEDULED" },
      select: { capacity: true, _count: { select: { enrollments: true } } },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.appointment.findMany({
      where: { startsAt: { gte: weekStart } },
      select: { startsAt: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: weekStart } },
      select: { paidAt: true, amount: true },
    }),
  ]);

  const monthRevenue = Number(revAgg._sum.amount ?? 0);
  const monthExpenses = Number(expAgg._sum.amount ?? 0);
  const net = monthRevenue - monthExpenses;
  const outstanding = outstandingInvoices.reduce((s, inv) => {
    const paid = inv.payments.reduce((a, p) => a + Number(p.amount), 0);
    return s + (Number(inv.total) - paid);
  }, 0);

  const capSum = upcomingOcc.reduce((s, o) => s + o.capacity, 0);
  const bookedSum = upcomingOcc.reduce((s, o) => s + o._count.enrollments, 0);
  const fillRate = capSum > 0 ? Math.round((bookedSum / capSum) * 100) : 0;

  const leadCounts: Record<string, number> = {};
  for (const g of leadGroups) leadCounts[g.status] = g._count;

  // 7-day series
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(todayStart.getDate() - i);
    days.push(d);
  }
  const apptSeries = days.map((d) => ({
    label: d.toLocaleDateString("en-IN", { weekday: "short" }),
    value: weekAppts.filter((a) => sameDay(a.startsAt, d)).length,
  }));
  const revSeries = days.map((d) => ({
    label: d.toLocaleDateString("en-IN", { weekday: "short" }),
    value: weekPayments
      .filter((p) => sameDay(p.paidAt, d))
      .reduce((s, p) => s + Number(p.amount), 0),
  }));

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Today's Appointments" value={todayCount} />
        <Kpi label="Revenue (this month)" value={inr(monthRevenue)} />
        <Kpi label="Patients" value={patientCount} />
        <Kpi label="New Leads" value={newLeads} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Chart title="Appointments · last 7 days" data={apptSeries} />
        <Chart title="Revenue · last 7 days" data={revSeries} money />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Net P&L (month)" value={inr(net)} />
        <Kpi label="Outstanding" value={inr(outstanding)} />
        <Kpi label="Completed (month)" value={completedMonth} />
        <Kpi label="No-shows (month)" value={noShowMonth} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="New patients (month)" value={newPatientsMonth} />
        <Kpi label="Yoga fill rate" value={`${fillRate}%`} />
        <Kpi label="Leads · contacted" value={leadCounts.CONTACTED ?? 0} />
        <Kpi label="Leads · converted" value={leadCounts.CONVERTED ?? 0} />
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-sand bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 font-display text-2xl text-ink">{value}</div>
    </div>
  );
}

function Chart({
  title,
  data,
  money,
}: {
  title: string;
  data: { label: string; value: number }[];
  money?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rounded-xl border border-sand bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{title}</div>
      <div className="mt-4 flex h-32 items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t bg-gold"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={money ? inr(d.value) : String(d.value)}
              />
            </div>
            <span className="text-[10px] text-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
