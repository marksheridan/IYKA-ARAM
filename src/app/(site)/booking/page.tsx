import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Book an Appointment" };
export const dynamic = "force-dynamic";

export default async function BookingHome() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Booking</p>
      <h1 className="mt-3 font-display text-3xl text-forest sm:text-4xl">
        Begin your wellness journey
      </h1>
      <p className="mt-3 text-muted">Choose a service to get started.</p>

      {services.length === 0 ? (
        <p className="mt-10 rounded-xl border border-sand bg-white p-6 text-sm text-muted">
          No services are configured yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((s) => {
            const href =
              s.type === "YOGA_CLASS"
                ? "/booking/class"
                : `/booking/appointment?serviceId=${s.id}`;
            return (
              <Link
                key={s.id}
                href={href}
                className="group flex flex-col rounded-2xl border border-sand bg-cream p-7 transition-colors hover:border-gold"
              >
                <h2 className="font-display text-xl text-forest">{s.name}</h2>
                {s.description && (
                  <p className="mt-2 flex-1 text-sm text-muted">
                    {s.description}
                  </p>
                )}
                <p className="mt-4 text-sm font-medium text-ink">
                  ₹{Number(s.price).toLocaleString("en-IN")} · {s.durationMin} min
                </p>
                <span className="mt-4 text-sm text-gold group-hover:text-forest">
                  Book →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
