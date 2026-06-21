import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";

export const dynamic = "force-dynamic";

export default async function PatientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { service: true, provider: true },
        orderBy: { startsAt: "desc" },
      },
      enrollments: {
        include: { occurrence: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) {
    return (
      <div>
        <h1 className="font-display text-2xl text-forest">Patient not found</h1>
        <Link href="/mis/patients" className="mt-4 inline-block text-gold">
          ← Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link href="/mis/patients" className="text-sm text-muted hover:text-ink">
        ← Patients
      </Link>
      <h1 className="mt-3 font-display text-2xl text-forest">{patient.name}</h1>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Info label="Phone" value={patient.phone} />
        <Info label="Email" value={patient.email ?? "—"} />
        <Info label="City" value={patient.city ?? "—"} />
        <Info
          label="WhatsApp consent"
          value={patient.consentWhatsApp ? "Yes" : "No"}
        />
      </div>

      <h2 className="mt-10 font-display text-lg text-forest">Appointments</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-sand bg-white">
        {patient.appointments.length === 0 ? (
          <p className="p-5 text-sm text-muted">No appointments.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {patient.appointments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <div>
                  <div className="text-ink">{a.service.name}</div>
                  <div className="text-xs text-muted">
                    {a.startsAt.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                    {a.provider ? ` · ${a.provider.name}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <Link
                    href={`/mis/appointments/${a.id}`}
                    className="text-xs text-gold hover:text-forest"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="mt-10 font-display text-lg text-forest">Yoga classes</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-sand bg-white">
        {patient.enrollments.length === 0 ? (
          <p className="p-5 text-sm text-muted">No class bookings.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {patient.enrollments.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <div>
                  <div className="text-ink">{e.occurrence.title}</div>
                  <div className="text-xs text-muted">
                    {e.occurrence.startsAt.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sand bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  );
}
