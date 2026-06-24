import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/booking";
import { quickRegisterPatient, createAppointmentStaff } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Appointment" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

const inputCls = "w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold";

export default async function NewAppointment({ searchParams }: { searchParams: SP }) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const sp = await searchParams;
  const phone = str(sp.phone);
  const patientId = str(sp.patientId);
  const serviceId = str(sp.serviceId);
  const providerId = str(sp.providerId);
  const date = str(sp.date);
  const error = str(sp.error);

  // Resolve the patient: explicit id, else phone lookup.
  const patient = patientId
    ? await prisma.patient.findUnique({ where: { id: patientId } })
    : phone
      ? await prisma.patient.findFirst({ where: { phone: { contains: phone } } })
      : null;

  const [services, providers] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true, type: { in: ["CONSULTATION", "OFFLINE_SESSION"] } }, orderBy: { name: "asc" } }),
    prisma.staff.findMany({ where: { isActive: true, type: { in: ["DOCTOR", "THERAPIST", "NUTRITIONIST"] } }, select: { id: true, name: true, type: true }, orderBy: { name: "asc" } }),
  ]);

  const selectedService = serviceId ? services.find((s) => s.id === serviceId) : null;
  const slots =
    patient && selectedService && providerId && date
      ? await getAvailableSlots({ providerId, serviceDurationMin: selectedService.durationMin, date })
      : null;

  // Build "carry" query so quick-register returns into the flow.
  const carryParts = [serviceId && `serviceId=${serviceId}`, providerId && `providerId=${providerId}`, date && `date=${date}`].filter(Boolean);
  const carry = carryParts.join("&");
  const pid = patient?.id ?? "";

  return (
    <div className="max-w-3xl">
      <Link href="/mis/appointments/list" className="text-sm text-muted hover:text-ink">← Appointments</Link>
      <h1 className="mt-2 font-display text-2xl text-forest">New appointment</h1>

      {/* STEP 1 — Patient (phone first) */}
      <Step n={1} title="Patient" done={!!patient}>
        {patient ? (
          <div className="flex items-center justify-between rounded-lg border border-sand bg-white p-4">
            <div>
              <div className="text-sm font-medium text-ink">{patient.name}</div>
              <div className="text-xs text-muted">{patient.phone}{patient.email ? ` · ${patient.email}` : ""}</div>
            </div>
            <Link href="/mis/appointments/new" className="text-xs text-gold hover:text-forest">Change</Link>
          </div>
        ) : (
          <>
            <form className="flex gap-2">
              <input name="phone" defaultValue={phone} placeholder="Patient phone number…" className={inputCls} />
              <button className="whitespace-nowrap rounded-lg bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">Search</button>
            </form>

            {phone && !patient && (
              <div className="mt-4 rounded-lg border border-gold-soft bg-cream p-4">
                <p className="text-sm text-ink">No patient found for <span className="font-medium">{phone}</span>. Register a new patient:</p>
                {error === "details" && <p className="mt-2 text-xs text-red-600">Please enter a name and a valid phone number.</p>}
                <form action={quickRegisterPatient} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="carry" value={carry} />
                  <input name="name" placeholder="Full name *" required className={inputCls} />
                  <input name="phone" defaultValue={phone} placeholder="Phone *" required className={inputCls} />
                  <select name="gender" className={inputCls} defaultValue="">
                    <option value="">Gender (optional)</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                  <input name="email" placeholder="Email (optional)" className={inputCls} />
                  <button className="rounded-lg bg-forest px-4 py-2 text-sm text-cream hover:bg-ink sm:col-span-2">Register &amp; continue</button>
                </form>
              </div>
            )}
          </>
        )}
      </Step>

      {/* STEP 2 — Service, doctor, date */}
      {patient && (
        <Step n={2} title="Service, doctor & date" done={!!(serviceId && providerId && date)}>
          <form className="grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="patientId" value={pid} />
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Service</label>
              <select name="serviceId" defaultValue={serviceId} className={inputCls} required>
                <option value="">Select…</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.durationMin}m)</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Doctor</label>
              <select name="providerId" defaultValue={providerId} className={inputCls} required>
                <option value="">Select…</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Date</label>
              <input type="date" name="date" defaultValue={date} className={inputCls} required />
            </div>
            <button className="rounded-lg bg-forest px-4 py-2 text-sm text-cream hover:bg-ink sm:col-span-3">Show available slots</button>
          </form>
        </Step>
      )}

      {/* STEP 3 — Slots */}
      {patient && selectedService && providerId && date && (
        <Step n={3} title="Pick a slot" done={false}>
          {error === "taken" && <p className="mb-3 text-xs text-red-600">That slot was just taken — please pick another.</p>}
          {!slots || slots.length === 0 ? (
            <p className="rounded-lg border border-sand bg-white p-4 text-sm text-muted">
              No available slots for this doctor on {date}. Try another date or doctor — booked, blocked and past times are hidden.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <form key={slot.value} action={createAppointmentStaff}>
                  <input type="hidden" name="patientId" value={pid} />
                  <input type="hidden" name="serviceId" value={serviceId} />
                  <input type="hidden" name="providerId" value={providerId} />
                  <input type="hidden" name="startsAt" value={slot.value} />
                  <button className="rounded-lg border border-sand bg-white px-3 py-2 text-sm text-forest transition-colors hover:border-forest hover:bg-gold-soft">
                    {slot.label}
                  </button>
                </form>
              ))}
            </div>
          )}
        </Step>
      )}
    </div>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${done ? "bg-forest text-cream" : "bg-gold-soft text-forest"}`}>
          {done ? "✓" : n}
        </span>
        <h2 className="text-sm font-medium text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
