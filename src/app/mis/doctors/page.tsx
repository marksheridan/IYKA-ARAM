import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createStaff } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctors & Staff · IYKA MIS" };

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  DOCTOR:       { bg: "var(--color-mis-blue-light)",   color: "var(--color-mis-blue)" },
  THERAPIST:    { bg: "var(--color-mis-purple-bg)",    color: "var(--color-mis-purple)" },
  INSTRUCTOR:   { bg: "var(--color-mis-success-bg)",   color: "var(--color-mis-success)" },
  NUTRITIONIST: { bg: "var(--color-mis-warning-bg)",   color: "var(--color-mis-warning)" },
};

export default async function DoctorsPage() {
  const user = await requireUser(["ADMIN", "FRONT_DESK"]);
  const isAdmin = user.role === "ADMIN";

  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { appointments: true, classOccurrences: true } } },
  });

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-mis-text)", letterSpacing: "-0.02em" }}>
          Doctors &amp; Staff
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>
          Practitioners shown on the website and bookable in the system.
        </p>
      </div>

      <div className="mis-card overflow-x-auto">
        {staff.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>No staff yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-mis-border-soft)", background: "var(--color-mis-bg)" }}>
                {["Name", "Role", "Specialties", "Appointments", "Classes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-mis-text-soft)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, idx) => {
                const typeStyle = TYPE_COLORS[s.type] ?? { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-[var(--color-mis-bg)]"
                    style={{ borderTop: idx === 0 ? undefined : `1px solid var(--color-mis-border-soft)` }}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: typeStyle.bg, color: typeStyle.color }}>
                          {s.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: "var(--color-mis-text)" }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize" style={{ background: typeStyle.bg, color: typeStyle.color }}>
                        {s.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>
                      {s.specialties.join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums" style={{ color: "var(--color-mis-text-muted)" }}>{s._count.appointments}</td>
                    <td className="px-4 py-3.5 tabular-nums" style={{ color: "var(--color-mis-text-muted)" }}>{s._count.classOccurrences}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isAdmin && (
        <div className="max-w-lg">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-mis-text)" }}>Add a staff member</h2>
          <form action={createStaff} className="mis-card mt-3 space-y-4 p-5">
            <FormField label="Name *">
              <input
                name="name"
                required
                className="mis-input w-full"
              />
            </FormField>
            <FormField label="Role">
              <select name="type" className="mis-input w-full">
                <option value="DOCTOR">Doctor</option>
                <option value="THERAPIST">Therapist</option>
                <option value="INSTRUCTOR">Yoga Instructor</option>
                <option value="NUTRITIONIST">Nutritionist</option>
              </select>
            </FormField>
            <FormField label="Specialties (comma-separated)">
              <input
                name="specialties"
                placeholder="e.g. Functional Medicine, Gut Health"
                className="mis-input w-full"
              />
            </FormField>
            <button
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--color-mis-blue)" }}
            >
              Add staff
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-mis-text)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
