import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppointmentsTabs } from "@/components/mis/appointments-tabs";
import { createTimeBlock, deleteTimeBlock } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctor time-off" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;
const inputCls = "w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold";

export default async function TimeBlocksPage({ searchParams }: { searchParams: SP }) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  const [providers, blocks] = await Promise.all([
    prisma.staff.findMany({ where: { isActive: true, type: { in: ["DOCTOR", "THERAPIST", "NUTRITIONIST"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.timeBlock.findMany({
      where: { end: { gte: new Date() } },
      include: { staff: { select: { name: true } } },
      orderBy: { start: "asc" },
      take: 50,
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-forest">Appointments</h1>
      <div className="mt-4"><AppointmentsTabs /></div>

      <p className="mt-6 text-sm text-muted">
        Block a doctor&apos;s time for leave, meetings or emergencies. Blocked periods are hidden from booking slots.
      </p>

      {/* New block */}
      <form action={createTimeBlock} className="mt-4 grid gap-3 rounded-xl border border-sand bg-white p-5 sm:grid-cols-2">
        {error === "missing" && <p className="text-xs text-red-600 sm:col-span-2">Please fill in the doctor, date and times.</p>}
        {error === "range" && <p className="text-xs text-red-600 sm:col-span-2">End time must be after the start time.</p>}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Doctor</label>
          <select name="staffId" required className={inputCls} defaultValue="">
            <option value="">Select…</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Date</label>
          <input type="date" name="date" required className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">From</label>
            <input type="time" name="startTime" defaultValue="09:00" required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">To</label>
            <input type="time" name="endTime" defaultValue="17:00" required className={inputCls} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Reason (optional)</label>
          <input name="reason" placeholder="Leave / meeting / emergency…" className={inputCls} />
        </div>
        <button className="rounded-lg bg-forest px-5 py-2 text-sm text-cream hover:bg-ink sm:col-span-2">Add block</button>
      </form>

      {/* Existing blocks */}
      <h2 className="mt-8 font-display text-lg text-forest">Upcoming blocks</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-sand bg-white">
        {blocks.length === 0 ? (
          <p className="p-5 text-sm text-muted">No upcoming time-off.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-medium text-ink">{b.staff.name}</div>
                  <div className="text-xs text-muted">
                    {b.start.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                    {" – "}
                    {b.end.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </div>
                </div>
                <form action={deleteTimeBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="rounded-lg border border-sand px-3 py-1 text-xs text-muted hover:border-red-300 hover:text-red-600">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
