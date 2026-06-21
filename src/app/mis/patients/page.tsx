import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patients" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  await requireUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { appointments: true, enrollments: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">Patients</h1>

      <form className="mt-5 flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or phone…"
          className="flex-1 rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        />
        <button className="rounded-lg bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
        {patients.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            {q ? "No patients match your search." : "No patients yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Classes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-t border-sand">
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.phone}</td>
                  <td className="px-4 py-3 text-muted">
                    {p._count.appointments}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p._count.enrollments}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/mis/patients/${p.id}`}
                      className="text-xs text-gold hover:text-forest"
                    >
                      View →
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
