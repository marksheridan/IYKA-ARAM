import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createStaff } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctors & Staff" };

export default async function DoctorsPage() {
  const user = await requireUser(["ADMIN", "FRONT_DESK"]);
  const isAdmin = user.role === "ADMIN";

  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { appointments: true, classOccurrences: true } },
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl text-forest">Doctors &amp; Staff</h1>
      <p className="mt-1 text-sm text-muted">
        Practitioners shown on the website and bookable in the system.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
        {staff.length === 0 ? (
          <p className="p-6 text-sm text-muted">No staff yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Specialties</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Classes</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-sand">
                  <td className="px-4 py-3 text-ink">{s.name}</td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {s.type.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s.specialties.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s._count.appointments}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s._count.classOccurrences}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdmin && (
        <div className="mt-10 max-w-lg">
          <h2 className="font-display text-lg text-forest">Add a staff member</h2>
          <form
            action={createStaff}
            className="mt-3 space-y-3 rounded-xl border border-sand bg-white p-5"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Name *
              </label>
              <input
                name="name"
                required
                className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Role
              </label>
              <select
                name="type"
                className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              >
                <option value="DOCTOR">Doctor</option>
                <option value="THERAPIST">Therapist</option>
                <option value="INSTRUCTOR">Yoga Instructor</option>
                <option value="NUTRITIONIST">Nutritionist</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Specialties (comma-separated)
              </label>
              <input
                name="specialties"
                placeholder="e.g. Functional Medicine, Gut Health"
                className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
            <button className="rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-ink">
              Add staff
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
