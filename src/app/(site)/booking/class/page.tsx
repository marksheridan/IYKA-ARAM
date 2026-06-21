import Link from "next/link";
import { prisma } from "@/lib/db";
import { bookClass } from "../actions";

export const metadata = { title: "Book a Yoga Class" };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  missing: "Please fill in your name and phone.",
  full: "Sorry, that class just filled up. Please pick another.",
  already: "You're already booked into that class.",
  notfound: "That class is no longer available.",
  server: "Something went wrong. Please try again.",
};

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ClassPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  const occurrences = await prisma.classOccurrence.findMany({
    where: { startsAt: { gte: new Date() }, status: "SCHEDULED" },
    orderBy: { startsAt: "asc" },
    include: { instructor: true, _count: { select: { enrollments: true } } },
    take: 12,
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/booking" className="text-sm text-muted hover:text-ink">
        ← All services
      </Link>
      <h1 className="mt-3 font-display text-3xl text-forest">
        Online Yoga Classes
      </h1>
      <p className="mt-1 text-muted">Reserve your seat in an upcoming class.</p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERRORS[error] ?? "Please try again."}
        </p>
      )}

      {occurrences.length === 0 ? (
        <p className="mt-8 rounded-xl border border-sand bg-white p-6 text-sm text-muted">
          No upcoming classes are scheduled right now.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {occurrences.map((o) => {
            const seatsLeft = o.capacity - o._count.enrollments;
            const full = seatsLeft <= 0;
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-sand bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg text-forest">
                      {o.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {o.startsAt.toLocaleString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}{" "}
                      · {o.durationMin} min · with {o.instructor.name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      full
                        ? "bg-sand text-muted"
                        : "bg-gold-soft text-forest"
                    }`}
                  >
                    {full ? "Full" : `${seatsLeft} seats left`}
                  </span>
                </div>

                {!full && (
                  <form
                    action={bookClass}
                    className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <input type="hidden" name="occurrenceId" value={o.id} />
                    <input
                      name="name"
                      required
                      placeholder="Full name *"
                      className="rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                    />
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Phone (WhatsApp) *"
                      className="rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-forest px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
                    >
                      Book seat
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
