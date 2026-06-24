import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Pagination } from "@/components/mis/pagination";
import { AppointmentsTabs } from "@/components/mis/appointments-tabs";
import { StatusSelect } from "@/components/mis/status-select";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments · Manage" };

const PAGE_SIZE = 20;
const STATUSES = ["REQUESTED", "CONFIRMED", "CHECKED_IN", "IN_CONSULTATION", "COMPLETED", "NO_SHOW", "CANCELLED"];

type SP = Promise<{ [key: string]: string | string[] | undefined }>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

export default async function AppointmentsManage({ searchParams }: { searchParams: SP }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = str(sp.q);
  const doctor = str(sp.doctor);
  const date = str(sp.date);
  const status = str(sp.status);
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.AppointmentWhereInput = {};
  if (user.role === "DOCTOR") where.providerId = user.staffId ?? "__none__";
  else if (doctor) where.providerId = doctor;
  if (status && STATUSES.includes(status)) where.status = status as Prisma.AppointmentWhereInput["status"];
  if (q) where.patient = { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] };
  if (date) {
    const d0 = new Date(`${date}T00:00:00`);
    const d1 = new Date(`${date}T23:59:59`);
    if (!Number.isNaN(d0.getTime())) where.startsAt = { gte: d0, lte: d1 };
  }

  const [total, appts, providers] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: { patient: true, service: true, provider: true },
      orderBy: { startsAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.staff.findMany({ where: { isActive: true, type: { in: ["DOCTOR", "THERAPIST", "NUTRITIONIST"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (doctor) params.doctor = doctor;
  if (date) params.date = date;
  if (status) params.status = status;

  const inputCls = "rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold";

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">Appointments</h1>
      <div className="mt-4"><AppointmentsTabs /></div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[12rem]">
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Search</label>
          <input name="q" defaultValue={q} placeholder="Patient name or phone…" className={`${inputCls} w-full`} />
        </div>
        {user.role !== "DOCTOR" && (
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Doctor</label>
            <select name="doctor" defaultValue={doctor} className={inputCls}>
              <option value="">All</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Date</label>
          <input type="date" name="date" defaultValue={date} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Status</label>
          <select name="status" defaultValue={status} className={inputCls}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
          </select>
        </div>
        <button className="rounded-lg bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">Filter</button>
        {(q || doctor || date || status) && (
          <Link href="/mis/appointments/list" className="rounded-lg border border-sand px-4 py-2 text-sm text-muted hover:border-forest hover:text-forest">Clear</Link>
        )}
      </form>

      {/* List */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-sand bg-white">
        {appts.length === 0 ? (
          <p className="p-6 text-sm text-muted">No appointments match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Practitioner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id} className="border-t border-sand">
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {a.startsAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                  </td>
                  <td className="px-4 py-3 text-ink">{a.patient.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{a.patient.phone}</td>
                  <td className="px-4 py-3 text-muted">{a.service.name}</td>
                  <td className="px-4 py-3 text-muted">{a.provider?.name ?? "—"}</td>
                  <td className="px-4 py-3"><StatusSelect id={a.id} status={a.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/mis/appointments/${a.id}`} className="text-xs text-gold hover:text-forest">Manage →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} params={params} />
    </div>
  );
}
