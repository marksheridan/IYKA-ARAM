import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { AppointmentsTabs } from "@/components/mis/appointments-tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments · Overview" };

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function timeStr(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

const STATUS_ORDER = ["REQUESTED", "CONFIRMED", "CHECKED_IN", "IN_CONSULTATION", "COMPLETED", "NO_SHOW", "CANCELLED"] as const;
const STATUS_COLOR: Record<string, string> = {
  REQUESTED: "bg-sand",
  CONFIRMED: "bg-gold-soft",
  CHECKED_IN: "bg-sage/50",
  IN_CONSULTATION: "bg-blue-300",
  COMPLETED: "bg-forest",
  NO_SHOW: "bg-red-300",
  CANCELLED: "bg-red-400",
};

export default async function AppointmentsOverview() {
  const user = await requireUser();
  const scope = user.role === "DOCTOR" ? { providerId: user.staffId ?? "__none__" } : {};

  const now = new Date();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const trendStart = new Date(todayStart); trendStart.setDate(todayStart.getDate() - 13);

  const [
    todayCount,
    upcomingCount,
    completedMonth,
    cancelledMonth,
    noShowMonth,
    trend,
    workloadGroups,
    statusGroups,
    providers,
    todayQueue,
  ] = await Promise.all([
    prisma.appointment.count({ where: { ...scope, startsAt: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } } }),
    prisma.appointment.count({ where: { ...scope, startsAt: { gt: now }, status: { in: ["REQUESTED", "CONFIRMED"] } } }),
    prisma.appointment.count({ where: { ...scope, startsAt: { gte: monthStart }, status: "COMPLETED" } }),
    prisma.appointment.count({ where: { ...scope, startsAt: { gte: monthStart }, status: "CANCELLED" } }),
    prisma.appointment.count({ where: { ...scope, startsAt: { gte: monthStart }, status: "NO_SHOW" } }),
    prisma.appointment.findMany({ where: { ...scope, startsAt: { gte: trendStart } }, select: { startsAt: true } }),
    prisma.appointment.groupBy({ by: ["providerId"], where: { ...scope, startsAt: { gte: monthStart }, status: { notIn: ["CANCELLED"] } }, _count: true }),
    prisma.appointment.groupBy({ by: ["status"], where: { ...scope, startsAt: { gte: monthStart } }, _count: true }),
    prisma.staff.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    prisma.appointment.findMany({
      where: { ...scope, startsAt: { gte: todayStart, lte: todayEnd } },
      include: { patient: true, service: true, provider: true },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  // trend: 14-day series
  const days: Date[] = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(todayStart); d.setDate(todayStart.getDate() - i); days.push(d); }
  const trendSeries = days.map((d) => ({
    label: d.getDate().toString(),
    value: trend.filter((a) => sameDay(a.startsAt, d)).length,
  }));

  // doctor workload
  const nameOf = (id: string | null) => providers.find((p) => p.id === id)?.name ?? "Unassigned";
  const workload = workloadGroups
    .map((g) => ({ label: nameOf(g.providerId), value: g._count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // status distribution
  const statusCounts: Record<string, number> = {};
  for (const g of statusGroups) statusCounts[g.status] = g._count;
  const statusData = STATUS_ORDER.filter((s) => statusCounts[s]).map((s) => ({ label: s, value: statusCounts[s] }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-forest">Appointments</h1>
      </div>
      <div className="mt-4">
        <AppointmentsTabs />
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Today" value={todayCount} />
        <Kpi label="Upcoming" value={upcomingCount} />
        <Kpi label="Completed · month" value={completedMonth} />
        <Kpi label="Cancelled · month" value={cancelledMonth} />
        <Kpi label="No-shows · month" value={noShowMonth} accent />
      </div>

      {/* Trend — full width */}
      <Card title="Appointments · last 14 days" className="mt-4">
        <div className="mt-2 flex h-32 items-end gap-1.5">
          {trendSeries.map((d, i) => {
            const max = Math.max(1, ...trendSeries.map((x) => x.value));
            return (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div className="w-full rounded-t bg-gold" style={{ height: `${Math.max(2, (d.value / max) * 88)}%` }} title={`${d.value}`} />
                <span className="text-[9px] text-muted">{d.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Status distribution + doctor workload */}
      {user.role !== "DOCTOR" ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Status distribution · this month">
            {statusData.length === 0 ? <Empty>No appointments this month.</Empty> : <HBars data={statusData} colored />}
          </Card>
          <Card title="Doctor workload · this month">
            {workload.length === 0 ? <Empty>No appointments this month.</Empty> : <HBars data={workload} />}
          </Card>
        </div>
      ) : (
        <Card title="Status distribution · this month" className="mt-4">
          {statusData.length === 0 ? <Empty>No appointments this month.</Empty> : <HBars data={statusData} colored />}
        </Card>
      )}

      {/* Today's queue */}
      <div className="mt-4">
        <Card title="Today's queue" href="/mis/appointments/list" linkLabel="Open management">
          {todayQueue.length === 0 ? (
            <Empty>No appointments scheduled for today.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Patient</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Practitioner</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {todayQueue.map((a) => (
                    <tr key={a.id} className="border-t border-sand">
                      <td className="whitespace-nowrap py-2.5 pr-4 text-ink">{timeStr(a.startsAt)}</td>
                      <td className="py-2.5 pr-4 text-ink">{a.patient.name}</td>
                      <td className="py-2.5 pr-4 text-muted">{a.service.name}</td>
                      <td className="py-2.5 pr-4 text-muted">{a.provider?.name ?? "—"}</td>
                      <td className="py-2.5 pr-4"><StatusBadge status={a.status} /></td>
                      <td className="whitespace-nowrap py-2.5 text-right">
                        <Link href={`/mis/appointments/${a.id}`} className="text-xs text-gold hover:text-forest">Manage →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-2 font-display text-2xl ${accent && value > 0 ? "text-red-600" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function Card({ title, href, linkLabel, className, children }: { title: string; href?: string; linkLabel?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-sand bg-white p-5 shadow-sm ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-forest">{title}</h2>
        {href && linkLabel && <Link href={href} className="text-xs text-gold hover:text-forest">{linkLabel}</Link>}
      </div>
      {children}
    </section>
  );
}

function HBars({ data, colored }: { data: { label: string; value: number }[]; colored?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="mt-3 space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-xs capitalize text-muted">{d.label.replace(/_/g, " ").toLowerCase()}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-sand/50">
            <div
              className={`h-full rounded ${colored ? STATUS_COLOR[d.label] ?? "bg-gold" : "bg-gold"}`}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs text-ink">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-sm text-muted">{children}</p>;
}
