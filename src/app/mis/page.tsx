import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · IYKA MIS" };

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ─── tiny inline sparkline — smooth cubic bezier ─── */
function Sparkline({
  data,
  color = "var(--color-mis-blue)",
  areaColor,
}: {
  data: number[];
  color?: string;
  areaColor?: string;
}) {
  const W = 100, H = 40, pad = 5;
  const max = Math.max(1, ...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));

  // Smooth cubic bezier: horizontal control points between each pair
  let linePath = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i];
    const cpx = (p.x + c.x) / 2;
    linePath += ` C ${cpx},${p.y} ${cpx},${c.y} ${c.x},${c.y}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={100} height={40} style={{ flexShrink: 0 }}>
      {areaColor && (
        <path d={areaPath} fill={areaColor} opacity="0.15" />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── KPI card ─── */
function KpiCard({
  label,
  value,
  sub,
  trend,
  sparkData,
  icon,
  accentColor = "var(--color-mis-blue)",
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { pct: string; up: boolean };
  sparkData?: number[];
  icon: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      className="mis-card flex flex-col justify-between p-5"
      style={{ minHeight: 140 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}
          >
            {icon}
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--color-mis-text-muted)" }}>
            {label}
          </span>
        </div>
        <button className="flex h-6 w-6 items-center justify-center rounded" style={{ color: "var(--color-mis-text-soft)" }} aria-label="More">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
          </svg>
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-mis-text)", fontVariantNumeric: "tabular-nums" }}>
            {value}
          </div>
          {trend && (
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: trend.up ? "var(--color-mis-success)" : "var(--color-mis-danger)" }}>
              {trend.up
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              }
              {trend.pct}
            </div>
          )}
          {sub && (
            <div className="mt-1 text-xs leading-tight" style={{ color: "var(--color-mis-text-soft)", maxWidth: 140 }}>
              {sub}
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline
            data={sparkData}
            color={trend?.up === false ? "var(--color-mis-danger)" : accentColor}
            areaColor={trend?.up === false ? "var(--color-mis-danger)" : accentColor}
          />
        )}
      </div>
    </div>
  );
}

/* ─── bar chart card ─── */
function BarChart({
  title,
  data,
  money,
  rightSlot,
}: {
  title: string;
  data: { label: string; value: number }[];
  money?: boolean;
  rightSlot?: React.ReactNode;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="mis-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: "var(--color-mis-text)" }}>
          {title}
        </span>
        {rightSlot}
      </div>
      <div className="mt-5 flex h-36 items-end gap-2">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isMax = d.value === max;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5" title={money ? inr(d.value) : String(d.value)}>
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-lg transition-all duration-300"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    background: isMax
                      ? "var(--color-mis-blue)"
                      : "var(--color-mis-blue-light)",
                  }}
                />
              </div>
              <span className="text-[10px] font-medium" style={{ color: "var(--color-mis-text-soft)" }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── section header ─── */
function SectionHeader({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--color-mis-text)" }}>
          {title}
        </h2>
        {sub && <p className="mt-0.5 text-xs" style={{ color: "var(--color-mis-text-soft)" }}>{sub}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs font-medium"
          style={{ color: "var(--color-mis-blue)" }}
        >
          See all →
        </Link>
      )}
    </div>
  );
}

export default async function MisDashboard() {
  const user = await requireUser();
  const isStaff = user.role === "ADMIN" || user.role === "FRONT_DESK";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
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
      take: 8,
    }),
  ]);

  const dateLabel = todayStart.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-mis-text)", letterSpacing: "-0.02em" }}>
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>
            {dateLabel}
          </p>
        </div>
        <Link
          href="/mis/appointments"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--color-mis-blue)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          New Appointment
        </Link>
      </div>

      {isStaff ? (
        <StaffView
          todayCount={todayCount}
          patientCount={patientCount}
          monthStart={monthStart}
          weekStart={weekStart}
          todayStart={todayStart}
          todays={todays}
        />
      ) : (
        <DoctorView todayCount={todayCount} patientCount={patientCount} todays={todays} />
      )}
    </div>
  );
}

/* ─── Doctor view ─── */
function DoctorView({
  todayCount,
  patientCount,
  todays,
}: {
  todayCount: number;
  patientCount: number;
  todays: Awaited<ReturnType<typeof getTodayAppts>>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Today's Appointments"
          value={todayCount}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <KpiCard
          label="Total Patients"
          value={patientCount}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>
      <AppointmentTable rows={todays} />
    </div>
  );
}

/* ─── Staff / Admin view ─── */
async function StaffView({
  todayCount,
  patientCount,
  monthStart,
  weekStart,
  todayStart,
  todays,
}: {
  todayCount: number;
  patientCount: number;
  monthStart: Date;
  weekStart: Date;
  todayStart: Date;
  todays: Awaited<ReturnType<typeof getTodayAppts>>;
}) {
  const [revAgg, expAgg, newLeads, completedMonth, newPatientsMonth, outstandingInvoices, weekAppts, weekPayments] =
    await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: monthStart } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.appointment.count({ where: { status: "COMPLETED", startsAt: { gte: monthStart } } }),
      prisma.patient.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.invoice.findMany({
        where: { OR: [{ status: "ISSUED" }, { status: "PARTIALLY_PAID" }] },
        select: { total: true, payments: { select: { amount: true } } },
      }),
      prisma.appointment.findMany({ where: { startsAt: { gte: weekStart } }, select: { startsAt: true } }),
      prisma.payment.findMany({ where: { paidAt: { gte: weekStart } }, select: { paidAt: true, amount: true } }),
    ]);

  const monthRevenue = Number(revAgg._sum.amount ?? 0);
  const monthExpenses = Number(expAgg._sum.amount ?? 0);
  const net = monthRevenue - monthExpenses;
  const outstanding = outstandingInvoices.reduce((s, inv) => {
    const paid = inv.payments.reduce((a, p) => a + Number(p.amount), 0);
    return s + (Number(inv.total) - paid);
  }, 0);

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
    value: weekPayments.filter((p) => sameDay(p.paidAt, d)).reduce((s, p) => s + Number(p.amount), 0),
  }));

  const apptSparkData = apptSeries.map((d) => d.value);
  const revSparkData = revSeries.map((d) => d.value);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Today's Appointments"
          value={todayCount}
          sparkData={apptSparkData}
          sub="Scheduled for today"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
        />
        <KpiCard
          label="Total Patients"
          value={patientCount}
          sub={`+${newPatientsMonth} new this month`}
          trend={{ pct: `+${newPatientsMonth} new`, up: true }}
          sparkData={[patientCount - newPatientsMonth * 3, patientCount - newPatientsMonth * 2, patientCount - newPatientsMonth, patientCount]}
          accentColor="var(--color-mis-purple)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <KpiCard
          label="Revenue (this month)"
          value={inr(monthRevenue)}
          sub={`Net P&L: ${inr(net)}`}
          trend={{ pct: `Net ${net >= 0 ? "+" : ""}${inr(net)}`, up: net >= 0 }}
          sparkData={revSparkData}
          accentColor="var(--color-mis-success)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <KpiCard
          label="New Leads"
          value={newLeads}
          sub="Awaiting follow-up"
          accentColor="var(--color-mis-warning)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
      </div>

      {/* Charts + secondary KPIs */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChart
            title="Appointments · last 7 days"
            data={apptSeries}
            rightSlot={
              <span className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "var(--color-mis-blue-subtle)", color: "var(--color-mis-blue)" }}>
                This week
              </span>
            }
          />
        </div>
        <div className="grid grid-rows-2 gap-4">
          <div className="mis-card p-4">
            <div className="text-xs font-medium" style={{ color: "var(--color-mis-text-soft)" }}>Outstanding invoices</div>
            <div className="mt-1.5 text-xl font-bold" style={{ color: "var(--color-mis-text)" }}>{inr(outstanding)}</div>
            <Link href="/mis/billing" className="mt-2 block text-xs font-medium" style={{ color: "var(--color-mis-blue)" }}>
              View billing →
            </Link>
          </div>
          <div className="mis-card p-4">
            <div className="text-xs font-medium" style={{ color: "var(--color-mis-text-soft)" }}>Completed this month</div>
            <div className="mt-1.5 text-xl font-bold" style={{ color: "var(--color-mis-text)" }}>{completedMonth}</div>
            <div className="mt-2 text-xs" style={{ color: "var(--color-mis-text-soft)" }}>appointments</div>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <BarChart
        title="Revenue · last 7 days"
        data={revSeries}
        money
        rightSlot={
          <span className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--color-mis-success) 12%, transparent)", color: "var(--color-mis-success)" }}>
            This week
          </span>
        }
      />

      {/* Appointments table */}
      <AppointmentTable rows={todays} />
    </div>
  );
}

/* ─── helpers for type inference ─── */
async function getTodayAppts() {
  return prisma.appointment.findMany({
    where: {},
    include: { patient: true, service: true, provider: true },
    orderBy: { startsAt: "asc" },
    take: 8,
  });
}

/* ─── appointment table ─── */
function AppointmentTable({
  rows,
}: {
  rows: {
    id: string;
    startsAt: Date;
    status: string;
    patient: { name: string };
    service: { name: string };
    provider: { name: string } | null;
  }[];
}) {
  return (
    <div>
      <SectionHeader
        title="Today's Schedule"
        sub="Upcoming appointments overview for today"
        href="/mis/appointments"
      />
      <div className="mis-card mt-3 overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "var(--color-mis-blue-subtle)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-mis-blue)" }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--color-mis-text)" }}>No appointments today</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-mis-text-soft)" }}>
              Schedule is clear for today.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-mis-border-soft)", background: "var(--color-mis-bg)" }}>
                {["Time", "Patient", "Provider", "Service", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-mis-text-soft)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a, idx) => (
                <tr
                  key={a.id}
                  style={{
                    borderTop: idx === 0 ? undefined : `1px solid var(--color-mis-border-soft)`,
                  }}
                  className="transition-colors hover:bg-[var(--color-mis-bg)]"
                >
                  <td className="px-4 py-3.5 font-medium tabular-nums" style={{ color: "var(--color-mis-text)" }}>
                    {a.startsAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ background: "var(--color-mis-blue)" }}
                      >
                        {a.patient.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: "var(--color-mis-text)" }}>{a.patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5" style={{ color: "var(--color-mis-text-muted)" }}>
                    {a.provider?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5" style={{ color: "var(--color-mis-text-muted)" }}>
                    {a.service.name}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/mis/appointments/${a.id}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{
                        background: "var(--color-mis-blue-subtle)",
                        color: "var(--color-mis-blue)",
                      }}
                    >
                      Manage
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
