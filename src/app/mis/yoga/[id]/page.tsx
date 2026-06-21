import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  markAttendance,
  addAttendee,
  removeAttendee,
  updateOccurrence,
  cancelOccurrence,
} from "../actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  missing: "Please enter the attendee's name and phone.",
  full: "This session is full.",
  already: "That person is already enrolled.",
};

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function OccurrenceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const { id } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  const occ = await prisma.classOccurrence.findUnique({
    where: { id },
    include: {
      instructor: true,
      enrollments: {
        include: { patient: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!occ) {
    return (
      <div>
        <h1 className="font-display text-2xl text-forest">Session not found</h1>
        <Link href="/mis/yoga" className="mt-4 inline-block text-gold">
          ← Yoga sessions
        </Link>
      </div>
    );
  }

  const booked = occ.enrollments.length;
  const seatsLeft = occ.capacity - booked;
  const cancelled = occ.status === "CANCELLED";

  return (
    <div className="max-w-3xl">
      <Link href="/mis/yoga" className="text-sm text-muted hover:text-ink">
        ← Yoga sessions
      </Link>
      <h1 className="mt-3 font-display text-2xl text-forest">{occ.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {occ.startsAt.toLocaleString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}{" "}
        · {occ.durationMin} min · with {occ.instructor.name} ·{" "}
        <span className="capitalize">{occ.status.toLowerCase()}</span>
      </p>
      <p className="mt-1 text-sm font-medium text-ink">
        {booked}/{occ.capacity} booked
        {!cancelled && seatsLeft > 0 ? ` · ${seatsLeft} seats left` : ""}
      </p>

      {error && ERRORS[error] && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERRORS[error]}
        </p>
      )}

      {/* Meeting link + cancel */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <form action={updateOccurrence} className="flex-1">
          <label className="mb-1 block text-sm font-medium text-ink">
            Online meeting link
          </label>
          <div className="flex gap-2">
            <input
              type="hidden"
              name="occurrenceId"
              value={occ.id}
            />
            <input
              name="meetingLink"
              defaultValue={occ.meetingLink ?? ""}
              placeholder="https://meet.google.com/…"
              className="flex-1 rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
            <button className="rounded-lg bg-forest px-4 py-2 text-sm text-cream hover:bg-ink">
              Save
            </button>
          </div>
        </form>
        {!cancelled && (
          <form action={cancelOccurrence}>
            <input type="hidden" name="occurrenceId" value={occ.id} />
            <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50">
              Cancel session
            </button>
          </form>
        )}
      </div>

      {/* Attendees */}
      <h2 className="mt-10 font-display text-lg text-forest">
        Attendees ({booked})
      </h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-sand bg-white">
        {occ.enrollments.length === 0 ? (
          <p className="p-5 text-sm text-muted">No one booked yet.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {occ.enrollments.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div>
                  <div className="text-ink">{e.patient.name}</div>
                  <div className="text-xs text-muted">
                    {e.patient.phone} ·{" "}
                    <span className="capitalize">
                      {e.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {["BOOKED", "ATTENDED", "NO_SHOW"].map((st) => (
                    <form key={st} action={markAttendance}>
                      <input type="hidden" name="enrollmentId" value={e.id} />
                      <input type="hidden" name="occurrenceId" value={occ.id} />
                      <input type="hidden" name="status" value={st} />
                      <button
                        disabled={e.status === st}
                        className="rounded-full border border-sand px-3 py-1 text-xs text-ink hover:border-gold disabled:opacity-40"
                      >
                        {st === "NO_SHOW"
                          ? "No-show"
                          : st.charAt(0) + st.slice(1).toLowerCase()}
                      </button>
                    </form>
                  ))}
                  <form action={removeAttendee}>
                    <input type="hidden" name="enrollmentId" value={e.id} />
                    <input type="hidden" name="occurrenceId" value={occ.id} />
                    <button className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700 hover:bg-red-50">
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add attendee */}
      {!cancelled && seatsLeft > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg text-forest">Add an attendee</h2>
          <form
            action={addAttendee}
            className="mt-3 grid gap-3 rounded-xl border border-sand bg-white p-5 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input type="hidden" name="occurrenceId" value={occ.id} />
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
              placeholder="Phone *"
              className="rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
            <button className="rounded-full bg-forest px-5 py-2 text-sm text-cream hover:bg-ink">
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
