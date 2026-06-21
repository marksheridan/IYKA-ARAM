import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAvailableSlots, getUpcomingDays } from "@/lib/booking";
import { bookAppointment } from "../actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  missing: "Please fill in your name, phone and pick a time.",
  taken: "Sorry, that slot was just taken. Please pick another.",
  server: "Something went wrong. Please try again.",
};

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const serviceId = typeof sp.serviceId === "string" ? sp.serviceId : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  const service = serviceId
    ? await prisma.service.findUnique({
        where: { id: serviceId },
        include: { providers: { where: { isActive: true } } },
      })
    : null;

  if (!service) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-2xl text-forest">Service not found</h1>
        <Link href="/booking" className="mt-4 inline-block text-gold">
          ← Back to booking
        </Link>
      </section>
    );
  }

  const providers = service.providers;
  let providerId = typeof sp.providerId === "string" ? sp.providerId : "";
  if (!providerId && providers.length === 1) providerId = providers[0].id;
  const date = typeof sp.date === "string" ? sp.date : "";

  const days = getUpcomingDays(14);
  const slots =
    providerId && date
      ? await getAvailableSlots({
          providerId,
          serviceDurationMin: service.durationMin,
          date,
        })
      : [];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/booking" className="text-sm text-muted hover:text-ink">
        ← All services
      </Link>
      <h1 className="mt-3 font-display text-3xl text-forest">{service.name}</h1>
      <p className="mt-1 text-muted">
        ₹{Number(service.price).toLocaleString("en-IN")} · {service.durationMin}{" "}
        min
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERRORS[error] ?? "Please try again."}
        </p>
      )}

      {/* Step 1 — provider */}
      {providers.length > 1 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink">1 · Choose a practitioner</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {providers.map((p) => (
              <Link
                key={p.id}
                href={`/booking/appointment?serviceId=${serviceId}&providerId=${p.id}`}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  providerId === p.id
                    ? "border-forest bg-forest text-cream"
                    : "border-sand bg-white text-ink hover:border-gold"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — date */}
      {providerId && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink">
            {providers.length > 1 ? "2" : "1"} · Choose a day
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {days.map((d) => (
              <Link
                key={d.value}
                href={`/booking/appointment?serviceId=${serviceId}&providerId=${providerId}&date=${d.value}`}
                className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                  date === d.value
                    ? "border-forest bg-forest text-cream"
                    : "border-sand bg-white text-ink hover:border-gold"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — slot + details */}
      {providerId && date && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink">
            {providers.length > 1 ? "3" : "2"} · Pick a time &amp; confirm
          </h2>

          {slots.length === 0 ? (
            <p className="mt-3 rounded-lg border border-sand bg-white p-4 text-sm text-muted">
              No times available on this day. Please choose another.
            </p>
          ) : (
            <form action={bookAppointment} className="mt-4 space-y-5">
              <input type="hidden" name="serviceId" value={serviceId} />
              <input type="hidden" name="providerId" value={providerId} />

              <div className="flex flex-wrap gap-2">
                {slots.map((s, i) => (
                  <label
                    key={s.value}
                    className="cursor-pointer rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-cream"
                  >
                    <input
                      type="radio"
                      name="startsAt"
                      value={s.value}
                      defaultChecked={i === 0}
                      className="sr-only"
                    />
                    {s.label}
                  </label>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" name="name" required />
                <Input label="Phone (WhatsApp)" name="phone" type="tel" required />
              </div>
              <Input label="Email (optional)" name="email" type="email" />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Reason for visit (optional)
                </label>
                <textarea
                  name="reason"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-gold px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-forest hover:text-cream"
              >
                Confirm booking
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

function Input({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </div>
  );
}
