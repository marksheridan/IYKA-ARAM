import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  createClassSchedule,
  generateOccurrences,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yoga Sessions" };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function YogaPage({ searchParams }: { searchParams: SP }) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  const [schedules, occurrences, yogaServices, instructors] = await Promise.all([
    prisma.classSchedule.findMany({
      include: { instructor: true, service: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.classOccurrence.findMany({
      where: { startsAt: { gte: new Date() } },
      include: { instructor: true, _count: { select: { enrollments: true } } },
      orderBy: { startsAt: "asc" },
      take: 30,
    }),
    prisma.service.findMany({ where: { type: "YOGA_CLASS", isActive: true } }),
    prisma.staff.findMany({ where: { type: "INSTRUCTOR", isActive: true } }),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-forest">Yoga Sessions</h1>
        <form action={generateOccurrences}>
          <button className="rounded-full border border-sand bg-white px-4 py-2 text-xs text-ink hover:border-gold">
            Generate upcoming sessions
          </button>
        </form>
      </div>

      {error === "missing" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please fill in the title, service, instructor and at least one day.
        </p>
      )}

      {/* Schedules */}
      <h2 className="mt-8 font-display text-lg text-forest">Class schedules</h2>
      <div className="mt-3 space-y-3">
        {schedules.length === 0 ? (
          <p className="rounded-xl border border-sand bg-white p-5 text-sm text-muted">
            No schedules yet. Create one below.
          </p>
        ) : (
          schedules.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-sand bg-white p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{s.title}</span>
                <span className="text-xs text-muted">
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted">
                {s.daysOfWeek
                  .slice()
                  .sort()
                  .map((d) => DAY_LABELS[d])
                  .join(", ")}{" "}
                · {s.startTime} · {s.durationMin} min · cap {s.capacity} · with{" "}
                {s.instructor.name}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upcoming occurrences */}
      <h2 className="mt-10 font-display text-lg text-forest">
        Upcoming sessions
      </h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-sand bg-white">
        {occurrences.length === 0 ? (
          <p className="p-5 text-sm text-muted">
            No upcoming sessions. Use “Generate upcoming sessions”.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Booked</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {occurrences.map((o) => (
                <tr key={o.id} className="border-t border-sand">
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {o.startsAt.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-4 py-3 text-muted">{o.title}</td>
                  <td className="px-4 py-3 text-muted">{o.instructor.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {o._count.enrollments}/{o.capacity}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-muted">
                    {o.status.toLowerCase()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/mis/yoga/${o.id}`}
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

      {/* Create schedule */}
      <h2 className="mt-10 font-display text-lg text-forest">
        New class schedule
      </h2>
      <form
        action={createClassSchedule}
        className="mt-3 space-y-4 rounded-xl border border-sand bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Title *
            </label>
            <input
              name="title"
              required
              placeholder="Morning Hatha Yoga"
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Service *
            </label>
            <select
              name="serviceId"
              required
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            >
              {yogaServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Instructor *
            </label>
            <select
              name="instructorId"
              required
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Time
              </label>
              <input
                name="startTime"
                type="time"
                defaultValue="07:00"
                className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Mins
              </label>
              <input
                name="durationMin"
                type="number"
                defaultValue={60}
                className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Cap
              </label>
              <input
                name="capacity"
                type="number"
                defaultValue={20}
                className="w-full rounded-lg border border-sand bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Days
          </label>
          <div className="flex flex-wrap gap-3">
            {DAY_LABELS.map((label, i) => (
              <label
                key={i}
                className="flex items-center gap-1.5 text-sm text-ink"
              >
                <input type="checkbox" name="daysOfWeek" value={i} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button className="rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-ink">
          Create schedule &amp; generate sessions
        </button>
      </form>
    </div>
  );
}
