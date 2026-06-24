import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { setAppointmentStatus, addConsultationNote } from "../../actions";
import { createInvoiceFromAppointment } from "../../billing/actions";
import { getAvailableSlots } from "@/lib/booking";
import { rescheduleAppointment } from "../actions";

export const dynamic = "force-dynamic";

const ACTIONS = [
  { status: "CONFIRMED", label: "Confirm" },
  { status: "CHECKED_IN", label: "Check in" },
  { status: "IN_CONSULTATION", label: "Start consult" },
  { status: "COMPLETED", label: "Complete" },
  { status: "NO_SHOW", label: "No-show" },
  { status: "CANCELLED", label: "Cancel" },
];

export default async function AppointmentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const rdate = typeof sp.rdate === "string" ? sp.rdate : "";

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      service: true,
      provider: true,
      consultationNote: true,
    },
  });

  if (!appt) {
    return (
      <div>
        <h1 className="font-display text-2xl text-forest">Not found</h1>
        <Link href="/mis/appointments" className="mt-4 inline-block text-gold">
          ← Appointments
        </Link>
      </div>
    );
  }

  const isOwn = appt.providerId === user.staffId;
  if (user.role === "DOCTOR" && !isOwn) {
    return (
      <div>
        <h1 className="font-display text-2xl text-forest">Not available</h1>
        <p className="mt-2 text-sm text-muted">
          This appointment belongs to another practitioner.
        </p>
        <Link href="/mis/appointments" className="mt-4 inline-block text-gold">
          ← Appointments
        </Link>
      </div>
    );
  }

  const canNote = user.role === "ADMIN" || (user.role === "DOCTOR" && isOwn);
  const rslots =
    rdate && appt.providerId
      ? await getAvailableSlots({
          providerId: appt.providerId,
          serviceDurationMin: appt.service.durationMin,
          date: rdate,
        })
      : null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/mis/appointments"
        className="text-sm text-muted hover:text-ink"
      >
        ← Appointments
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-2xl text-forest">
          {appt.service.name}
        </h1>
        <StatusBadge status={appt.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Info label="Patient" value={appt.patient.name} />
        <Info label="Phone" value={appt.patient.phone} />
        <Info
          label="When"
          value={appt.startsAt.toLocaleString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        />
        <Info label="Practitioner" value={appt.provider?.name ?? "—"} />
        <Info label="Mode" value={appt.mode.toLowerCase()} />
        {appt.reason && <Info label="Reason" value={appt.reason} />}
      </div>

      {/* Status controls */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-ink">Update status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <form key={a.status} action={setAppointmentStatus}>
              <input type="hidden" name="id" value={appt.id} />
              <input type="hidden" name="status" value={a.status} />
              <button
                disabled={appt.status === a.status}
                className="rounded-full border border-sand bg-white px-4 py-2 text-xs text-ink transition-colors hover:border-gold disabled:opacity-40"
              >
                {a.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Reschedule */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-ink">Reschedule</h2>
        {sp.error === "taken" && (
          <p className="mt-2 text-xs text-red-600">That slot was just taken — pick another.</p>
        )}
        <form className="mt-3 flex gap-2">
          <input
            type="date"
            name="rdate"
            defaultValue={rdate}
            className="rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
          <button className="rounded-lg border border-sand bg-white px-4 py-2 text-sm text-forest hover:border-forest">
            Show slots
          </button>
        </form>
        {rslots && (
          <div className="mt-3">
            {rslots.length === 0 ? (
              <p className="text-sm text-muted">No available slots on {rdate} for {appt.provider?.name ?? "this provider"}.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rslots.map((slot) => (
                  <form key={slot.value} action={rescheduleAppointment}>
                    <input type="hidden" name="id" value={appt.id} />
                    <input type="hidden" name="startsAt" value={slot.value} />
                    <button className="rounded-lg border border-sand bg-white px-3 py-2 text-sm text-forest transition-colors hover:border-forest hover:bg-gold-soft">
                      {slot.label}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Billing */}
      {(user.role === "ADMIN" || user.role === "FRONT_DESK") && (
        <form action={createInvoiceFromAppointment} className="mt-6">
          <input type="hidden" name="appointmentId" value={appt.id} />
          <button className="rounded-full border border-gold bg-white px-5 py-2 text-sm text-forest transition-colors hover:bg-gold-soft">
            Create invoice for this appointment
          </button>
        </form>
      )}

      {/* Consultation note (EMR-lite) */}
      {canNote && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-ink">Consultation note</h2>
          <form
            action={addConsultationNote}
            className="mt-3 space-y-3 rounded-xl border border-sand bg-white p-5"
          >
            <input type="hidden" name="appointmentId" value={appt.id} />
            <Field
              label="Chief complaint"
              name="chiefComplaint"
              defaultValue={appt.consultationNote?.chiefComplaint ?? ""}
            />
            <TextArea
              label="Notes"
              name="notes"
              defaultValue={appt.consultationNote?.notes ?? ""}
            />
            <TextArea
              label="Advice"
              name="advice"
              defaultValue={appt.consultationNote?.advice ?? ""}
            />
            <button className="rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-ink">
              {appt.consultationNote ? "Update note" : "Save note"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sand bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm capitalize text-ink">{value}</div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        className="w-full resize-none rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}
