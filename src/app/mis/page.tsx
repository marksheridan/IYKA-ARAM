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

function timeStr(d: Date) {
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function MisDashboard() {
  const user = await requireUser();
  const isStaff = user.role === "ADMIN" || user.role === "FRONT_DESK";

  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 6);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(todayStart.getDate() - i);
    days.push(d);
  }

  const header = (subtitle: React.ReactNode) => (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-forest">
          {greeting}, {user.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <Link
        href="/mis/finance"
        className="rounded-full border border-sand bg-white px-4 py-2 text-sm text-forest transition-colors hover:border-forest"
      >
        View Reports
      </Link>
    </div>
  );

  /* ── Doctor: one concurrent batch ───────────────────────────── */
  if (!isStaff) {
    const scope = { providerId: user.staffId ?? "__none__" };
    const [todayCount, queue, seenToday] = await Promise.all([
      prisma.appointment.count({
        where: { ...scope, startsAt: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
      }),
      prisma.appointment.findMany({
        where: {
          ...scope,
          startsAt: { gte: todayStart, lte: todayEnd },
          status: { in: ["REQUESTED", "CONFIRMED", "CHECKED_IN"] },
        },
        include: { patient: true, service: true, provider: true },
        orderBy: { startsAt: "asc" },
        take: 8,
      }),
      prisma.appointment.count({
        where: { ...scope, startsAt: { gte: todayStart, lte: todayEnd }, status: "COMPLETED" },
      }),
    ]);

    return (
      <div>
        {header(
          `${todayCount} appointment${todayCount === 1 ? "" : "s"} today · ${todayStart.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`,
        )}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Kpi label="Your appointments today" value={todayCount} icon={<ICalendar />} />
          <Kpi label="In queue" value={queue.length} icon={<IUsers />} />
          <Kpi label="Completed today" value={seenToday} icon={<IDoc />} />
        </div>
        <div className="mt-4">
          <QueueCard title="Your upcoming queue" queue={queue} action="Open" />
        </div>
      </div>
    );
  }

  /* ── Staff (admin / front-desk): one concurrent batch ───────── */
  const [
    todayCount,
    patientCount,
    queue,
    providers,
    revAgg,
    outstandingInvoices,
    pendingInvoices,
    missed,
    weekAppts,
    weekPayments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { startsAt: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.patient.count(),
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: todayStart, lte: todayEnd },
        status: { in: ["REQUESTED", "CONFIRMED", "CHECKED_IN"] },
      },
      include: { patient: true, service: true, provider: true },
      orderBy: { startsAt: "asc" },
      take: 6,
    }),
    prisma.staff.findMany({
      where: { isActive: true, type: { in: ["DOCTOR", "THERAPIST", "NUTRITIONIST"] } },
      select: {
        id: true,
        name: true,
        type: true,
        appointments: {
          where: { startsAt: { gte: todayStart, lte: todayEnd } },
          select: { status: true, patient: { select: { name: true } } },
          orderBy: { startsAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: monthStart } } }),
    prisma.invoice.findMany({
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
      select: { total: true, payments: { select: { amount: true } } },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        patient: { select: { name: true } },
        payments: { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { startsAt: { gte: todayStart, lte: todayEnd }, status: "NO_SHOW" },
      include: { patient: true },
      orderBy: { startsAt: "desc" },
      take: 5,
    }),
    prisma.appointment.findMany({ where: { startsAt: { gte: weekStart } }, select: { startsAt: true } }),
    prisma.payment.findMany({ where: { paidAt: { gte: weekStart } }, select: { paidAt: true, amount: true } }),
  ]);

  const monthRevenue = Number(revAgg._sum.amount ?? 0);
  const outstanding = outstandingInvoices.reduce((s, inv) => {
    const paid = inv.payments.reduce((a, p) => a + Number(p.amount), 0);
    return s + (Number(inv.total) - paid);
  }, 0);
  const onDuty = providers.filter((p) => p.appointments.length > 0).length;

  const apptSeries = days.map((d) => ({
    label: d.toLocaleDateString("en-IN", { weekday: "short" }),
    value: weekAppts.filter((a) => sameDay(a.startsAt, d)).length,
  }));
  const revSeries = days.map((d) => ({
    label: d.toLocaleDateString("en-IN", { weekday: "short" }),
    value: weekPayments.filter((p) => sameDay(p.paidAt, d)).reduce((s, p) => s + Number(p.amount), 0),
  }));

  return (
    <div>
      {header(
        `${todayCount} appointment${todayCount === 1 ? "" : "s"} today · ${onDuty} provider${onDuty === 1 ? "" : "s"} on duty · ${todayStart.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`,
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Today's Appointments" value={todayCount} icon={<ICalendar />} />
        <Kpi label="Revenue · this month" value={inr(monthRevenue)} icon={<IRupee />} />
        <Kpi label="Total Patients" value={patientCount} icon={<IUsers />} />
        <Kpi label="Outstanding" value={inr(outstanding)} icon={<IDoc />} accent />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Providers on duty" href="/mis/doctors" linkLabel="View all staff">
          {providers.length === 0 ? (
            <Empty>No active providers.</Empty>
          ) : (
            <ul className="divide-y divide-sand">
              {providers.map((p) => {
                const serving = p.appointments.find((a) => a.status === "CHECKED_IN");
                const todayN = p.appointments.length;
                return (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft font-display text-sm text-forest">
                        {p.name.charAt(0)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-ink">{p.name}</div>
                        <div className="text-xs capitalize text-muted">
                          {p.type.toLowerCase()}
                          {serving ? ` · seeing ${serving.patient.name}` : todayN ? ` · ${todayN} today` : " · free"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        serving ? "bg-sage/30 text-forest" : todayN ? "bg-gold-soft text-forest" : "bg-sand text-muted"
                      }`}
                    >
                      {serving ? "Serving" : todayN ? "On duty" : "Free"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <QueueCard title="Upcoming queue" queue={queue} action="Manage" />

        <Card title="Pending checkout" href="/mis/billing" linkLabel="View billing">
          {pendingInvoices.length === 0 ? (
            <Empty>No unpaid invoices.</Empty>
          ) : (
            <ul className="divide-y divide-sand">
              {pendingInvoices.map((inv) => {
                const paid = inv.payments.reduce((a, p) => a + Number(p.amount), 0);
                const balance = Number(inv.total) - paid;
                return (
                  <li key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium text-ink">{inv.patient.name}</div>
                      <div className="text-xs text-muted">{inv.number} · balance {inr(balance)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inv.status} />
                      <Link href={`/mis/billing/${inv.id}`} className="text-xs text-gold hover:text-forest">
                        Settle →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Missed today" href="/mis/appointments" linkLabel="View all">
          {missed.length === 0 ? (
            <Empty>No missed appointments today. 🎉</Empty>
          ) : (
            <ul className="divide-y divide-sand">
              {missed.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-ink">{a.patient.name}</div>
                    <div className="text-xs text-muted">missed at {timeStr(a.startsAt)}</div>
                  </div>
                  <Link
                    href={`/mis/appointments/${a.id}`}
                    className="rounded-full border border-sand px-3 py-1 text-xs text-forest transition-colors hover:border-forest"
                  >
                    Reschedule
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Chart title="Appointments · last 7 days" data={apptSeries} />
        <Chart title="Revenue · last 7 days" data={revSeries} money />
      </div>
    </div>
  );
}

/* ───────────────────────── components ───────────────────────── */

type QueueAppt = {
  id: string;
  startsAt: Date;
  status: string;
  patient: { name: string };
  service: { name: string };
  provider: { name: string } | null;
};

function QueueCard({ title, queue, action }: { title: string; queue: QueueAppt[]; action: string }) {
  return (
    <Card title={title} href="/mis/appointments" linkLabel="View all">
      {queue.length === 0 ? (
        <Empty>No patients in the queue.</Empty>
      ) : (
        <ul className="divide-y divide-sand">
          {queue.map((a, i) => (
            <li key={a.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-display text-sm text-muted">{i + 1}</span>
                <div>
                  <div className="text-sm font-medium text-ink">{a.patient.name}</div>
                  <div className="text-xs text-muted">
                    {timeStr(a.startsAt)} · {a.service.name}
                    {a.provider ? ` · ${a.provider.name}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                <Link href={`/mis/appointments/${a.id}`} className="text-xs text-gold hover:text-forest">
                  {action} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Card({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-forest">{title}</h2>
        {href && linkLabel && (
          <Link href={href} className="text-xs text-gold hover:text-forest">
            {linkLabel}
          </Link>
        )}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
        {icon && (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              accent ? "bg-gold-soft text-forest" : "bg-sand/70 text-forest"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-2xl text-ink">{value}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-sm text-muted">{children}</p>;
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
    <div className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{title}</div>
      <div className="mt-4 flex h-32 items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t bg-gold"
              style={{ height: `${Math.max(2, (d.value / max) * 88)}%` }}
              title={money ? inr(d.value) : String(d.value)}
            />
            <span className="text-[10px] text-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── icons ───────────────────────── */

function svg(path: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}
const ICalendar = () => svg("M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5");
const IUsers = () => svg("M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z");
const IRupee = () => svg("M6 6h12M6 9h12M9 18l6-6M6 12h3.75c2.071 0 3.75-1.679 3.75-3.75");
const IDoc = () => svg("M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z");
