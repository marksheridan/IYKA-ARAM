import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { Pagination } from "@/components/mis/pagination";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments" };

const PAGE_SIZE = 20;

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const scope =
    user.role === "DOCTOR" ? { providerId: user.staffId ?? "__none__" } : {};

  const [total, appts] = await Promise.all([
    prisma.appointment.count({ where: scope }),
    prisma.appointment.findMany({
      where: scope,
      include: { patient: true, service: true, provider: true },
      orderBy: { startsAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">Appointments</h1>
      <p className="mt-1 text-sm text-muted">
        {user.role === "DOCTOR"
          ? "Your consultations."
          : "All consultations and sessions."}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
        {appts.length === 0 ? (
          <p className="p-6 text-sm text-muted">No appointments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Patient</th>
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
                    {a.startsAt.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-4 py-3 text-ink">{a.patient.name}</td>
                  <td className="px-4 py-3 text-muted">{a.service.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {a.provider?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
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

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
